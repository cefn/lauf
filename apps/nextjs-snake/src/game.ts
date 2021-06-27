import { isExpiry, promiseExpiry } from "./delay";
import { MessageQueue } from "@lauf/queue";
import { followSelector, withSelectorQueue } from "@lauf/store-follow";
import {
  createAppModel,
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

export function mainPlan(): AppModel {
  const appModel = createAppModel();
  resetGame(appModel);
  //SPAWN WITHOUT AWAITING
  inputDirectionRoutine(appModel);
  fruitRoutine(appModel);
  snakeMotionRoutine(appModel);
  snakeCollisionRoutine(appModel);
  return appModel;
}

function resetGame({ gameStore }: AppModel) {
  gameStore.write(INITIAL_STATE);
}

async function snakeMotionRoutine(appModel: AppModel) {
  const { gameStore } = appModel;
  const { edit } = gameStore;
  await withSelectorQueue(
    gameStore,
    selectMotion,
    async function (motionQueue, initialMotion) {
      const { receive } = motionQueue;
      let motion = initialMotion;
      while (true) {
        if (!motion) {
          //snake still: await motion change
          motion = await receive();
        } else {
          //snake moving: await both step timeout AND motion change
          motion = await moveUntilMotionChange(appModel, motion, motionQueue);
        }
      }
    }
  );
}

async function moveUntilMotionChange(
  appModel: AppModel,
  motion: Direction,
  motionQueue: MessageQueue<Motion>
): Promise<Motion> {
  const { receive } = motionQueue;
  // promise future change in motion (don't await it yet)
  const motionChangePromise = receive();
  while (true) {
    // snake is in motion so move one step
    moveSnake(appModel, motion);
    // promise future timeout for next snake step (don't await it yet)
    const expiryPromise = promiseExpiry(STEP_MS);
    // Finally await Promise.race between step timeout and motion change
    const ending = await Promise.race([motionChangePromise, expiryPromise]);
    if (isExpiry(ending)) {
      //step timeout came, do another snake step
      continue;
    }
    //motion change came! return new motion state to caller
    return ending;
  }
}

async function fruitRoutine(appModel: AppModel) {
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
async function inputDirectionRoutine(appModel: AppModel): Promise<never> {
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

function eatFruit(appModel: AppModel) {
  const { gameStore } = appModel;
  const { edit } = gameStore;
  edit((state, castDraft) => {
    state.score += 1;
    state.length += 1;
    // place new fruit outside snake
    let nextPos = null;
    while (nextPos === null) {
      nextPos = randomSquare();
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

async function snakeCollisionRoutine(appModel: AppModel) {
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

function moveSnake(appModel: AppModel, direction: Direction) {
  const { gameStore } = appModel;
  const { select } = gameStore;
  const head = select(selectHead);
  if (head) {
    const pos = wrap(plus(head.pos, DIRECTION_VECTORS[direction]));
    addHead(appModel, { pos, direction });
  }
}

function addHead({ gameStore: { edit } }: AppModel, head: Segment) {
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
