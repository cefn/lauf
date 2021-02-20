import { BasicLock } from "@lauf/lauf-lock/src/core";

async function proveLock(key: any | void) {
  const lock = new BasicLock();
  const unlock = await lock.acquire();
  unlock();
}

describe("Can lock using arbitrary reference", () => {
  const validKeys = [undefined, 3, "hello", true, {}, []];

  for (const key of validKeys) {
    test(`Can lock with ${JSON.stringify(key)}`, async () => {
      await proveLock(key);
    });
  }
});

describe("Mutual Exclusion", () => {
  const parallelism = 16;
  const taskTime = 10;

  function promiseDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function randomInteger(bound: number): number {
    return Math.floor(Math.random() * bound);
  }

  /** Insert sequence to array */
  async function pushSequenceTo(arr: string[]) {
    //create two random timestamps
    const [aEventTime, zEventTime] = Array.from({ length: 2 })
      .map(() => randomInteger(taskTime))
      .sort() as [number, number];
    //schedule the events at those timestamps
    const aDelay = aEventTime;
    const zDelay = zEventTime - aEventTime;
    //follow the schedule
    await promiseDelay(aDelay);
    arr.push("A");
    await promiseDelay(zDelay);
    arr.push("Z");
  }

  /** Check that ping,pong is in strict sequence */
  function checkSequencesIn(arr: string[]) {
    for (const [pos, item] of arr.entries()) {
      if (pos % 2 == 0) {
        expect(item).toBe("A");
      } else {
        expect(item).toBe("Z");
      }
    }
  }

  test("Procedures without lock create interleaved results", async () => {
    const pushed: string[] = [];
    //define async procedure without a lock
    async function withoutLock() {
      await pushSequenceTo(pushed);
    }
    //run multiple in 'parallel'
    await Promise.all(Array.from({ length: parallelism }).map(withoutLock));
    console.log(`Without lock: ${JSON.stringify(pushed)}`);

    //some values should be interleaved
    expect(() => checkSequencesIn(pushed)).toThrow();
  });

  test("Procedures with lock have no interleaved results", async () => {
    const pushed: string[] = [];
    //define async procedure WITH a lock
    const lock = new BasicLock();
    async function withLock() {
      const unlock = await lock.acquire();
      await pushSequenceTo(pushed);
      unlock();
    }
    //run multiple in 'parallel'
    await Promise.all(Array.from({ length: parallelism }).map(withLock));
    console.log(`WITH lock: ${JSON.stringify(pushed)}`);

    //no values should be interleaved
    checkSequencesIn(pushed);
  });
});
