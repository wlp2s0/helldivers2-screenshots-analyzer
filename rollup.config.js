import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import { nodeExternals } from 'rollup-plugin-node-externals';
import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/index.ts',
    output: [{
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true
    }, {
        file: 'dist/index.mjs',
        format: 'es',
        sourcemap: true
    }],
    plugins: [
        nodeExternals(),
        nodeResolve(),
        commonjs(),
        typescript(),
        babel({
            babelHelpers: 'bundled',
            presets: ['@babel/preset-env']
        }),
        terser()
    ]
};
