import type { Action, ActionSequence } from "@lauf/lauf-runner";
import type { Performer } from "./types";

type GeneratorFactory<Params extends any[], T, TReturn, TNext> = (
  ...params: Params
) => Generator<T, TReturn, TNext>;

type AsyncGeneratorFactory<Params extends any[], T, TReturn, TNext> = (
  ...params: Params
) => AsyncGenerator<T, TReturn, TNext>;

export function initialiseGenerator<Params extends any[], T, TReturn, TNext>(
  generatorFactory: GeneratorFactory<Params, T, TReturn, TNext>,
  ...params: Params
): [Generator<T, TReturn, TNext>, T] {
  const generator = generatorFactory(...params);
  const generatorResult = generator.next();
  if (generatorResult.done) {
    throw new Error(`Generator from ${generatorFactory} returned immediately`);
  } else {
    return [generator, generatorResult.value];
  }
}

export async function initialiseAsyncGenerator<
  Params extends any[],
  T,
  TReturn,
  TNext
>(
  asyncGeneratorFactory: AsyncGeneratorFactory<Params, T, TReturn, TNext>,
  ...params: Params
): Promise<[AsyncGenerator<T, TReturn, TNext>, T]> {
  const generator = asyncGeneratorFactory(...params);
  const generatorResult = await generator.next();
  if (generatorResult.done) {
    throw new Error(
      `Generator from ${asyncGeneratorFactory} returned immediately`
    );
  } else {
    return [generator, generatorResult.value];
  }
}

export async function* actor<Reaction>(): AsyncGenerator<
  Reaction,
  never,
  Action<Reaction>
> {
  let action;
  let reaction!: Reaction;
  while (true) {
    action = yield reaction;
    reaction = await action.act();
  }
}
