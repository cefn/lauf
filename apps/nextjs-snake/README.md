This [Next.js](https://nextjs.org/learn) application demonstrates how to separate business logic from UI rendering and input, which are coupled through a [shared Immutable state](src/state.ts). You can see it running at https://cefn.com/lauf/snake

The [business logic file](src/logic.ts) monitors and sets Immutable state with no React dependencies.

Separately, the [Game UI](src/ui.tsx) wires state changes to rendering and browser input events to control events within the state model.
