import { Command } from "@lauf/stepmachine";
import { RootState } from "@lauf/store";
import { SelectivePartial } from "../util";

/** Records a yielded command, its return value and a state snapshot before and after async Op has completed. */
export interface Moment<
  Op extends (...args: any[]) => any,
  State extends RootState
> {
  commanded: Command<Op>;
  returned: Awaited<ReturnType<Op>>;
  snapshotBefore: State;
  snapshotAfter: State;
}

/** Halfway Moment (after command issued, before return resolved) */
export type IncompleteMoment<
  Op extends (...args: any[]) => any,
  State extends RootState
> = SelectivePartial<Moment<Op, State>, "returned" | "snapshotAfter">;

/** A History is an array of Moments, with the last Moment sometimes
 * being only partly populated
 */
export type History<
  Op extends (...args: any[]) => any,
  State extends RootState
> = [...Moment<Op, State>[], ...([IncompleteMoment<Op, State>] | [])];

/** Create an empty (but correctly typed) History value */
export function initHistory<
  Op extends (...args: any[]) => any,
  State extends RootState
>(): History<Op, State> {
  return [];
}
