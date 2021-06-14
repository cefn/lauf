import { Lock } from "./types";

function arrayWithout<T>(arr: ReadonlyArray<T>, index: number) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

export class BasicLock<T> implements Lock {
  protected keys: ReadonlyArray<T | void> = [];
  protected releasePromises: ReadonlyArray<Promise<void>> = [];
  acquire = async (key?: T) => {
    let release = null;
    do {
      const index = this.keys.indexOf(key);
      if (index === -1) {
        //nobody has lock, issue to yourself and promise to release it
        const unlockPromise = new Promise<void>((resolve) => {
          release = () => {
            //remove record of lock
            const index = this.keys.indexOf(key);
            this.keys = arrayWithout(this.keys, index);
            this.releasePromises = arrayWithout(this.releasePromises, index);
            resolve();
          };
        });
        //add record of lock and release promise
        this.keys = [...this.keys, key];
        this.releasePromises = [...this.releasePromises, unlockPromise];
        //return callback to release lock
      } else {
        //await whoever currently has the lock
        await this.releasePromises[index];
      }
    } while (release === null);
    return release;
  };
}
