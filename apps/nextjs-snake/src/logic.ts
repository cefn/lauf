import { promiseExpiry } from "./util/promise";
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
  setMotion,
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
  let motionPromise;
  let expiryPromise;
  while (motion) {
    // snake still in motion, move one step
    stepSnake(appModel, motion);
    // ensure step timeout and motion change promises
    motionPromise = motionPromise || receive();
    expiryPromise = expiryPromise || promiseExpiry(STEP_MS);
    // race step timeout and motion change promises
    const winner: string = await Promise.race([
      motionPromise.then(() => "motionChanged"),
      expiryPromise.then(() => "stepDue"),
    ]);
    if (winner === "motionChanged") {
      motion = await motionPromise; // update motion
      motionPromise = null; // dispose promise
    } else if (winner === "stepDue") {
      expiryPromise = null; // dispose promise
    }
  }
}

async function fruitRoutine(appModel: Model) {
  const { gameStore } = appModel;
  await followSelector(
    gameStore,
    selectHead,
    async function (head): Promise<void> {
      const fruitPos = selectFruitPos(gameStore.read());
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
  while (true) {
    //block for next instruction
    const [inputDirection, active] = await receive(); // newly instructed direction
    const gameState = gameStore.read();
    const motionDirection = selectMotion(gameState); // direction currently moving (or undefined if still)
    const { direction: headDirection } = selectHead(gameState); // direction the head is pointing
    if (active) {
      if (inputDirection === motionDirection) {
        continue; //ignore - no change needed - probably key repeat
      }
      if (inputDirection === DIRECTION_OPPOSITES[headDirection]) {
        continue; //incompatible - can't reverse course
      }
      //set snake in motion
      setMotion(gameStore, inputDirection);
    } else {
      //direction was released
      if (inputDirection !== motionDirection) {
        continue; //ignore release of other directions
      }
      //stop snake
      setMotion(gameStore, null);
    }
  }
}

function eatFruit({ gameStore }: Model) {
  const state = gameStore.read();
  const { score, length } = state;

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

  gameStore.write({
    ...state,
    score: score + 1,
    length: length + 1,
    fruitPos: nextPos,
  });
}

async function snakeCollisionRoutine(appModel: Model) {
  const { gameStore } = appModel;
  await followSelector(
    gameStore,
    selectHead,
    async function (head): Promise<void> {
      const segments = selectSegments(gameStore.read());
      for (const segment of segments) {
        if (segment !== head && isVectorEqual(head.pos, segment.pos)) {
          resetGame(appModel);
        }
      }
    }
  );
}

function stepSnake(appModel: Model, direction: Direction) {
  const { gameStore } = appModel;
  const head = selectHead(gameStore.read());
  if (head) {
    const pos = wrap(plus(head.pos, DIRECTION_VECTORS[direction]));
    addHead(appModel, { pos, direction });
  }
}

function addHead({ gameStore }: Model, head: Segment) {
  const state = gameStore.read();
  let { segments } = state;
  //add head
  segments = [head, ...segments];
  // remove tail (unless snake is growing)
  if (state.length < segments.length) {
    segments = segments.slice(0, state.length);
  }
  gameStore.write({
    ...state,
    segments,
  });
}

export const _test_game = {
  resetGame,
  eatFruit,
};
