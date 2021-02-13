export interface MessageQueue<T> {
  send: (item: T) => boolean;
  receive: () => Promise<T>;
}
