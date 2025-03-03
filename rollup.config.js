import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import { nodeExternals } from 'rollup-plugin-node-externals'

export default {
    input: 'src/parseImage.js',
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
        babel({
            babelHelpers: 'bundled',
            presets: ['@babel/preset-env']
        }),
        terser()
    ]
};
