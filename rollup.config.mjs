import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import scss from 'rollup-plugin-scss';
import sass from 'sass';
import { terser } from 'rollup-plugin-terser';

export default args => ({
  input: 'src/main.ts',
  output: {
    file: args['config-prod'] ? 'dist/index.min.js' : 'index.js',
    format: 'iife',
    name: 'LichessDemo',
    plugins: args['config-prod']
      ? [
          terser({
            safari10: false,
            output: { comments: false },
          }),
        ]
      : [],
    sourcemap: true, // Optional: helpful for debugging
  },
  plugins: [
    resolve({
      browser: true, // Use browser-appropriate versions of modules
      preferBuiltins: false, // Don't prefer Node.js built-ins
      mainFields: ['browser', 'module', 'main'], // Prioritize browser field
    }),
    commonjs(),
    typescript(),
    scss({
      include: ['scss/*'],
      output: args['config-prod'] ? './dist/style.min.css' : './style.css',
      runtime: sass,
      ...(args['config-prod'] ? { outputStyle: 'compressed' } : {}),
    }),
  ],
});
