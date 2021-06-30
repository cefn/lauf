## Lightweight Lock for Mutual Exclusion

[![codecov](https://codecov.io/gh/cefn/lauf/branch/main/graph/badge.svg?token=H4O0Wmvho5&flag=lock)](https://codecov.io/gh/cefn/lauf)

<img src="https://github.com/cefn/lauf/raw/main/vector/logo.png" alt="Logo - Image of Runner" align="left"><br></br>

# Lauf Lock

<sub><sup>Logo - Diego Naive, Noun Project.</sup></sub>
<br></br>

### Install

```
npm install @lauf/lock --save
```

`@lauf/lock` is an implementation of Mutual Exclusion or Mutex. It is incredibly lightweight with no dependencies and is suitable for adoption server-side or client-side in Typescript or Javascript.

To get a lock on a particular key, call `lock.acquire(key)`. The Promise returned will block until every prior requester for that key has already `acquired` and `released` their lock, meaning it's your turn. The promise will then resolve to your very own `Release` function, indicating you have the lock. Finally, call the `Release` function to notify you have given up the lock.

Browse the [API](https://cefn.com/lauf/api/modules/_lauf_lock.html).
