// vite.config.ts
import { defineConfig } from 'vite'
import { compression, defineAlgorithm } from 'vite-plugin-compression2'
//import zlib from 'node:zlib'

export default defineConfig({
	plugins: [
		compression({
			include: [/\.(js|mjs|css|json|svg|html)$/],
			threshold: 1024,
			algorithms: [
				'gzip'
				//'brotliCompress',
				//defineAlgorithm('zstandard', {
				//params: {
				//[zlib.constants.ZSTD_c_compressionLevel]: 19,
				//,
				//}),
			],
		}),
	],
})
