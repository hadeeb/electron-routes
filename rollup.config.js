import typescript from "rollup-plugin-typescript2";

import pkg from "./package.json";

const common = {
  plugins: [typescript()],
  external: [
    "fs",
    "path",
    "util",
    "stream",
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies)
  ]
};

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: `dist/index.js`,
        format: "cjs"
      }
    ],
    ...common
  },
  {
    input: "src/rendererPreload.ts",
    output: [
      {
        file: `dist/preload.js`,
        format: "cjs"
      }
    ],
    ...common
  }
];
