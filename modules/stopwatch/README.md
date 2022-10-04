The stopwatch package defines data structures to record calls to Iterators and the resulting responses. This means that sequences of calls and the responses they prompt can be recorded, paused and replayed.

The work was motivated by coroutine systems (such as redux-saga) in which generators yield instructions and are resumed later with the resulting value to define orchestration. By recording the inputs from client actions or the outcomes from async operations, they can then be replayed without an client or async layer repeating the underlying actions.
