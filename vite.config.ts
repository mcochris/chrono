//
// vite.config.ts
//
// Compression commented out because cloudflare automagically compresses files for us
//
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { createHtmlPlugin } from 'vite-plugin-html'
// import { compression, defineAlgorithm } from 'vite-plugin-compression2'
// import zlib from 'node:zlib'

export default defineConfig({
	plugins: [
		viteSingleFile(),
		createHtmlPlugin({ minify: true })
		// 		compression({
		// 			include: [/\.(js|mjs|css|json|svg|html)$/],
		// 			threshold: 1024,
		// 			algorithms: [
		// 				'gzip',
		// 				'brotliCompress',
		// 				defineAlgorithm('zstandard', {
		// 					params: {
		// 						[zlib.constants.ZSTD_c_compressionLevel]: 19
		// 					}
		// 				}),
		// 			],
		// 		}),
	],
})
