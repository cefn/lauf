import { Command } from "@lauf/stepmachine";
import { RootState } from "@lauf/store";
import { SelectivePartial } from "../util";

/** Records a yielded command, its return value and snapshots at specific lifecycle points. */
export interface Moment<
  Op extends (...args: any[]) => any,
  State extends RootState
> {
  commanded: Command<Op>;
  returned: Awaited<ReturnType<Op>>;
  snapshots: {
    /** Before calling next on the generator, (yielding the next Command through step() ). */
    afterPrevious: State;
    /** After command is yielded, but before performing the sync or async command (to get a Return value). */
    afterCommanded: State;
    /** After sync or async operation has returned a value and any returned Promise has resolved. */
    afterResolved: State;
  };
}

/** Allow CurrentMoment to be half-complete (after command issued, before return resolved) */
export type CurrentMoment<
  Op extends (...args: any[]) => any,
  State extends RootState
> = Omit<Moment<Op, State>, "snapshots" | "returned"> & {
  returned?: Moment<Op, State>["returned"];
  snapshots: Omit<Moment<Op, State>["snapshots"], "afterResolved"> & {
    afterResolved?: Moment<Op, State>["snapshots"]["afterResolved"];
  };
};

/** A History is an array of Moments, with the last being a
(partially-populated) CurrentMoment 
 */
export type History<
  Op extends (...args: any[]) => any,
  State extends RootState
> = [...Moment<Op, State>[], ...([CurrentMoment<Op, State>] | [])];

/** Create an empty (but correctly typed) History value */
export function initHistory<
  Op extends (...args: any[]) => any,
  State extends RootState
>(): History<Op, State> {
  return [];
}
