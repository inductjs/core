// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import keysTransformer from 'ts-transformer-keys/transformer';

export default {
	input: 'src/index.ts',
	plugins: [typescript({
		tsconfig: './tsconfig.json',
		transformers: [service => ({
			before: [keysTransformer(service.getProgram())],
			after: [],
		})],
	})],
	output: [
		{
			file: pkg.main,
			format: 'cjs',
		},
		{
			file: pkg.module,
			format: 'es',
		},
	],
	external: [
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.peerDependencies || {}),
		'fs',
		'path',
	],
};
