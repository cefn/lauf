## Trigger logic on Javascript state changes - with Typescript support

[![codecov](https://codecov.io/gh/cefn/lauf/branch/main/graph/badge.svg?token=H4O0Wmvho5&flag=store-follow)](https://codecov.io/gh/cefn/lauf)

<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf Store Follow

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

### Install

```
npm install @lauf/store-follow --save
```

`@lauf/store-follow` provides simple async monitoring primitives for state changes to trigger business logic [@lauf/store](https://www.npmjs.com/package/@lauf/store) ., (a simple substitute for Flux/Redux based on [Immer](https://immerjs.github.io/immer/)).

Browse the [API](https://cefn.com/lauf/api/modules/_lauf_store_follow.html) or see how [followSelector](https://cefn.com/lauf/api/modules/_lauf_lock.html#followselector) and [withSelectorQueue](https://cefn.com/lauf/api/modules/_lauf_lock.html#withselectorqueue) primitives are used in the [Lauf Snake app](https://github.com/cefn/lauf/blob/main/apps/nextjs-snake/src/game.ts) example.
