import { BasicWatchable } from "../../src/core/watchable";
import { BasicWatchableValue } from "../../src/core/watchableValue";

describe("BasicWatchable behaviour", () => {
  test("Can create BasicWatchable", () => {
    expect(new BasicWatchable()).toBeDefined();
  });

  /** Expose protected notify() for testing */
  class Notifiable<T> extends BasicWatchable<T> {
    public async doNotify(item: T) {
      return await this.notify(item);
    }
  }

  test("Can watch BasicWatchable", async () => {
    const notifiable = new Notifiable<string>();
    const watcher = jest.fn();
    notifiable.watch(watcher);
    void notifiable.doNotify("foo");
    await Promise.resolve(); // wait one tick for notifications
    expect(watcher).toHaveBeenCalledWith("foo");
  });

  test("Can unwatch BasicWatchable", async () => {
    const notifiable = new Notifiable<string>();
    const watcher = jest.fn();
    const unwatch = notifiable.watch(watcher);
    unwatch();
    void notifiable.doNotify("foo");
    await Promise.resolve(); // wait one tick for notifications
    expect(watcher).not.toHaveBeenCalled();
  });
});

describe("BasicWatchableValue behaviour", () => {
  test("Can create BasicWatchableValue", () => {
    expect(new BasicWatchableValue<string>("foo")).toBeDefined();
    expect(new BasicWatchableValue<number>(3)).toBeDefined();
    expect(new BasicWatchableValue<boolean>(true)).toBeDefined();
    expect(new BasicWatchableValue<unknown[]>([])).toBeDefined();
    expect(new BasicWatchableValue<Record<string, unknown>>({})).toBeDefined();
  });

  test("Can watch BasicWatchableValue", async () => {
    const watchableValue = new BasicWatchableValue<string>("foo");
    const watcher = jest.fn();
    watchableValue.watch(watcher);
    watchableValue.write("bar");
    await Promise.resolve(); // wait one tick for notifications
    expect(watcher).toHaveBeenCalledWith("bar");
  });

  test("Can watch BasicWatchableValue from moment of construction", async () => {
    const watcher = jest.fn();
    const watchers = [watcher];
    const watchableValue = new BasicWatchableValue<string>("foo", watchers);
    await Promise.resolve(); // wait one tick for notifications
    expect(watcher).toHaveBeenCalledWith("foo");
    watcher.mockClear();
    watchableValue.write("bar");
    await Promise.resolve(); // wait one tick for notifications
    expect(watcher).toHaveBeenCalledWith("bar");
  });

  test("Can construct BasicWatchableValue with value", () => {
    const watchableValue = new BasicWatchableValue<string>("foo");
    expect(watchableValue.read()).toBe("foo");
  });
});
