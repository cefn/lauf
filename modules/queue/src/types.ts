/** Function subscribed to be notified of an item T.  */
export type Watcher<T> = (item: T) => unknown;

export interface MessageQueue<T> {
  send: (item: T) => boolean;
  receive: () => Promise<T>;
}
