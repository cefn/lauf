import { createStore, Immutable, RootState, Watcher } from "@lauf/store/src";
import { StoreFactory, createStoreSuite } from "./storeSuite";

const rootStoreFactory: StoreFactory = <State extends RootState>(
  state: Immutable<State>,
  watchers?: ReadonlyArray<Watcher<State>>
) => createStore<State>(state, watchers);

createStoreSuite("Root Store", rootStoreFactory);
