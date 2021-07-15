export const INITIAL_STATE = {
  counter: 0,
};

export const increment = (draft) => (draft.counter += 1);

export const decrement = (draft) => (draft.counter -= 1);
