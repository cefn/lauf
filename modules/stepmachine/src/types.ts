export function step<Op extends (...args: any[]) => any>(
  ...step: [op: Op, ...params: Parameters<Op>]
) {
  return step;
}

type Step<Op extends (...args: any[]) => any> = Parameters<typeof step<Op>>;

export type Sequence<
  Ending = void,
  Op extends (...args: any[]) => any = (...args: unknown[]) => unknown
> = Generator<Step<Op>, Ending, Awaited<ReturnType<Op>>>;

export type Plan<
  Ending = void,
  Op extends (...args: any[]) => any = (...args: unknown[]) => unknown
> = () => Sequence<Ending, Op>;
