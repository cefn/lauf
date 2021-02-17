import { BasicMessageQueue } from "@lauf/lauf-store/core/queue";
import { send, receive } from "@lauf/lauf-store-runner/queue";
import { executeProcedure, executeSequence } from "@lauf/lauf-runner";

describe("send,receive behaviour", () => {
  test("Simple send and receive", async () => {
    const queue = new BasicMessageQueue();
    const sendOutcome = await executeProcedure(function* () {
      return yield* send(queue, "foo");
    });
    const receiveOutcome = await executeProcedure(function* () {
      return yield* receive(queue);
    });
    expect(sendOutcome).toEqual(true);
    expect(receiveOutcome).toEqual("foo");
  });

  test("receive: messages in same order as sent", async () => {
    const queue = new BasicMessageQueue();
    queue.send("foo");
    queue.send("bar");
    queue.send("baz");
    const procedure = function* () {
      const first = yield* receive(queue);
      const second = yield* receive(queue);
      const third = yield* receive(queue);
      return [first, second, third];
    };
    const outcome = await executeProcedure(procedure);
    expect(outcome).toEqual(["foo", "bar", "baz"]);
  });

  test("receive: works before sending", async () => {
    const queue = new BasicMessageQueue();
    const procedure = function* () {
      const received = yield* receive(queue);
      return received;
    };
    const outcomePromise = executeProcedure(procedure); //don't await
    queue.send("foo");
    const outcome = await outcomePromise; //now await
    expect(outcome).toEqual("foo");
  });

  test("send: returns false on overfilling queue", async () => {
    const maxItems = 2;
    const maxConsumers = Number.MAX_SAFE_INTEGER;
    const queue = new BasicMessageQueue<string>(maxItems, maxConsumers);
    expect(await executeSequence(send(queue, "foo"))).toEqual(true);
    expect(await executeSequence(send(queue, "bar"))).toEqual(true);
    expect(await executeSequence(send(queue, "baz"))).toEqual(false);
  });

  test("receive: throws on oversubscribing queue", () => {
    const maxItems = Number.MAX_SAFE_INTEGER;
    const maxConsumers = 2;
    const queue = new BasicMessageQueue<string>(maxItems, maxConsumers);
    queue.receive();
    queue.receive();
    expect(() => {
      queue.receive();
    }).toThrow();
  });
});
