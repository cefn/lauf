import { promiseExpiry } from "../src/core/delay";

const promiseCriterion = async function (
  criterion: () => boolean,
  timeout: number = 500
) {
  const start = new Date().getTime();
  while (!criterion() && new Date().getTime() - start < timeout) {
    await promiseExpiry(1);
  }
};
