import objectInspect from "object-inspect";

import { useSelected } from "@lauf/store-react";
import { useTrackerStore } from "../store";

export function TrackerHistoryView() {
  const trackerStore = useTrackerStore();
  const history = useSelected(trackerStore, ({ history }) => history);

  return (
    <table className="table table-fixed text-2xs w-full">
      <thead>
        <tr>
          <th>Commands</th>
          <th>Returns</th>
          <th>Snapshots</th>
        </tr>
      </thead>
      <tbody>
        {history.map((moment, pos) => {
          const { commanded } = moment;
          const tdStyle = { maxWidth: "4em", overflowX: "hidden" } as const;
          return (
            <tr key={pos}>
              <td
                style={tdStyle}
                onClick={() =>
                  trackerStore.write({
                    ...trackerStore.read(),
                    inspected: {
                      momentPos: pos,
                      momentField: "commanded",
                    },
                  })
                }
              >
                {objectInspect(commanded)}
              </td>
              <td
                style={tdStyle}
                onClick={() =>
                  trackerStore.write({
                    ...trackerStore.read(),
                    inspected: {
                      momentPos: pos,
                      momentField: "returned",
                    },
                  })
                }
              >
                {objectInspect(moment.returned)}
              </td>
              <td
                style={tdStyle}
                onClick={() =>
                  trackerStore.write({
                    ...trackerStore.read(),
                    inspected: {
                      momentPos: pos,
                      momentField: "snapshots",
                    },
                  })
                }
              >
                {objectInspect(moment.snapshots)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
