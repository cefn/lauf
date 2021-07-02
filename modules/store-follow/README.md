## Lightweight Monitoring of Application State

[![codecov](https://codecov.io/gh/cefn/lauf/branch/main/graph/badge.svg?token=H4O0Wmvho5&flag=store-follow)](https://codecov.io/gh/cefn/lauf)

<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf Store Follow

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

### Install

```
npm install @lauf/store-follow --save
```

`@lauf/store-follow` provides simple async monitoring primitives to trigger business logic when application state changes. It builds upon [@lauf/store](https://www.npmjs.com/package/@lauf/store), (a simple substitute for Flux/Redux based on [Immer](https://immerjs.github.io/immer/)).

To find out more;

- Browse the [API](https://cefn.com/lauf/api/modules/_lauf_store_follow.html)
- See how [followSelector](https://cefn.com/lauf/api/modules/_lauf_store_follow.html#followselector) is used in the [Noredux Async](https://github.com/cefn/lauf/tree/main/apps/noredux-async) app
- See how [followSelector](https://cefn.com/lauf/api/modules/_lauf_store_follow.html#followselector) and [withSelectorQueue](https://cefn.com/lauf/api/modules/_lauf_store_follow.html#withselectorqueue) primitives are used in the [Lauf Snake app](https://github.com/cefn/lauf/blob/main/apps/nextjs-snake/src/game.ts) example.
- Look at the [100% test coverage](https://github.com/cefn/lauf/tree/main/modules/store-follow/test)
