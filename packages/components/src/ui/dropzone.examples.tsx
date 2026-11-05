import { Dropzone } from "./dropzone.js";

export const dropzoneExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "dropzone",
    render: () => <Dropzone {...({} as any)} />,
  },
];
