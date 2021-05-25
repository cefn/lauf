import {
  ActionSequence,
  Expiry,
  isExpiry,
  expire,
  raceWait,
  backgroundPlan,
  call,
} from "@lauf/lauf-runner";
import { MessageQueue } from "@lauf/lauf-queue";
import { receive, withQueue, follow } from "@lauf/lauf-runner-primitives";
import {
  AppModel,
  Segment,
  Direction,
  Motion,
  selectHead,
  selectMotion,
  selectSegments,
  selectFruitPos,
  INITIAL_STATE,
  DIRECTION_VECTORS,
  DIRECTION_OPPOSITES,
  STEP_MS,
} from "./domain";
import { isVectorEqual, randomSquare, plus, wrap } from "./util";

export function* mainPlan(appModel: AppModel): ActionSequence<void, any> {
  yield* resetGame(appModel);
  yield* backgroundPlan(inputDirectionRoutine, appModel);
  yield* backgroundPlan(fruitRoutine, appModel);
  yield* backgroundPlan(snakeMotionRoutine, appModel);
  yield* backgroundPlan(snakeCollisionRoutine, appModel);
}

function* resetGame({ gameStore: { edit } }: AppModel) {
  yield* call(edit, (state) => INITIAL_STATE); //return a new state
}

function* snakeMotionRoutine(appModel: AppModel) {
  const { gameStore } = appModel;
  yield* withQueue(
    gameStore,
    selectMotion,
    function* (motionQueue, initialMotion) {
      let motion = initialMotion;
      while (true) {
        if (!motion) {
          //snake is still: just await motion change
          motion = yield* receive(motionQueue);
        } else {
          //snake is moving: await both step timeout AND motion change
          motion = yield* moveUntilMotionChange(appModel, motion, motionQueue);
        }
      }
    }
  );
}

function* moveUntilMotionChange(
  appModel: AppModel,
  motion: Direction,
  motionQueue: MessageQueue<Motion>
): ActionSequence<Motion, any> {
  //promise future change in motion
  const [motionChangePromise] = yield* backgroundPlan(receive, motionQueue);
  while (true) {
    yield* moveSnake(appModel, motion);
    //promise future timeout
    const [expiryPromise] = yield* backgroundPlan(expire, STEP_MS);
    const [ending] = yield* raceWait<Expiry | Motion>([
      motionChangePromise,
      expiryPromise,
    ]);
    if (isExpiry(ending)) {
      //step timeout came first wait again
      continue;
    }
    //motion change finally came
    return ending;
  }
}

function* fruitRoutine(appModel: AppModel) {
  const { gameStore } = appModel;
  const { select } = gameStore;
  yield* follow(gameStore, selectHead, function* (head) {
    const fruitPos = select(selectFruitPos);
    if (isVectorEqual(fruitPos, head.pos)) {
      yield* eatFruit(appModel);
    }
  });
}

/** Handle directions being activated and released (driven by e.g. keypresses, touchscreen drags) */
function* inputDirectionRoutine({
  gameStore: { edit, select },
  inputQueue,
}: AppModel): ActionSequence<never, any> {
  while (true) {
    //block for next instruction
    const [inputDirection, active] = yield* receive(inputQueue);
    const motionDirection = select(selectMotion);
    const { direction: headDirection } = select(selectHead);
    if (active) {
      if (inputDirection === motionDirection) {
        continue; //ignore - no change needed - probably key repeat
      }
      if (inputDirection === DIRECTION_OPPOSITES[headDirection]) {
        continue; //incompatible - can't reverse course
      }
      //set snake in motion
      yield* call(edit, (draft) => {
        draft.motion = inputDirection;
      });
    } else {
      //direction was released
      if (inputDirection !== motionDirection) {
        continue; //ignore release of other directions
      }
      //stop snake
      yield* call(edit, (draft) => {
        draft.motion = null;
      });
    }
  }
}

function* eatFruit({ gameStore }: AppModel) {
  //place new fruit outside snake
  const { edit } = gameStore;
  const { segments } = gameStore.read();
  while (true) {
    const nextPos = randomSquare();
    if (segments.find((segment) => isVectorEqual(nextPos, segment.pos))) {
      continue; //randomise again
    }
    //place fruit at pos
    yield* call(edit, (draft) => {
      draft.score += 1;
      draft.length += 1;
      draft.fruitPos = nextPos;
    });
    return;
  }
}

function* snakeCollisionRoutine(appModel: AppModel) {
  const { gameStore } = appModel;
  yield* follow(gameStore, selectHead, function* (head) {
    const segments = selectSegments(gameStore.read());
    const body = segments.filter((segment) => segment !== head);
    const collision = body.filter((segment) =>
      isVectorEqual(head.pos, segment.pos)
    );
    if (collision.length) {
      yield* resetGame(appModel);
    }
  });
}

function* moveSnake(appModel: AppModel, direction: Direction) {
  const { gameStore } = appModel;
  const head = selectHead(gameStore.read());
  if (head) {
    const pos = wrap(plus(head.pos, DIRECTION_VECTORS[direction]));
    yield* addHead(appModel, { pos, direction });
  }
}

function* addHead({ gameStore: { edit } }: AppModel, head: Segment) {
  yield* call(edit, (draft) => {
    const { length, segments } = draft;
    //add head
    segments.unshift(head);
    //remove tail (unless snake is growing)
    if (length < segments.length) {
      segments.pop();
    }
  });
}

export const _test_game = {
  resetGame,
  eatFruit,
};
