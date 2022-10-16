export type Command<Op extends (...args: any[]) => any> = [
  op: Op,
  ...params: Parameters<Op>
];

export type Sequence<
  Ending = void,
  Op extends (...args: any[]) => any = (...args: unknown[]) => unknown
> = Generator<Command<Op>, Ending, Awaited<ReturnType<Op>>>;

export type Plan<
  Ending = void,
  Op extends (...args: any[]) => any = (...args: unknown[]) => unknown
> = () => Sequence<Ending, Op>;
