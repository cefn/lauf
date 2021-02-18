import { BasicMessageQueue } from "@lauf/lauf-store/core/queue";
import { send, receive } from "@lauf/lauf-store-runner/queue";
import { stageScript, stagePerformance } from "@lauf/lauf-runner";

describe("send,receive behaviour", () => {
  test("Simple send and receive", async () => {
    const queue = new BasicMessageQueue();
    const sendEnding = await stageScript(function* () {
      return yield* send(queue, "foo");
    });
    const receiveEnding = await stageScript(function* () {
      return yield* receive(queue);
    });
    expect(sendEnding).toEqual(true);
    expect(receiveEnding).toEqual("foo");
  });

  test("receive: messages in same order as sent", async () => {
    const queue = new BasicMessageQueue();
    queue.send("foo");
    queue.send("bar");
    queue.send("baz");
    const script = function* () {
      const first = yield* receive(queue);
      const second = yield* receive(queue);
      const third = yield* receive(queue);
      return [first, second, third];
    };
    const ending = await stageScript(script);
    expect(ending).toEqual(["foo", "bar", "baz"]);
  });

  test("receive: works before sending", async () => {
    const queue = new BasicMessageQueue();
    const script = function* () {
      const received = yield* receive(queue);
      return received;
    };
    const endingPromise = stageScript(script); //don't await
    queue.send("foo");
    const ending = await endingPromise; //now await
    expect(ending).toEqual("foo");
  });

  test("send: returns false on overfilling queue", async () => {
    const maxItems = 2;
    const maxConsumers = Number.MAX_SAFE_INTEGER;
    const queue = new BasicMessageQueue<string>(maxItems, maxConsumers);
    expect(await stagePerformance(send(queue, "foo"))).toEqual(true);
    expect(await stagePerformance(send(queue, "bar"))).toEqual(true);
    expect(await stagePerformance(send(queue, "baz"))).toEqual(false);
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
