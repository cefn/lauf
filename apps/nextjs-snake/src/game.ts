import {
  ActionSequence,
  Expiry,
  isExpiry,
  expire,
  background,
  raceWait,
} from "@lauf/lauf-runner";
import { Store, Draft } from "@lauf/lauf-store";
import { MessageQueue } from "@lauf/lauf-queue";
import {
  receive,
  edit,
  withChangeQueue,
  followStoreSelector,
  CONTINUE,
} from "@lauf/lauf-runner-primitives";
import {
  AppModel,
  GameState,
  Segment,
  Direction,
  Motion,
  selectHead,
  selectMotion,
  INITIAL_STATE,
  DIRECTION_VECTORS,
  DIRECTION_OPPOSITES,
  STEP_MS,
  selectFruitPos,
  createAppModel,
  Vector,
} from "./domain";
import { isVectorEqual, randomSquare, plus, wrap } from "./util";

export function* mainPlan() {
  const appModel = createAppModel();
  yield* resetGame(appModel);
  yield* background(inputDirectionRoutine(appModel));
  yield* background(fruitRoutine(appModel));
  yield* background(snakeMotionRoutine(appModel));
  yield* background(snakeCollisionRoutine(appModel));
  return appModel;
}

function* resetGame({ gameStore }: AppModel) {
  yield* edit(gameStore, (state) => INITIAL_STATE);
}

function* snakeMotionRoutine(appModel: AppModel) {
  const { gameStore } = appModel;
  yield* withChangeQueue(
    gameStore,
    selectMotion,
    function* (motionQueue, initialMotion) {
      let motion = initialMotion;
      while (true) {
        if (!motion) {
          //snake still: awaiting motion change
          motion = yield* receive(motionQueue);
        } else {
          //snake moving: run step procedure WHILE awaiting motion change
          motion = yield* moveUntilMotionChange(gameStore, motion, motionQueue);
        }
      }
    }
  );
}

function* moveUntilMotionChange(
  gameStore: Store<GameState>,
  motion: Direction,
  motionQueue: MessageQueue<Motion>
): ActionSequence<Motion> {
  //promise future change in motion
  const [motionChangePromise] = yield* background(receive(motionQueue));
  while (true) {
    yield* moveSnake(gameStore, motion);
    //promise future timeout
    const [expiryPromise] = yield* background(expire(STEP_MS));
    const [ending] = yield* raceWait<Expiry | Motion>([
      motionChangePromise,
      expiryPromise,
    ]);
    if (isExpiry(ending)) {
      //step came first wait again
      continue;
    }
    //motion change finally came
    return ending;
  }
}

function* fruitRoutine({ gameStore }: AppModel) {
  yield* followStoreSelector(gameStore, selectHead, function* (head) {
    const fruitPos = gameStore.select(selectFruitPos);
    if (isVectorEqual(fruitPos, head.pos)) {
      yield* eatFruit(gameStore);
    }
    return CONTINUE;
  });
}

/** Handle directions being activated and released (driven by keypresses or touchscreen drags) */
function* inputDirectionRoutine({ gameStore, inputQueue }: AppModel) {
  while (true) {
    //block for next instruction
    const [inputDirection, active] = yield* receive(inputQueue);
    const motionDirection = gameStore.select(selectMotion);
    const { direction: headDirection } = gameStore.select(selectHead);
    if (active) {
      if (inputDirection === motionDirection) {
        continue; //ignore - no change needed - probably key repeat
      }
      if (inputDirection === DIRECTION_OPPOSITES[headDirection]) {
        continue; //incompatible - can't reverse course
      }
      //set snake in motion
      yield* edit(gameStore, (state) => {
        state.motion = inputDirection;
      });
    } else {
      //direction was released
      if (inputDirection !== motionDirection) {
        continue; //ignore release of other directions
      }
      //stop snake
      yield* edit(gameStore, (state) => {
        state.motion = null;
      });
    }
  }
}

function* eatFruit(gameStore: Store<GameState>) {
  yield* edit(gameStore, (state) => {
    state.score += 1;
    state.length += 1;
    //ensure fruit is outside snake
    let nextPos = null;
    while (nextPos === null) {
      nextPos = randomSquare() as Draft<Vector>;
      for (const segment of state.segments) {
        if (isVectorEqual(nextPos, segment.pos)) {
          nextPos = null; //try again
          break;
        }
      }
    }
    state.fruitPos = nextPos;
  });
}

function* snakeCollisionRoutine(appModel: AppModel) {
  const { gameStore } = appModel;
  yield* followStoreSelector(gameStore, selectHead, function* (head) {
    const { segments } = gameStore.read();
    for (const segment of segments) {
      if (segment !== head && isVectorEqual(head.pos, segment.pos)) {
        yield* resetGame(appModel);
      }
    }
    return CONTINUE;
  });
}

function* moveSnake(gameStore: Store<GameState>, direction: Direction) {
  const head = selectHead(gameStore.read());
  if (head) {
    const pos = wrap(plus(head.pos, DIRECTION_VECTORS[direction]));
    yield* addHead(gameStore, { pos, direction });
  }
}

function* addHead(gameStore: Store<GameState>, head: Segment) {
  yield* edit(gameStore, (draftState) => {
    const { segments } = draftState;
    //add head
    let newSegments = [head, ...segments] as Draft<Segment[]>;
    //remove tail (unless snake is growing)
    if (draftState.length < newSegments.length) {
      newSegments = newSegments.slice(0, draftState.length);
    }
    //castDraft workaround (allows mutable widening of readonly Vector)
    draftState.segments = newSegments;
  });
}

export const _test_game = {
  resetGame,
  eatFruit,
};
