import { Tree } from "./tree.js";

export const treeExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "tree",
    render: () => <Tree {...({} as any)} />,
  },
];
