# `Actions`, `ActionSequences` and `planOfAction`

Lauf facilitates clean separation from the UI for sync and async business logic, and facilitates debugging and testing for apps with complex eventing and state-change propagation.

It introduces the minimum of concepts and structures to achieve this, allowing the regular `async`/`await` coding style to be used for Lauf applications with minor modifications.

## Action

The central concept in Lauf is the `Action`. An action defines what should happen, and what you should get back, much like a function.

<!-- prettier-ignore-start -->
```typescript
{ act: () => prompt("What is your name?"); }
```
<!-- prettier-ignore-end -->

Here is Lauf's type definition for `Action`...

```typescript
export interface Action<Reaction> {
  act: () => Reaction | Promise<Reaction>;
}
```

In the examples below we will see how the `planOfAction` adapter in Lauf enables an `Action` to be used **_as_** a function. Your code can then continue to be written in the style of normal `async`/`await` code.

Coding with `Actions` (instead of calling functions directly) means key steps and their parameters are inspectable and the context and timing of execution can be decided separately. In this way, testing and debugging middleware can intervene in your control flow without changing your coding style.

The rest of this document uses working tutorial examples to explain the approach. After reading the explanations, you can browse the source code and tests of each example [here](./examples/index).

## ActionPlans, ActionSequences

For an async action or user interaction to be carried out, you
`yield` an **_Action_** from an **_ActionPlan_**.

**_ActionPlans_** are just [Typescript generator functions](https://basarat.gitbook.io/typescript/future-javascript/generators). Idiomatic Lauf plans are readable and testable and they ensure proper typings for the results of Actions. They look like this...

```typescript
function* idiomaticPlan(): ActionSequence {
  const name = yield* promptUser("What is your full name?");
  yield* alertUser(`Pleased to meet you, ${name}!`);
}
```

Lauf will run each **_Action_** in the **_ActionSequence_** for you and get its **_Reaction_**. It will halt your plan until the **_Reaction_** is available. At that point, the `yield*` expression will be set to the value of the **_Reaction_** and the plan resumes.

## Minimal Examples

Lets begin by exploring some minimal Lauf **_ActionSequences_** with **_inline actions_**. We don't normally use inline actions as they are verbose and not type-safe. However, this code does work and shows how simple the approach really is.

This example uses [Window.prompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt). The plan is halted until a name is entered in the prompt. When it resumes the user's response is stored as `name` and used to sequence another action.

```typescript
function* simplePlan(): ActionSequence {
  const name = yield { act: () => prompt("What is your full name?") };
  yield { act: () => alert(`Pleased to meet you, ${name as string}!`) };
}
```

Here is a more complex plan with inline Actions. It shows how a complex sequence can be understood as a single traceable and synchronous flow rather than broken up across Action Constants, Creators, Thunks, Reducers, Combined Reducers and Middleware...

```typescript
function* dialogPlan(): ActionSequence {
  let name = null;
  let message = "What is your full name?";
  while (name === null) {
    name = yield { act: () => prompt(message) };
    const nameCount = name.split(" ").length;
    if (nameCount === 0) {
      message = "I'm sorry, you can't be anonymous";
      name = null;
    }
    if (nameCount == 1) {
      message = "What are you, a celebrity? Enter a first and last name";
      name = null;
    } else {
      break;
    }
  }
  const [first, last] = (name as string).split(" ");
  yield { act: () => alert(`Pleased to meet you, ${first}!`) };
}
```

## Concepts: Action Classes

In the examples above, Actions were created inline in the code to illustrate the principles. However, in regular Lauf code this is unusual because code is easier to read and type-safe by adding just a bit more structure.

In idiomatic Lauf, the _Window.prompt_ capability would be embedded in an ActionPlan by creating an Action class, then transforming the class into a plan using `planOfAction()` as shown below.

```typescript
class PromptUser implements Action<string> {
  constructor(readonly message: string) {}
  act() {
    return prompt(this.message);
  }
}
export const promptUser = planOfAction(PromptUser);
```

We can use a [delegating yield](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*), which looks like `yield*`, to hand off to our new `promptUser` plan from any other plan.

Here is the earlier example again. You can see the delegating yield from `idiomaticPlan` to `promptUser(message)`...

```typescript
function* idiomaticPlan(): ActionSequence {
  const name = yield* promptUser("What is your full name?");
  yield* alertUser(`Pleased to meet you, ${name}!`);
}
```

The `promptUser(message)` plan has inherited all the arguments and typings of the PromptUser class. It accepts arguments matching with the class's constructor arguments. When running, it will yield a single action to Lauf (`new PromptUser(message)`) and wait for the Reaction to come back.

On completion `promptUser` will return the properly typed `string` that Lauf received from the instance's `act()` method. We no longer have to cast the **_Reaction_** with `as string` before assigning it to `name` as per the earlier `simplePlan()` and `dialogPlan()` examples.

Using `planOfAction` instead of inline actions has made our code easier to read and type-safe.

## 'Advanced' Lauf Programming : Performers and Testing

There is another huge benefit of creating a class and wrapping it in `planOfAction()`. The **_Action_** configuration is now stored as named properties, and passed by readonly value, not by closure reference. In this way we can inspect a `PromptUser` instance at any time. We can use this to inspect the `message` as part of a test.

To understand how Lauf testing can be used to inspect **_Actions_** and their **_Reactions_**, we will peek under the hood of Lauf.

Lauf runners are actually implemented using a **_Performer_**. These asynchronous generator functions are the inverse of the **_ActionPlan_** that a Lauf user writes. While ActionPlans yield **_Actions_**, and consume **_Reactions_**, a **_Performer_** consumes **_Actions_**, and yields **_Reactions_**.

The default **_Performer_** in Lauf is the `actor`. Here is its actual implementation. It just calls the `act()` function of your **_Action_**, and yields the resulting **_Reaction_**.

```typescript
export const actor: Performer<never, any> = async function* () {
  let action = yield;
  while (true) {
    const reaction = await action.act();
    action = yield reaction;
  }
};
```

Having pluggable **_Performers_** makes tests trivial to write. We simply replace `actor` with a test **_Performer_**. This **_Performer_** can intercept **_Actions_** and **_Reactions_** to test them, and insert mocks if instructed.

You don't have to implement test performers directly. They are trivial to create using utilities from [lauf-runner-trial](https://github.com/cefn/lauf/blob/main/modules/lauf-runner-trial/src/perform.ts).

Once our earlier `dialogPlan()` example is rewritten to use `promptUser` (which creates instances of `PromptUser`) we can write the test below to look out for the matching action...

```typescript
test("dialogPlan() prompts for name", async () => {
  await directSequence(
    dialogPlan(),
    performUntilActionFulfils(
      createActionMatcher(new Prompt("What is your full name?: "))
    )
  );
});
```

We can go further, introducing a mock performer (to fake a reaction from the user) combined with a matcher performer (to check the resulting action)...

```typescript
test("dialogPlan() challenges single names", async () => {
  await directSequence(
    dialogPlan(),
    performUntilActionFulfils(
      createActionMatcher(
        new Prompt(
          "What?! Are you a celebrity or something, Sting? Enter a first and last name: "
        )
      ),
      performWithMocks([[new Prompt("What is your full name?: "), "Sting"]])
    )
  );
});
```
