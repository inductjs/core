// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

export default {
    input: 'dist/index.js',
    output: [
      {
        file: pkg.main,
        format: 'cjs'
      },
      {
        file: pkg.module,
        format: 'es'
      }
    ],
    plugins: [typescript()],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
  };