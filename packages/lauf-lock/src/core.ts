import { Lock, Release } from "./types";

function arrayWithout<T>(arr: ReadonlyArray<T>, index: number) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

export class BasicLock<T = any> implements Lock {
  protected keys: ReadonlyArray<T | void> = [];
  protected releasePromises: ReadonlyArray<Promise<void>> = [];
  async acquire(key?: T): Promise<Release> {
    while (true) {
      const index = this.keys.indexOf(key);
      if (index === -1) {
        //nobody has lock, issue to yourself and promise to release it
        let release!: Release;
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
        return release;
      } else {
        //await whoever currently has the lock
        await this.releasePromises[index];
      }
    }
  }
}
