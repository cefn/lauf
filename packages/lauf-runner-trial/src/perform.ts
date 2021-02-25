import type { Action, Performance } from "@lauf/lauf-runner";
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

export async function perform<Ending, Reaction>(
  trigger: Reaction,
  performance: Performance<Ending, Reaction>,
  performer: Performer<Reaction, any> = actor
): Promise<Ending> {
  let [routine, reactionResult] = await initialiseAsyncGenerator(performer);
  //todo 'routine' should be called performance
  try {
    //prime both generators up to first 'yield'
    let actionResult = performance.next(trigger);
    while (!actionResult.done) {
      reactionResult = await routine.next(actionResult.value);
      actionResult = performance.next(reactionResult.value);
    }
    return actionResult.value;
  } catch (error) {
    performance.throw(error);
    throw error;
  } finally {
    console.log("Hit finally");
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
