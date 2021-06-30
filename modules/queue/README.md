## Lightweight Message Queue

[![codecov](https://codecov.io/gh/cefn/lauf/branch/main/graph/badge.svg?token=H4O0Wmvho5&flag=queue)](https://codecov.io/gh/cefn/lauf)

<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf Queue

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

### Install

```
npm install @lauf/queue --save
```

`@lauf/queue` provides a minimal in-memory `MessageQueue` solution. It is incredibly lightweight with no dependencies and is suitable for adoption server-side or client-side in Typescript or Javascript.

A `MessageQueue` is like a mailbox. Your `async` code can await `queue.receive()` until the next message is available. In this way, one or more workers can consume and process bespoke application events in strict sequence.

For applications using `@lauf/store`, the [@lauf/store-follow](https://www.npmjs.com/package/@lauf/store-follow) package can be used to create a `MessageQueue` notifying changes to a `Selector`.

Browse the [API](https://cefn.com/lauf/api/modules/_lauf_queue.html).
