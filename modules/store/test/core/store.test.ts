import { createStore, Immutable, RootState, Watcher } from "@lauf/store";
import { StoreFactory, createStoreSuite } from "./storeSuite";

const rootStoreFactory: StoreFactory = <State extends RootState>(
  state: Immutable<State>,
  watchers?: ReadonlyArray<Watcher<Immutable<State>>>
) => createStore<State>(state, watchers);

createStoreSuite("Root Store", rootStoreFactory);
