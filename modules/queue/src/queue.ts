import type { MessageQueue } from "./types";
import type { Watcher } from "@lauf/store";

export class BasicMessageQueue<T> implements MessageQueue<T> {
  items: ReadonlyArray<T> = [];
  watchers: ReadonlyArray<Watcher<T>> = [];
  constructor(
    readonly maxItems = Number.MAX_SAFE_INTEGER,
    readonly maxWatchers = Number.MAX_SAFE_INTEGER
  ) {}
  send = (item: T) => {
    if (this.watchers.length) {
      let consumer: Watcher<T>;
      [consumer, ...this.watchers] = this.watchers as [Watcher<T>];
      consumer(item);
      return true;
    }
    if (this.items.length < this.maxItems) {
      this.items = [...this.items, item];
      return true;
    } else {
      return false;
    }
  };
  //TODO add a boolean option here for non-blocking
  receive = () => {
    if (this.items.length) {
      let item: T;
      [item, ...this.items] = this.items as [T];
      return Promise.resolve(item);
    } else if (this.watchers.length < this.maxWatchers) {
      return new Promise<T>((resolve) => {
        this.watchers = [...this.watchers, resolve];
      });
    } else {
      throw new Error(`Queue already has ${this.maxWatchers}`);
    }
  };
}
