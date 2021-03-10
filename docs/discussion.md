Avoids global store

- eliminate issues of not clearing the store (stack data was never in it)
- separate stores can be created and encapsulated operations over them
