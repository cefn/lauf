import {
  createStore,
  createStorePartition,
  Immutable,
  RootState,
  Watcher,
} from "@lauf/lauf-store/src";
import { createDeferredMock } from "../util";
import { createStoreSuite, StoreFactory } from "./storeSuite";

/** TEST PARTITIONS AS A GENERAL STORE */

/** Creates a store as an object property in a parent store. */
const partitionedMapStoreFactory: StoreFactory = <ChildState extends RootState>(
  childState: Immutable<ChildState>,
  watchers?: ReadonlyArray<Watcher<ChildState>>
) => {
  interface ParentState {
    foo: ChildState;
  }
  const parentState: Immutable<ParentState> = { foo: childState } as const;
  const parentStore = createStore<ParentState>(parentState);
  const childStore = createStorePartition(parentStore, "foo", watchers);
  return childStore;
};

/** Creates a store as an array entry in a parent store. */
const partitionedListStoreFactory: StoreFactory = <
  ChildState extends RootState
>(
  childState: Immutable<ChildState>,
  watchers?: ReadonlyArray<Watcher<ChildState>>
) => {
  type ParentState = [ChildState];
  const parentState: Immutable<ParentState> = [childState] as const;
  const parentStore = createStore<ParentState>(parentState);
  const childStore = createStorePartition(parentStore, 0, watchers);
  return childStore;
};

createStoreSuite("Partitioned Object Store", partitionedMapStoreFactory);
createStoreSuite("Partitioned Array Store", partitionedListStoreFactory);

/** TEST PARTITIONS INTERACTIONS WITH THEIR PARENT */

describe("Parent Stores and Child Store Partitions", () => {
  interface ParentState {
    partition: {
      roses: "red" | "white";
    };
    other: {
      violets: "blue" | "purple";
    };
  }

  type ChildState = ParentState["partition"];

  function createPartitionedStores() {
    const parentStore = createStore<ParentState>({
      partition: { roses: "red" },
      other: { violets: "blue" },
    });
    const childStore = createStorePartition(parentStore, "partition");
    return {
      parentStore,
      childStore,
    };
  }
  test("Child watchers notified of parent store assignments inside partition", async () => {
    const { deferred, deferredResolve } = createDeferredMock<ChildState>();
    const { parentStore, childStore } = createPartitionedStores();
    childStore.watch(deferredResolve);
    parentStore.edit((draft) => {
      draft.partition.roses = "white";
    });
    expect(await deferred).toBe(childStore.read());
  });

  test("Child watchers not notified of parent store assignments outside partition", async () => {
    const watcher = jest.fn();
    const { parentStore, childStore } = createPartitionedStores();
    childStore.watch(watcher);
    parentStore.edit((draft) => {
      draft.other.violets = "purple";
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(watcher).not.toHaveBeenCalled();
  });

  test("Parent watchers notified of child store assignments inside partition", async () => {
    const { deferred, deferredResolve } = createDeferredMock<ParentState>();
    const { parentStore, childStore } = createPartitionedStores();
    parentStore.watch(deferredResolve);
    childStore.edit((draft) => (draft.roses = "white"));
    expect(await deferred).toBe(parentStore.read());
  });

  test("Parent watchers notified if child store overwrites partition", async () => {
    const { deferred, deferredResolve } = createDeferredMock<ParentState>();
    const { parentStore, childStore } = createPartitionedStores();
    parentStore.watch(deferredResolve);
    childStore.write({ roses: "white" });
    expect(await deferred).toBe(parentStore.read());
  });

  test("Child select and Parent select results correspond", () => {
    const { parentStore, childStore } = createPartitionedStores();
    expect(childStore.select((state) => state.roses)).toBe(
      parentStore.select((state) => state.partition.roses)
    );
  });
});
