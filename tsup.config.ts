import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,
  format: ["cjs"],
  dts: true,
  outDir: "lib",
  treeshake: true,
});
