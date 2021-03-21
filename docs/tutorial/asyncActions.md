So far our code has been synchronous, with user input events immediately modifying state, or state changes immediately triggering a re-render.

To validate Mornington Crescent moves, we will use a public API listing London Underground stations.

If we visit https://marquisdegeek.com/api/tube/?name=Mornington%20Crescent we get a tiny fragment of data that confirms that **_is the name of an underground station_**. Helpfully it includes lat/long information to plot it on a map...

```json
{
  "name": "Mornington Crescent",
  "zone": "2",
  "latitude": 51.534362233874,
  "longitude": -0.1387299346061,
  "results": ""
}
```

This requires an `async` HTTP request to be performed. We need to wait for the validating data to come back before adding the move to the `GameState`.

First let's create an `Action` we can use to get the data. We will use the `axios` HTTP library to retrieve the page. We define a type for the data for later processing.

```typescript
interface StationData {
  name: "Mornington Crescent";
  zone: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  latitude: number;
  longitude: number;
}

export class LookupStationData implements Action<Array<StationData>> {
  constructor(readonly name: string) {}
  act = async () => {
    const apiUrl = new URL("https://marquisdegeek.com/api/tube/");
    apiUrl.searchParams.append("name", this.name);
    const { data } = await axios.get<Array<StationData>>(apiUrl.toString());
    return data;
  };
}

export const lookupStationData = planOfAction(LookupStationData);
```

Now we have `lookupStationData` as a new `ActionPlan`. We can use it to add validating logic to the `handleInput(...)` function from the last lesson.

```typescript
function* handleInput({ store, queue }: Game) {
  while (true) {
    const station = yield* receive(queue);
    //retrieve matching stations
    const stationDataList = yield* lookupStationData(station);
    //check exact name match was returned
    const stationData = stationDataList.find((data) => data.name === station);
    if (!stationData) {
      yield* alert(`There is no underground station called ${station}`);
    } else {
      yield* edit(store, (state) => {
        const { players, turn } = state;
        const player = players[turn] as Player;
        state.moves = [...state.moves, { player, station }];
      });
    }
  }
}
```

Now we have a fairly complete game of Mornington Crescent. It's time to look at performance optimisations.

What should we do to minimise recomputing and rerendering when there is a change in the `Store`?

Next >> [Memoized Functions](./memoizedFunctions.md)
