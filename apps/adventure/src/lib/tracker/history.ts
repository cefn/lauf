import { Command } from "@lauf/stepmachine";
import { RootState } from "@lauf/store";

/** Records a yielded command, its return value and snapshots at specific lifecycle points. */
export interface Moment<
  Op extends (...args: any[]) => any,
  State extends RootState
> {
  commanded: Command<Op>;
  returned: Awaited<ReturnType<Op>>;
  snapshots: {
    /** Before calling next on the generator, (to yield the next Command through
     * a step() call ). */
    onResumed: State;
    /** After command is yielded, but before performing the sync or async
     * command to populate a Return value. */
    onCommanded: State;
    /** After sync or async operation has returned a value and any returned
     * Promise has resolved. */
    onResolved: State;
  };
}

/** Provide looser IncompleteMoment type (it is half-complete after command
 * issued and before return resolved) */
export type IncompleteMoment<
  Op extends (...args: any[]) => any,
  State extends RootState
> = Omit<Moment<Op, State>, "snapshots" | "returned"> & {
  returned?: never;
  snapshots: Omit<Moment<Op, State>["snapshots"], "onResolved"> & {
    onResolved?: never;
  };
};

/** A History is an array of Moments, with the last being a
(partially-populated) CurrentMoment 
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
