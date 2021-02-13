import { BasicWatchable, BasicWatchableValue } from "../../src/core/watchable";

describe("BasicWatchable behaviour", () => {
  test("Can create BasicWatchable", () => {
    new BasicWatchable();
  });

  test("Can watch BasicWatchable", () => {
    class Notifiable<T> extends BasicWatchable<T> {
      public notify(item: T) {
        return super.notify(item);
      }
    }
    const notifiable = new Notifiable<string>();
    const watcher = jest.fn();
    notifiable.watch(watcher);
    notifiable.notify("foo");
    expect(watcher).toHaveBeenCalledWith("foo");
  });
});

describe("BasicWatchableValue behaviour", () => {
  test("Can create BasicWatchableValue", () => {
    new BasicWatchableValue();
  });

  test("Can watch BasicWatchableValue", () => {
    const watchableValue = new BasicWatchableValue<string>();
    const watcher = jest.fn();
    watchableValue.watch(watcher);
    watchableValue.setValue("foo");
    expect(watcher).toHaveBeenCalledWith("foo");
  });

  test("Can construct BasicWatchableValue with value", () => {
    const watchableValue = new BasicWatchableValue<string>("foo");
    expect(watchableValue.getValue()).toBe("foo");
  });
});
