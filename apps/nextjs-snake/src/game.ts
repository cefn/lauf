import { performSequence } from "@lauf/lauf-runner";
import { BasicMessageQueue } from "@lauf/lauf-queue";
import { BasicStore } from "@lauf/lauf-store";
import { editValue, receive } from "@lauf/lauf-store-runner";

import { plus, wrap } from "./util";
import {
  AppModel,
  GameState,
  DirectionName,
  INITIAL_STATE,
  DIRECTION_VECTORS,
  Segment,
} from "./domain";

export function launchGame() {
  const gameStore = new BasicStore<GameState>(INITIAL_STATE);
  const steerQueue = new BasicMessageQueue<DirectionName>();
  const appModel: AppModel = {
    gameStore,
    steerQueue,
  };
  performSequence(gamePlan(appModel));
  return appModel;
}

function* gamePlan(appModel: AppModel) {
  const { gameStore, steerQueue } = appModel;
  while (true) {
    const directionName = yield* receive(steerQueue);
    const {
      segments: [head],
    } = gameStore.getValue();
    if (head) {
      const pos = wrap(plus(head.pos, DIRECTION_VECTORS[directionName]));
      yield* moveHead(appModel, { pos });
    }
  }
}

function* moveHead({ gameStore }: AppModel, head: Segment) {
  yield* editValue(gameStore, (draftState) => {
    let { segments } = gameStore.getValue() as GameState;
    //add head
    segments = [head, ...segments];
    //remove tail (unless snake is growing)
    if (draftState.length < segments.length) {
      segments = segments.slice(0, draftState.length);
    }
    draftState.segments = segments;
  });
}
