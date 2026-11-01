declare module "../../../surfaces.config" {
  export const surfaces: {
    landing: { dev: string; prod: string };
    docs: { dev: string; prod: string };
    playground: { dev: string; prod: string };
    github: string;
    npm: string;
    npmPackageScope: string;
  };
  export const domains: string[];
  export const viewportPresets: string[];
  export const themes: { light: string; dark: string };
  export const colorSpace: string;
}
