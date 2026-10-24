import "@testing-library/jest-dom/vitest";
import * as jestDomMatchers from "@testing-library/jest-dom/matchers";

declare module "@vitest/expect" {
  interface Assertion<T = any> extends jestDomMatchers.TestingLibraryMatchers<any, T> {}
  interface AsymmetricMatchersContaining extends jestDomMatchers.TestingLibraryMatchers<any, any> {}
}
