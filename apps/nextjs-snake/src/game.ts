import {
  ActionSequence,
  Expiry,
  isExpiry,
  expire,
  raceWait,
  backgroundPlan,
} from "@lauf/lauf-runner";
import { Draft } from "@lauf/lauf-store";
import { MessageQueue } from "@lauf/lauf-queue";
import { receive } from "@lauf/lauf-runner-primitives";
import {
  createAppModel,
  AppModel,
  Segment,
  Direction,
  Motion,
  Vector,
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

export function* mainPlan(appModel: AppModel): ActionSequence<AppModel, any> {
  yield* resetGame(appModel);
  yield* backgroundPlan(inputDirectionRoutine, appModel);
  yield* backgroundPlan(fruitRoutine, appModel);
  yield* backgroundPlan(snakeMotionRoutine, appModel);
  yield* backgroundPlan(snakeCollisionRoutine, appModel);
  return appModel;
}

function* resetGame({ edit }: AppModel) {
  yield* edit((state) => INITIAL_STATE);
}

function* snakeMotionRoutine(appModel: AppModel) {
  const { withQueue } = appModel;
  yield* withQueue(selectMotion, function* (motionQueue, initialMotion) {
    let motion = initialMotion;
    while (true) {
      if (!motion) {
        //snake still: await motion change
        motion = yield* receive(motionQueue);
      } else {
        //snake moving: await both step timeout AND motion change
        motion = yield* moveUntilMotionChange(appModel, motion, motionQueue);
      }
    }
  });
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
  const { follow, select } = appModel;
  yield* follow(selectHead, function* (head): ActionSequence<void, any> {
    const fruitPos = yield* select(selectFruitPos);
    if (isVectorEqual(fruitPos, head.pos)) {
      yield* eatFruit(appModel);
    }
  });
}

/** Handle directions being activated and released (driven by keypresses or touchscreen drags) */
function* inputDirectionRoutine({
  edit,
  select,
  inputQueue,
}: AppModel): ActionSequence<never, any> {
  while (true) {
    //block for next instruction
    const [inputDirection, active] = yield* receive(inputQueue);
    const motionDirection = yield* select(selectMotion);
    const { direction: headDirection } = yield* select(selectHead);
    if (active) {
      if (inputDirection === motionDirection) {
        continue; //ignore - no change needed - probably key repeat
      }
      if (inputDirection === DIRECTION_OPPOSITES[headDirection]) {
        continue; //incompatible - can't reverse course
      }
      //set snake in motion
      yield* edit((state) => {
        state.motion = inputDirection;
      });
    } else {
      //direction was released
      if (inputDirection !== motionDirection) {
        continue; //ignore release of other directions
      }
      //stop snake
      yield* edit((state) => {
        state.motion = null;
      });
    }
  }
}

function* eatFruit({ edit }: AppModel) {
  yield* edit((state) => {
    state.score += 1;
    state.length += 1;
    //place new fruit outside snake
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
  const { follow, select } = appModel;
  yield* follow(selectHead, function* (head): ActionSequence<void, any> {
    const segments = yield* select(selectSegments);
    for (const segment of segments) {
      if (segment !== head && isVectorEqual(head.pos, segment.pos)) {
        yield* resetGame(appModel);
      }
    }
  });
}

function* moveSnake(appModel: AppModel, direction: Direction) {
  const { select } = appModel;
  const head = yield* select(selectHead);
  if (head) {
    const pos = wrap(plus(head.pos, DIRECTION_VECTORS[direction]));
    yield* addHead(appModel, { pos, direction });
  }
}

function* addHead({ edit }: AppModel, head: Segment) {
  yield* edit((draftState) => {
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
