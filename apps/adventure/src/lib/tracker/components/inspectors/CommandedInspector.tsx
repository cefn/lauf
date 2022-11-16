import { useSelected } from "@lauf/store-react";
import { useContext } from "react";
import { ObjectInspector } from "react-inspector";
import { TrackerStoreContext, useTrackerStore } from "../../store";
import { nodeRenderer } from "./nodeRenderer";

export function CommandedInspector(props: { row: number }) {
  const { row } = props;
  const trackerStore = useTrackerStore();
  const commanded = useSelected(
    trackerStore,
    ({ history }) => history?.[row].commanded
  );
  return (
    <ObjectInspector
      name={"Commanded"}
      data={commanded}
      table={true}
      nodeRenderer={nodeRenderer}
      expandPaths={["$"]}
    />
  );
}
