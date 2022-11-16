export type SelectivePartial<T, SelectedMembers extends keyof T> = Omit<
  T,
  SelectedMembers
> &
  Partial<Pick<T, SelectedMembers>>;

export type ValueOf<T> = T[keyof T];
