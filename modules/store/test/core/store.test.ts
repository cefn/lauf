import { createStore, Immutable, RootState, Watcher } from "@lauf/store";
import { createStoreSuite, StoreFactory } from "../storeSuite";

const rootStoreFactory: StoreFactory = <State extends RootState>(
  state: Immutable<State>,
  watchers?: ReadonlyArray<Watcher<Immutable<State>>>
) => createStore<State>(state, watchers);

createStoreSuite("Root Store", rootStoreFactory);
