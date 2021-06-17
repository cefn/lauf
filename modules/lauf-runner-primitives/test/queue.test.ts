import { createQueue } from "@lauf/queue";
import { performPlan, performSequence } from "@lauf/lauf-runner";
import { send, receive } from "@lauf/lauf-runner-primitives";

describe("send,receive behaviour", () => {
  test("Simple send and receive", async () => {
    const queue = createQueue();
    const sendEnding = await performPlan(function* () {
      return yield* send(queue, "foo");
    });
    const receiveEnding = await performPlan(function* () {
      return yield* receive(queue);
    });
    expect(sendEnding).toEqual(true);
    expect(receiveEnding).toEqual("foo");
  });

  test("receive: messages in same order as sent", async () => {
    const queue = createQueue();
    queue.send("foo");
    queue.send("bar");
    queue.send("baz");
    const plan = function* () {
      const first = yield* receive(queue);
      const second = yield* receive(queue);
      const third = yield* receive(queue);
      return [first, second, third];
    };
    const ending = await performPlan(plan);
    expect(ending).toEqual(["foo", "bar", "baz"]);
  });

  test("receive: works before sending", async () => {
    const queue = createQueue();
    const plan = function* () {
      const received = yield* receive(queue);
      return received;
    };
    const endingPromise = performPlan(plan); //don't await
    queue.send("foo");
    const ending = await endingPromise; //now await
    expect(ending).toEqual("foo");
  });

  test("send: returns false on overfilling queue", async () => {
    const maxItems = 2;
    const maxConsumers = Number.MAX_SAFE_INTEGER;
    const queue = createQueue<string>(maxItems, maxConsumers);
    expect(await performSequence(send(queue, "foo"))).toEqual(true);
    expect(await performSequence(send(queue, "bar"))).toEqual(true);
    expect(await performSequence(send(queue, "baz"))).toEqual(false);
  });

  test("receive: throws on oversubscribing queue", () => {
    const maxItems = Number.MAX_SAFE_INTEGER;
    const maxConsumers = 2;
    const queue = createQueue<string>(maxItems, maxConsumers);
    queue.receive();
    queue.receive();
    expect(() => {
      queue.receive();
    }).toThrow();
  });
});
