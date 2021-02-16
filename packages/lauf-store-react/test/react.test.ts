/**
 * @jest-environment jsdom
 */

import React, { createContext } from "react";
import { createStoreConsumer, useSelected, useStore } from "../src/react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { executeSequence } from "@lauf/lauf-runner";
import { Store } from "@lauf/lauf-store";
import { editValue } from "@lauf/lauf-store-runner";
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

const planetSelector = (state: State) => state.planet;

function ensureAmulet(store: Store<State>) {
  return executeSequence(
    editValue(store, (draft) => (draft.haveAmulet = true))
  );
}

function changePlanet(store: Store<State>) {
  return executeSequence(
    editValue(store, (draft) => {
      let planetIndex = planets.indexOf(draft.planet);
      planetIndex += 1;
      planetIndex %= planets.length;
      draft.planet = planets[planetIndex] as Planet;
    })
  );
}

const PlanetLabel = ({ planet }: { planet: string }) => (
  <p>This is planet {planet}</p>
);

describe("Memoized consumer", () => {
  const StateContext = createContext<State>({ planet: "earth" });
  const PlanetConsumer = createStoreConsumer(StateContext, planetSelector);

  test("Consumer gets selected data from provider", async () => {
    render(
      <StateContext.Provider value={{ planet: "earth" }}>
        <PlanetConsumer>
          {(planet) => <PlanetLabel planet={planet}></PlanetLabel>}
        </PlanetConsumer>
      </StateContext.Provider>
    );

    await waitFor(() => screen.getByText(/This is planet earth/));
  });
});

describe("useStore : initialises, resolves a store", () => {
  test("Store data can be used", () => {
    const StoreRoot = () => {
      const store = useStore<State>({ planet: "mars" });
      const planet = planetSelector(store.getValue());
      return <PlanetLabel planet={planet} />;
    };
    render(<StoreRoot />);
  });
});

describe("useSelected : (re)render using subset of store", () => {
  test("", async () => {
    const rootSpy = jest.fn();
    const branchSpy = jest.fn();

    const Root = () => {
      rootSpy();
      const store = useStore<State>({ planet: "earth" });
      return <Branch store={store} />;
    };

    const Branch = ({ store }: StoreProps) => {
      branchSpy();
      const amuletClick = () => ensureAmulet(store);
      const planetClick = () => changePlanet(store);
      const planet = useSelected(store, planetSelector);
      return (
        //changes to planet value is rendered, amulet value is not
        <>
          <p>This is planet {planet}</p>
          <button onClick={planetClick}>Change Planet</button>
          <button onClick={amuletClick}>Ensure Amulet</button>
        </>
      );
    };

    const treeToRender = <Root />;
    render(treeToRender);

    expect(rootSpy).toHaveBeenCalledTimes(0);
    expect(branchSpy).toHaveBeenCalledTimes(0);
    rootSpy.mockClear();
    branchSpy.mockClear();

    await act(() => {
      //TODO HERE - click the Planet or Amulet buttons
      fireEvent;
    });
  });
});
