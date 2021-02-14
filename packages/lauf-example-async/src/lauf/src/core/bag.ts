import {
  Action,
  Sequence,
  Bag,
  Source,
  EMPTY,
  isEmpty,
  Unwatch,
  Procedure,
} from "../types";
import { createActionProcedure } from "../util";
import { TreeParams } from "./tree";
import { Store } from "./store";

type QueueParams<T> = Partial<
  TreeParams<ReadonlyArray<T>> & { maxCount: number }
>;

export class Queue<T> extends Store<ReadonlyArray<T>> implements Bag<T> {
  protected readonly _maxCount;
  constructor({
    state = [],
    watchers = [],
    maxCount = Number.MAX_SAFE_INTEGER,
  }: QueueParams<T> = {}) {
    super({ state, watchers });
    this._maxCount = maxCount;
  }
  put(item: T): boolean {
    if (this.state.length >= this._maxCount) {
      return false;
    }
    this.setState([...this.state, item]); //effectively push
    return true;
  }
  take(): T | typeof EMPTY {
    if (this.state.length === 0) {
      return EMPTY;
    }
    const [item, ...newState] = this.state; //effectively shift
    this.setState(newState);
    if (typeof item === "undefined") {
      return EMPTY;
    }
    return item;
  }
  count() {
    return this.state.length;
  }
  maxCount() {
    return this._maxCount;
  }
}

export class Stack<T> extends Queue<T> {
  put(item: T): boolean {
    if (this.state.length >= this._maxCount) {
      return false;
    }
    this.setState([item, ...this.state]); //effectively unshift
    return true;
  }
}

type QueueProcedure<T, Outcome = void, Reaction = any> = Procedure<
  [Queue<T>],
  Outcome,
  Reaction
>;

export function supply<T>(queue: Queue<T>, source: Source<T>): Unwatch {
  return source((item) => queue.put(item));
}

export function* withEventQueue<T, Outcome = void>(
  eventSource: Source<T>,
  queueProcedure: QueueProcedure<T, Outcome>
): Sequence<Outcome> {
  const queue = new Queue<T>();
  const unsubscribe = supply(queue, eventSource);
  try {
    return yield* queueProcedure(queue);
  } finally {
    unsubscribe();
  }
}

export class Take<T> implements Action<T> {
  constructor(readonly queue: Queue<T>) {}
  async act(): Promise<T> {
    while (true) {
      //try to get an item
      const item = this.queue.take();
      if (!isEmpty(item)) {
        return item;
      }
      //block until queue has an item
      await new Promise<void>((resolve) => {
        const unwatch = this.queue.watch(() => {
          if (this.queue.count() > 0) {
            unwatch();
            resolve();
          }
        });
      });
    }
  }
}

export class Put<T> implements Action<void> {
  constructor(readonly queue: Queue<T>, readonly item: T) {}
  async act(): Promise<void> {
    while (true) {
      //try to put an item
      if (this.queue.put(this.item)) {
        return;
      }
      //block until queue has space
      await new Promise<void>((resolve) => {
        const unwatch = this.queue.watch(() => {
          if (this.queue.count() <= this.queue.maxCount()) {
            unwatch();
            resolve();
          }
        });
      });
    }
  }
}

export const take = createActionProcedure(Take);
export const put = createActionProcedure(Put);
