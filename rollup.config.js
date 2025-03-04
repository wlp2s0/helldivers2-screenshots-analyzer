import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import { nodeExternals } from "rollup-plugin-node-externals";
import typescript from "@rollup/plugin-typescript";
import fs from "node:fs/promises";

const generateDtsFiles = {
	name: "generate-dts-files",
	closeBundle: async () => {
		// Create appropriate d.ts files for each format
		const dts = await fs.readFile("./dist/index.d.ts", "utf8");
		await fs.writeFile("./dist/index.d.mts", dts);
		await fs.writeFile("./dist/index.d.cts", dts);
		// Original can be removed after copying
		await fs.unlink("./dist/index.d.ts");
	},
};

export default {
	input: "src/index.ts",
	output: [
		{
			file: "dist/index.cjs",
			format: "cjs",
			sourcemap: true,
		},
		{
			file: "dist/index.mjs",
			format: "es",
			sourcemap: true,
		},
	],
	plugins: [
		nodeExternals(),
		nodeResolve(),
		commonjs(),
		typescript({
			tsconfig: "./tsconfig.json",
			compilerOptions: {
				rootDir: "./src",
				removeComments: false,
				declaration: true,
				declarationDir: "./dist",
				emitDeclarationOnly: true,
				allowImportingTsExtensions: true,
			},
		}),
		babel({
			babelHelpers: "bundled",
			presets: ["@babel/preset-env"],
		}),
		terser(),
		generateDtsFiles,
	],
};
