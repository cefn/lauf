/**
 * @jest-environment jsdom
 */

import React from "react";
import { useRootState, useSelected, useStore } from "../src";
import { render, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createStore, Immutable, Selector, Store } from "@lauf/store";
import { act } from "react-dom/test-utils";
import flushPromises from "flush-promises";

/** A promise of the next state change in a store. Watchers are notified in
 * order of subscription, so notifications to any previously-subscribed watchers
 * happen before this is resolved. */
function stateWritten<T extends {}>(store: Store<T>) {
  return new Promise<Immutable<T>>((resolve) => {
    const unwatch = store.watch((state) => {
      resolve(state);
      unwatch();
    });
  });
}

async function statePropagated<T extends {}>(store: Store<T>) {
  const state = await stateWritten(store); // wait for async operations to be triggered
  await flushPromises(); // wait for async operations to complete
  return state;
}

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

    const Component = (props: { store: Store<TestState> }) => {
      const coord = useSelected(props.store, selectCoord);
      return <div data-testid="component">{JSON.stringify(coord)}</div>;
    };

    const store = createStore<TestState>({
      coord: [0, 0],
    } as const);

    render(<Component store={store} />);

    expect((await screen.findByTestId("component")).textContent).toBe("[0,0]");

    const propagatedPromise = statePropagated(store);

    await waitFor(async () => {
      store.write({
        coord: [1, 1],
      } as const);
      await propagatedPromise;
    });

    expect((await screen.findByTestId("component")).textContent).toBe("[1,1]");
  });

  test("Render count as expected before and after store edits", async () => {
    const rootRenderSpy = jest.fn();
    const branchRenderSpy = jest.fn();

    const Root = () => {
      rootRenderSpy();
      const store = useStore<State>({ planet: "earth" });
      return <Branch store={store} />;
    };

    const Branch = ({ store }: StoreProps) => {
      branchRenderSpy();
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
    expect(rootRenderSpy).toHaveBeenCalledTimes(1); // root rendered
    expect(branchRenderSpy).toHaveBeenCalledTimes(1); // branch rendered

    // edit some state rendered in Branch
    rootRenderSpy.mockClear();
    branchRenderSpy.mockClear();
    userEvent.click(screen.getByText("Set Mars"));
    await screen.findByText("This is planet mars");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(rootRenderSpy).toHaveBeenCalledTimes(0); // root not re-rendered
    expect(branchRenderSpy).toHaveBeenCalledTimes(1); // branch is re-rendered

    // edit some state not rendered Anywhere
    rootRenderSpy.mockClear();
    branchRenderSpy.mockClear();
    userEvent.click(screen.getByText("Secure Amulet"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(rootRenderSpy).toHaveBeenCalledTimes(0); // root not re-rendered
    expect(branchRenderSpy).toHaveBeenCalledTimes(0); // branch not re-rendered
  });
});
