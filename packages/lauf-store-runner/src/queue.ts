import { Action, createActionScript } from "@lauf/lauf-runner";
import { MessageQueue } from "@lauf/lauf-queue";

export class Receive<T> implements Action<T> {
  constructor(readonly queue: MessageQueue<T>) {}
  act() {
    return this.queue.receive();
  }
}

export class Send<T> implements Action<boolean> {
  constructor(readonly queue: MessageQueue<T>, readonly item: T) {}
  act() {
    return this.queue.send(this.item);
  }
}

export const receive = createActionScript(Receive);
export const send = createActionScript(Send);
