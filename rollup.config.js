import typescript from "rollup-plugin-ts";
import { lezer } from "@lezer/generator/rollup";
import polyfillNode from "rollup-plugin-polyfill-node";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.ts",
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'codemirror6',
  },
  plugins: [
    polyfillNode(),
    nodeResolve(),
    lezer(),
    typescript(),
  ],
};