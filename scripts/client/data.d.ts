// JSON module imports are resolved at runtime by the browser (esbuild
// leaves them external). TypeScript needs a stub so the import typechecks;
// the runtime shape is cast via `as SiteData` in main.ts.
declare module '*.json' {
  const data: unknown;
  export default data;
}
