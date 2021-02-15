import { Action, createActionProcedure } from "@lauf/lauf-runner";
import { MessageQueue } from "@lauf/lauf-store/types/queue";

class Receive<T> implements Action<T> {
  constructor(readonly queue: MessageQueue<T>) {}
  act() {
    return this.queue.receive();
  }
}

class Send<T> implements Action<boolean> {
  constructor(readonly queue: MessageQueue<T>, readonly item: T) {}
  act() {
    return this.queue.send(this.item);
  }
}

export const receive = createActionProcedure(Receive);
export const send = createActionProcedure(Send);
