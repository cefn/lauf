import { performPlan } from "@lauf/lauf-runner";
import { BasicMessageQueue } from "@lauf/lauf-queue";
import { BasicStore } from "@lauf/lauf-store";
import { editValue, receive } from "@lauf/lauf-store-runner";

import {sum, wrap} from "./util"

export type Vector = [number, number];

interface Segment {
  pos: Vector;
}

interface GameState {
  direction: DirectionName;
  length:number,
  segments: Segment[];
}

export type DirectionName = keyof typeof directionVectors;

// grid is central (zero) square and squares in each direction 
// up to and not including edge
export const gridEdge = 5;
export const gridSpan = 1 + (2 * (gridEdge - 1)); 
export const gridArea = gridSpan * gridSpan;

const directionVectors = {
  left: [-1, 0],
  up: [0, 1],
  right: [1, 0],
  down: [0, -1],
} as const;

const initialState = {
  direction: "down",
  length:1,
  segments: [{ pos: [0, 0] }],
} as const;

export const gameStore = new BasicStore<GameState>(initialState);

export const steerQueue = new BasicMessageQueue<DirectionName>();

export function steer(name: DirectionName) {
  steerQueue.send(name);
}

performPlan(function* mainPlan(){
  while(true){
    const directionName = yield* receive(steerQueue);
    const directionVector = directionVectors[directionName];
    const {segments:[head]} = gameStore.getValue();
    if(head){
      const nextHead = {pos:wrap(sum(head.pos, directionVector))};
      yield* editValue(gameStore, (state) => {
        state.segments = 
      })
    }
  }
}