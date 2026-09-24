import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

/* Which build an event came from: Render's commit, else git's, else "dev". */
const version = (() => {
  const fromEnv = process.env.RENDER_GIT_COMMIT
  if (fromEnv) return fromEnv.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return 'dev'
  }
})()

export default defineConfig({
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(version) },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
  build: {
    outDir: 'dist',
    /*
      No public sourcemaps.

      `sourcemap: true` emitted .map files that the server happily served — 436KB
      of the full commented source to anyone who asked for it. That is not a
      secret-leak in the credential sense, but the comments in this codebase are
      candid by design: they name which vendors have unsourced menus, what the
      platform takes from each kitchen, that payments are mock, and which claims
      the operator has not substantiated. None of that is written for customers
      or for the businesses listed, and a URL is not a place to publish it.

      Not emitted at all rather than merely unreferenced: 'hidden' still writes
      the .map files into dist/ at a deterministic hashed path, and the server
      serves whatever is in dist/. There is no error-reporting service consuming
      them, so nothing is lost. `npm run dev` has full maps.
    */
    sourcemap: false,
  },
})
