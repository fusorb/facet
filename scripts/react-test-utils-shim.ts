/**
 * Vitest alias target for `react-dom/test-utils`.
 *
 * React 19.2 removed the real `act` from `react-dom/test-utils` (the export
 * is a deprecation stub that throws). @testing-library/react 16 still imports
 * `act` from there, so we point the module at React's own `act`.
 */
import "@testing-library/jest-dom";
import { act } from "react";

export default act;
export { act };
