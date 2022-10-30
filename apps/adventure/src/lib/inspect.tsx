import { ObjectLabel, ObjectRootLabel } from "react-inspector";

/** Renderer implementation for react-inspector which can present React fragments as actual content */

/** Original vendored in */
const defaultNodeRenderer = (options: {
  depth: number;
  name: string;
  data: any;
  isNonenumerable: boolean;
}) => {
  const { depth, name, data, isNonenumerable } = options;
  return depth === 0 ? (
    <ObjectRootLabel name={name} data={data} />
  ) : (
    <ObjectLabel name={name} data={data} isNonenumerable={isNonenumerable} />
  );
};

/** A renderer that presents React Element structures by rendering them to the DOM */
const passageNodeRenderer = (options: {
  depth: number;
  name: string;
  data: any;
  isNonenumerable: boolean;
}) => {
  const { depth, name, data, isNonenumerable } = options;
  return depth === 0 ? <ObjectRootLabel name={name} data={data} /> : data;
};

/** Detects if a data structure is a React Element, and selectively renders it */
export const nodeRenderer = (options: {
  depth: number;
  name: string;
  data: any;
  isNonenumerable: boolean;
}) => {
  const { data } = options;
  if (data && data["$$typeof"] === Symbol.for("react.element")) {
    return passageNodeRenderer(options);
  } else {
    return defaultNodeRenderer(options);
  }
};
