import { Store } from "./src/core/store";
import { Selector, Watchable, Procedure } from "./src/types";

export function withBlockingSelector<In, Out>(
  store: Store<In>,
  procedure: Procedure<[Procedure<[Selector<In, Out>], Out>], Out>
) {}
