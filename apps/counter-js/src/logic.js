export const INITIAL_STATE = {
  counter: 0,
};

export const increment = (store) => store.edit((draft) => (draft.counter += 1));

export const decrement = (store) => store.edit((draft) => (draft.counter -= 1));
