import React from "react";
import assert from "assert";
import { render, act } from "@testing-library/react";
import { performSequence, promiseExpiry } from "@lauf/lauf-runner";
import { mainPlan, _test_game } from "../src/game";
import { Game } from "../src/view";
import { SPRITE_SHEET } from "../src/components/graphics";
import { posToStyle } from "../src/components/sprite";
import { Direction, GameState, INITIAL_STATE } from "../src/domain";
import { BasicStore } from "@lauf/lauf-store/src";
import { BasicMessageQueue } from "@lauf/lauf-queue/src";

const { resetGame, eatFruit } = _test_game;

describe.skip("Passing test case  - incompatible jsx config", () => {
  test("Selector tracks fruitPos after replacement", async () => {
    //launch app
    const gameStore = new BasicStore(INITIAL_STATE);
    const inputQueue = new BasicMessageQueue<[Direction, boolean]>();
    const appModel = {
      gameStore,
      inputQueue,
    };
    await performSequence(mainPlan(appModel));
    const { container } = render(<Game {...appModel} />);

    //define routine to validate style-rendered position
    const validateFruitPos = () => {
      const [gridX, gridY] = gameStore.read().fruitPos;
      const fruitSprite = container.querySelector(`[data-testclass="FRUIT"]`);
      assert(fruitSprite !== null);
      const actualStyle = (fruitSprite as HTMLElement).style;
      const expectedStyle = posToStyle({
        gridX,
        gridY,
        spriteName: "FRUIT",
        spriteSheet: SPRITE_SHEET,
      });
      expect(actualStyle).toMatchObject(expectedStyle);
    };

    await act(async () => {
      for (let i = 0; i < 5; i++) {
        for (const direction of ["LEFT", "UP"] as Direction[]) {
          inputQueue.send([direction, true]);
          await promiseExpiry(400);
          inputQueue.send([direction, false]);
        }
      }
      await performSequence(eatFruit(appModel));
      await performSequence(eatFruit(appModel));
    });
    validateFruitPos();
    await act(async () => {
      //GO IN A CIRCLE TO EAT YOURSELF
      for (const direction of [
        "LEFT",
        "UP",
        "RIGHT",
        "DOWN",
        "LEFT",
        "UP",
        "RIGHT",
        "DOWN",
      ] as Direction[]) {
        inputQueue.send([direction, true]);
        inputQueue.send([direction, false]);
      }
    });
    validateFruitPos();
  });
});
