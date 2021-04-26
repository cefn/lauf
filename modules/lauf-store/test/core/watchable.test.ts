import { BasicWatchable, BasicWatchableValue } from "@lauf/lauf-store";

describe("BasicWatchable behaviour", () => {
  test("Can create BasicWatchable", () => {
    new BasicWatchable();
  });

  /** Expose protected notify() for testing */
  class Notifiable<T> extends BasicWatchable<T> {
    public doNotify(item: T) {
      return this.notify(item);
    }
  }

  test("Can watch BasicWatchable", () => {
    const notifiable = new Notifiable<string>();
    const watcher = jest.fn();
    notifiable.watch(watcher);
    notifiable.doNotify("foo");
    expect(watcher).toHaveBeenCalledWith("foo");
  });

  test("Can unwatch BasicWatchable", () => {
    const notifiable = new Notifiable<string>();
    const watcher = jest.fn();
    const unwatch = notifiable.watch(watcher);
    unwatch();
    notifiable.doNotify("foo");
    expect(watcher).not.toHaveBeenCalled();
  });
});

describe("BasicWatchableValue behaviour", () => {
  test("Can create BasicWatchableValue", () => {
    new BasicWatchableValue<string>("foo");
    new BasicWatchableValue<number>(3);
    new BasicWatchableValue<boolean>(true);
    new BasicWatchableValue<Array<any>>([]);
    new BasicWatchableValue<Record<string, any>>({});
  });

  test("Can watch BasicWatchableValue", () => {
    const watchableValue = new BasicWatchableValue<string>("foo");
    const watcher = jest.fn();
    watchableValue.watch(watcher);
    watchableValue.write("bar");
    expect(watcher).toHaveBeenCalledWith("bar");
  });

  test("Can watch BasicWatchableValue from moment of construction", () => {
    const watcher = jest.fn();
    const watchers = [watcher];
    const watchableValue = new BasicWatchableValue<string>("foo", watchers);
    expect(watcher).toHaveBeenCalledWith("foo");
    watcher.mockClear();
    watchableValue.write("bar");
    expect(watcher).toHaveBeenCalledWith("bar");
  });

  test("Can construct BasicWatchableValue with value", () => {
    const watchableValue = new BasicWatchableValue<string>("foo");
    expect(watchableValue.read()).toBe("foo");
  });
});
