import fs from "fs";
const fsPromises = fs.promises;
import { Action, createActionScript } from "@lauf/lauf-runner";

class Read implements Action<Buffer> {
  constructor(readonly filePath: string) {}
  async act() {
    return await fsPromises.readFile(this.filePath);
  }
}

class Write implements Action<void> {
  constructor(readonly filePath: string, readonly data: Uint8Array) {}
  async act() {
    await fsPromises.writeFile(this.filePath, this.data);
  }
}

export const read = createActionScript(Read);
export const write = createActionScript(Write);
