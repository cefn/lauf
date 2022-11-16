import { useSelected } from "@lauf/store-react";
import { useContext } from "react";
import { ObjectInspector } from "react-inspector";
import { TrackerStoreContext, useTrackerStore } from "../../store";
import { nodeRenderer } from "./nodeRenderer";

export function ReturnedInspector(props: { row: number }) {
  const { row } = props;
  const trackerStore = useTrackerStore();
  const returned = useSelected(
    trackerStore,
    ({ history }) => history?.[row].returned
  );
  return (
    <ObjectInspector
      name={"Returned"}
      data={returned}
      table={true}
      nodeRenderer={nodeRenderer}
      expandPaths={["$"]}
    />
  );
}
