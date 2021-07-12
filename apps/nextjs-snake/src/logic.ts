import { isExpiry, promiseExpiry } from "./util/promise";
import { MessageQueue } from "@lauf/queue";
import { followSelector, withSelectorQueue } from "@lauf/store-follow";
import { isVectorEqual, randomPoint, plus, wrap } from "./util/vector";
import {
  createModel,
  Model,
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
} from "./state";

export function mainPlan(): Model {
  // CREATE MODEL
  const appModel = createModel();

  // SPAWN AGAINST MODEL WITHOUT AWAITING
  inputDirectionRoutine(appModel);
  fruitRoutine(appModel);
  snakeMotionRoutine(appModel);
  snakeCollisionRoutine(appModel);

  // RETURN MODEL
  return appModel;
}

function resetGame({ gameStore }: Model) {
  gameStore.write(INITIAL_STATE);
}

async function snakeMotionRoutine(appModel: Model) {
  const { gameStore } = appModel;
  await withSelectorQueue(
    gameStore,
    selectMotion,
    async function (motionQueue, initialMotion) {
      const { receive } = motionQueue;
      let motion = initialMotion;
      while (true) {
        while (!motion) {
          //snake still: await motion change
          motion = await receive();
        }
        //snake moving: await step timeout OR motion change
        await stepWhileMoving(appModel, motion, motionQueue);
        motion = null;
      }
    }
  );
}

async function stepWhileMoving(
  appModel: Model,
  motion: Motion,
  { receive }: MessageQueue<Motion>
): Promise<void> {
  let motionPromise = null;
  let expiryPromise = null;
  while (motion) {
    // snake is in motion, move one step
    stepSnake(appModel, motion);
    //ensure promises
    motionPromise = motionPromise || receive();
    expiryPromise = expiryPromise || promiseExpiry(STEP_MS);
    // await race between timeout promise and motion change promise
    const ending = await Promise.race([motionPromise, expiryPromise]);
    if (isExpiry(ending)) {
      expiryPromise = null;
    } else {
      motion = ending;
      motionPromise = null;
    }
  }
}

async function fruitRoutine(appModel: Model) {
  const { gameStore } = appModel;
  const { select } = gameStore;
  await followSelector(
    gameStore,
    selectHead,
    async function (head): Promise<void> {
      const fruitPos = select(selectFruitPos);
      if (isVectorEqual(fruitPos, head.pos)) {
        eatFruit(appModel);
      }
    }
  );
}

/** Handle directions being activated and released (driven by keypresses or touchscreen drags) */
async function inputDirectionRoutine(appModel: Model): Promise<never> {
  const { gameStore, inputQueue } = appModel;
  const { receive } = inputQueue;
  const { edit, select } = gameStore;
  while (true) {
    //block for next instruction
    const [inputDirection, active] = await receive(); // newly instructed direction
    const motionDirection = select(selectMotion); // direction currently moving (or undefined if still)
    const { direction: headDirection } = select(selectHead); // direction the head is pointing
    if (active) {
      if (inputDirection === motionDirection) {
        continue; //ignore - no change needed - probably key repeat
      }
      if (inputDirection === DIRECTION_OPPOSITES[headDirection]) {
        continue; //incompatible - can't reverse course
      }
      //set snake in motion
      edit((state) => {
        state.motion = inputDirection;
      });
    } else {
      //direction was released
      if (inputDirection !== motionDirection) {
        continue; //ignore release of other directions
      }
      //stop snake
      edit((state) => {
        state.motion = null;
      });
    }
  }
}

function eatFruit({ gameStore: { edit } }: Model) {
  edit((state, castDraft) => {
    state.score += 1;
    state.length += 1;
    // place new fruit outside snake
    let nextPos = null;
    while (nextPos === null) {
      nextPos = randomPoint();
      for (const segment of state.segments) {
        if (isVectorEqual(nextPos, segment.pos)) {
          nextPos = null; // landed on the snake - try again
          break;
        }
      }
    }
    state.fruitPos = castDraft(nextPos);
  });
}

async function snakeCollisionRoutine(appModel: Model) {
  const { gameStore } = appModel;
  const { select } = gameStore;
  await followSelector(
    gameStore,
    selectHead,
    async function (head): Promise<void> {
      const segments = select(selectSegments);
      for (const segment of segments) {
        if (segment !== head && isVectorEqual(head.pos, segment.pos)) {
          resetGame(appModel);
        }
      }
    }
  );
}

function stepSnake(appModel: Model, direction: Direction) {
  const {
    gameStore: { select },
  } = appModel;
  const head = select(selectHead);
  if (head) {
    const pos = wrap(plus(head.pos, DIRECTION_VECTORS[direction]));
    addHead(appModel, { pos, direction });
  }
}

function addHead({ gameStore: { edit } }: Model, head: Segment) {
  edit((draftState, castDraft) => {
    const { segments } = draftState;
    //add head
    let newSegments = castDraft([head, ...segments]);
    // remove tail (unless snake is growing)
    if (draftState.length < newSegments.length) {
      newSegments = newSegments.slice(0, draftState.length);
    }
    // castDraft workaround (allows mutable widening of readonly Vector)
    draftState.segments = newSegments;
  });
}

export const _test_game = {
  resetGame,
  eatFruit,
};
