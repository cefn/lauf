import React from "react";
import assert from "assert";
import { render, act } from "@testing-library/react";
import { promiseExpiry } from "../src/delay";
import { mainPlan, _test_game } from "../src/game";
import { Game } from "../src/view";
import { SPRITE_SHEET } from "../src/components/graphics";
import { posToStyle } from "../src/components/sprite";
import { Direction } from "../src/domain";

const { resetGame, eatFruit } = _test_game;

describe.skip("Passing test case  - incompatible jsx config", () => {
  test("Selector tracks fruitPos after replacement", async () => {
    // launch app
    const appModel = mainPlan();
    const { gameStore, inputQueue } = appModel;
    const { container } = render(<Game {...appModel} />);

    // define routine to validate style-rendered position
    const validateFruitPos = () => {
      const [gridX, gridY] = gameStore.read().fruitPos;
      const fruitSprite = container.querySelector(`[data-testclass="FRUIT"]`);
      assert(fruitSprite !== null);
      const actualStyle = (fruitSprite as HTMLElement).style;
      const expectedStyle = posToStyle({
        gridX,
        gridY,
        spriteName: "FRUIT",
        spriteSheet: SPRITE_SHEET
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
      await eatFruit(appModel);
      await eatFruit(appModel);
    });
    validateFruitPos();
    await act(async () => {
      // GO IN A CIRCLE TO EAT YOURSELF
      for (const direction of [
        "LEFT",
        "UP",
        "RIGHT",
        "DOWN",
        "LEFT",
        "UP",
        "RIGHT",
        "DOWN"
      ] as Direction[]) {
        inputQueue.send([direction, true]);
        inputQueue.send([direction, false]);
      }
    });
    validateFruitPos();
  });
});
