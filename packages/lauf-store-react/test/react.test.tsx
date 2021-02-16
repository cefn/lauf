/**
 * @jest-environment jsdom
 */

import React from "react";
import { useSelected, useStore } from "../src/react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { Selector, Store } from "@lauf/lauf-store";
import { act } from "react-dom/test-utils";

const planets = ["earth", "mars"] as const;
type Planet = typeof planets[number];
type State = {
  planet: Planet;
  haveAmulet?: boolean;
};
type StoreProps = {
  store: Store<State>;
};

const planetSelector: Selector<State, Planet> = (state) => state.planet;

function chooseNextPlanet(store: Store<State>) {
  store.editValue((draft) => {
    let planetIndex = planets.indexOf(draft.planet);
    planetIndex += 1;
    planetIndex %= planets.length;
    draft.planet = planets[planetIndex] as Planet;
  });
}

function secureAmulet(store: Store<State>) {
  store.editValue((draft) => (draft.haveAmulet = true));
}

function loseAmulet(store: Store<State>) {
  store.editValue((draft) => (draft.haveAmulet = false));
}

const PlanetLabel = ({ planet }: { planet: string }) => (
  <p>This is planet {planet}</p>
);

describe("useStore : initialises, resolves a store", () => {
  test("Store data can be used", async () => {
    const StoreRoot = () => {
      const store = useStore<State>({ planet: "mars" });
      const planet = planetSelector(store.getValue());
      return <PlanetLabel planet={planet} />;
    };
    render(<StoreRoot />);
    await waitFor(() => screen.getByText(/This is planet mars/));
  });
});

describe("useSelected : (re)render using subset of store", () => {
  test("Render count as expected before and after store edits", async () => {
    const rootSpy = jest.fn();
    const branchSpy = jest.fn();

    const Root = () => {
      rootSpy();
      const store = useStore<State>({ planet: "earth" });
      return <Branch store={store} />;
    };

    const Branch = ({ store }: StoreProps) => {
      branchSpy();
      const amuletClick = () => secureAmulet(store);
      const planetClick = () => chooseNextPlanet(store);
      const planet = useSelected(store, planetSelector);
      return (
        //planet value is rendered
        //amulet value is not rendered
        <>
          <p>This is planet {planet}</p>
          <button onClick={planetClick}>Change Planet</button>
          <button onClick={amuletClick}>Ensure Amulet</button>
        </>
      );
    };

    const treeToRender = <Root />;
    render(treeToRender);

    expect(rootSpy).toHaveBeenCalledTimes(1);
    expect(branchSpy).toHaveBeenCalledTimes(1);

    rootSpy.mockClear();
    branchSpy.mockClear();

    await act(async () => {
      expect(rootSpy).toHaveBeenCalledTimes(0);
      expect(branchSpy).toHaveBeenCalledTimes(0);
      rootSpy.mockClear();
      branchSpy.mockClear();
    });
  });
});
