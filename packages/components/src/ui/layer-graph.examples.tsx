import { LayerGraph } from "./layer-graph.js";

export const layerGraphExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "layer-graph",
    render: () => <LayerGraph {...({} as any)} />,
  },
];
