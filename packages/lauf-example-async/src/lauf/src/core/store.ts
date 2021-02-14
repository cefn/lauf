import { Immutable } from "./immutable";
import { Tree } from "./tree";

export class Store<T extends Immutable<any> = Immutable<any>> extends Tree<T> {}
