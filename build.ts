import dts from 'bun-plugin-dts'

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

console.log('✨ Build complete')
