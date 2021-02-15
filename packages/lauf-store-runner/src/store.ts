import { Action, createActionProcedure } from "@lauf/lauf-runner";
import { Store } from "@lauf/lauf-store";
import type { Editor, Immutable } from "@lauf/lauf-store/types/immutable";

export class EditValue<T> implements Action<Immutable<T>> {
  constructor(
    readonly store: Store<T>,
    readonly operator: Editor<Immutable<T>>
  ) {}
  act() {
    return this.store.editValue(this.operator);
  }
}

export const editValue = createActionProcedure(EditValue);
