import { Action, PathMap, Watchable, Watcher } from "../types";
import { createActionProcedure } from "../util";

import { edit, Editor as Editor } from "./immutable";
import lodashSet from "lodash/set";
import lodashGet from "lodash/get";

export type TreeParams<T> = {
  state: T;
  watchers?: ReadonlyArray<Watcher<T>>;
};

export class Tree<T extends any> implements Watchable<T> {
  protected state!: T;
  watchers: ReadonlyArray<Watcher<T>>;
  constructor({ state, watchers = [] }: TreeParams<T>) {
    this.watchers = watchers;
    this.setState(state);
  }

  setState(state: T) {
    // if (Object.is(state, this.state)) {
    //   return this.state; //ignore
    // }
    this.state = state;
    for (const watcher of this.watchers) {
      watcher(state);
    }
    return state;
  }

  setStatePaths<V>(pathMap: PathMap<V>) {
    return this.editState((draft) => {
      for (const [path, value] of Object.entries(pathMap)) {
        lodashSet(draft as any, path, value);
      }
    });
  }

  getState(): T {
    return this.state;
  }

  getStatePath<V = any>(getPath: string): V {
    return lodashGet(this.state, getPath);
  }

  editState(editor: Editor<T>) {
    const edited = edit(this.state, editor);
    return this.setState(edited);
  }

  watch(watcher: Watcher<T>): () => void {
    this.watchers = [...this.watchers, watcher];
    return () => {
      this.watchers = this.watchers.filter(
        (candidate) => candidate !== watcher
      );
    };
  }
}

export class SetState<T> implements Action<T> {
  constructor(readonly store: Tree<T>, readonly state: T) {}
  act() {
    return this.store.setState(this.state);
  }
}

export class SetStatePath<T, V> implements Action<T> {
  constructor(
    readonly store: Tree<T>,
    readonly setPath: string,
    readonly setValue: V
  ) {}
  act() {
    return this.store.setStatePaths({ [this.setPath]: this.setValue });
  }
}

export class SetStatePaths<T> implements Action<T> {
  constructor(readonly store: Tree<T>, readonly pathMap: PathMap) {}
  act() {
    return this.store.setStatePaths(this.pathMap);
  }
}

export class EditState<T> implements Action<T> {
  constructor(readonly store: Tree<T>, readonly operator: Editor<T>) {}
  act() {
    return this.store.editState(this.operator);
  }
}

export const setState = createActionProcedure(SetState);
export const setStatePath = createActionProcedure(SetStatePath);
export const setStatePaths = createActionProcedure(SetStatePaths);
export const editState = createActionProcedure(EditState);
