/**
 * @jest-environment jsdom
 */

import React from "react";
import { useRootState, useSelected, useStore } from "../src";
import { render, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createStore, Selector, Store } from "@lauf/store";
import { act } from "react-dom/test-utils";

/** IMAGINARY APPLICATION-SPECIFIC DATA, COMPONENTS, SELECTORS */

const planets = ["earth", "mars"] as const;
type Planet = typeof planets[number];
interface State {
  planet: Planet;
  haveAmulet?: boolean;
}

interface StoreProps {
  store: Store<State>;
}

const planetSelector: Selector<State, Planet> = (state) => state.planet;

const PlanetLabel = ({ planet }: { planet: string }) => (
  <p>This is planet {planet}</p>
);

describe("useRootState behaviour", () => {
  test("Bind with useRootState", async () => {
    const store = createStore<State>({ planet: "earth" });
    const Component = ({ store }: StoreProps) => {
      const { planet } = useRootState(store);
      return <PlanetLabel planet={planet} />;
    };
    render(<Component store={store} />);
    expect(
      await waitFor(() => screen.getByText(/This is planet earth/))
    ).toBeDefined();
    store.edit((draft) => (draft.planet = "mars"));
    expect(
      await waitFor(() => screen.getByText(/This is planet mars/))
    ).toBeDefined();
  });
});

describe("useSelected : (re)render using subset of store", () => {
  test("Component state follows selector", async () => {
    /** DEFINE STATE, STORE, UI */

    type Coord = [number, number];
    interface TestState {
      readonly coord: Coord;
    }

    const selectCoord: Selector<TestState, Coord> = (state) => {
      return state.coord;
    };

    const Component = ({ store }: { store: Store<TestState> }) => {
      const coord = useSelected(store, selectCoord);
      return <div data-testid="component">{JSON.stringify(coord)}</div>;
    };

    const store = createStore<TestState>({
      coord: [0, 0],
    } as const);
    render(<Component store={store} />);
    expect((await screen.findByTestId("component")).textContent).toBe("[0,0]");
    act(() => {
      store.write({
        coord: [1, 1],
      } as const);
    });
    expect((await screen.findByTestId("component")).textContent).toBe("[1,1]");
  });

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
      const planet = useSelected(store, planetSelector);
      return (
        // planet value is rendered
        // amulet value is not rendered
        <>
          <p>This is planet {planet}</p>
          <button
            onClick={() =>
              store.edit((draft) => {
                draft.planet = "mars";
              })
            }
          >
            Set Mars
          </button>
          <button
            onClick={() =>
              store.edit((draft) => {
                draft.haveAmulet = true;
              })
            }
          >
            Secure Amulet
          </button>
        </>
      );
    };

    // mount component
    const treeToRender = <Root />;
    render(treeToRender);
    expect(rootSpy).toHaveBeenCalledTimes(1); // root rendered
    expect(branchSpy).toHaveBeenCalledTimes(1); // branch rendered

    // edit some state rendered in Branch
    rootSpy.mockClear();
    branchSpy.mockClear();
    userEvent.click(screen.getByText("Set Mars"));
    await screen.findByText("This is planet mars");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(rootSpy).toHaveBeenCalledTimes(0); // root not re-rendered
    expect(branchSpy).toHaveBeenCalledTimes(1); // branch is re-rendered

    // edit some state not rendered Anywhere
    rootSpy.mockClear();
    branchSpy.mockClear();
    userEvent.click(screen.getByText("Secure Amulet"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(rootSpy).toHaveBeenCalledTimes(0); // root not re-rendered
    expect(branchSpy).toHaveBeenCalledTimes(0); // branch not re-rendered
  });
});
