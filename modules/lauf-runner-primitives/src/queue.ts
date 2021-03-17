import { Action, planOfAction } from "@lauf/lauf-runner";
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

export const receive = planOfAction(Receive);
export const send = planOfAction(Send);

export class QueuePlans<T> {
  constructor(readonly queue: MessageQueue<T>) {}
  send = (item: T) => send(this.queue, item);
  receive = () => receive(this.queue);
}
