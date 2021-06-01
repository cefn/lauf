<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf Store

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

`@lauf/lauf-store` provides a minimal reactive state-management solution, a simple substitute for Flux/Redux based on [Immer](https://immerjs.github.io/immer/).

It is incredibly lightweight and suitable for adoption with almost any server-side or client-side framework in Typescript or Javascript.

A React binding is provided by the [@lauf/lauf-store-react](https://github.com/cefn/lauf/tree/main/modules/lauf-store-react) package, but in the simplest case you can define a new application state, track changes and make edits as below...

```typescript
//Optionally use typescript to define a type for your Store
export interface AppState {
  color: [number, number, number];
}

//Create the store
const store = new BasicStore<AppState>({
  color: [0, 0, 0],
});

//watch for changes
store.watch((state) => console.log(state));

//Change the color - this will automatically call console.log with your updated app state
store.edit((draft) => {
  draft.color = [255, 0, 0];
});
```

Visit [@lauf/lauf-store-react](https://github.com/cefn/lauf/tree/main/modules/lauf-store-react) to learn about `useSelected()` which can refresh React components when only a selected part of your state changes.

For example, an RGB color state like the one shown above is demonstrated in our Reactive NextJS [ColorMixer](https://github.com/cefn/lauf/tree/main/apps/nextjs-mixer) Single Page App.
