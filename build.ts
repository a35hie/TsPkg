import dts from 'bun-plugin-dts'

// Build library
await Bun.build({
  entrypoints: ['./src/main.ts'],
  outdir: './dist',
  format: 'esm',
  target: 'node',
  splitting: false,
  sourcemap: 'external',
  minify: false,
  plugins: [dts()],
})

// Build CLI
await Bun.build({
  entrypoints: ['./src/cli.ts'],
  outdir: './dist',
  format: 'esm',
  target: 'node',
  splitting: false,
  minify: false,
  banner: '#!/usr/bin/env bun',
})

console.log('✨ Build complete')
