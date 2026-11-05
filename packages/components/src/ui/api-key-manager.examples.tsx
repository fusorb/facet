import { ApiKeyManager } from "./api-key-manager.js";

export const apiKeyManagerExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "api-key-manager",
    render: () => <ApiKeyManager {...({} as any)} />,
  },
];
