import { useSelected } from "@lauf/store-react";
import { useTrackerStore } from "../store";
import { CommandedInspector } from "./inspectors/CommandedInspector";
import { ReturnedInspector } from "./inspectors/ReturnedInspector";
import { SnapshotsInspector } from "./inspectors/SnapshotInspector";

export function TrackerInspectedView() {
  const trackerStore = useTrackerStore();
  const inspected = useSelected(trackerStore, (state) => state.inspected);
  if (inspected) {
    const { momentField } = inspected;
    switch (momentField) {
      case "commanded":
        return <CommandedInspector row={inspected.momentPos} />;
      case "returned":
        return <ReturnedInspector row={inspected.momentPos} />;
      case "snapshots":
        return <SnapshotsInspector row={inspected.momentPos} />;
    }
  }
  return <>Nothing selected</>;
}
