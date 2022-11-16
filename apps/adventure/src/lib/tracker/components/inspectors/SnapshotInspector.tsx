import { useSelected } from "@lauf/store-react";
import { useContext } from "react";
import { ObjectInspector } from "react-inspector";
import { TrackerStoreContext, useTrackerStore } from "../../store";
import { nodeRenderer } from "./nodeRenderer";

export function SnapshotsInspector(props: { row: number }) {
  const { row } = props;
  const trackerStore = useTrackerStore();
  const snapshots = useSelected(
    trackerStore,
    ({ history }) => history?.[row].snapshots
  );
  return (
    <ObjectInspector
      name={"Snapshots"}
      data={snapshots}
      table={true}
      nodeRenderer={nodeRenderer}
      expandPaths={["$"]}
    />
  );
}
