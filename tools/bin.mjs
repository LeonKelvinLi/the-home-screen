/*
  The programs the audits run, named by file, so they start the same way on a
  Mac and on Windows.

  `spawn('npx', …)` only works where npx is a real executable. On Windows it is
  npx.cmd, which spawn() cannot start without a shell, so every audit that
  launched its server that way died with ENOENT before testing anything. Running
  the package's own bin file with this node does the same job everywhere, and
  with no npx or shell in between, srv.kill() still reaches the process it
  started.

    spawn(process.execPath, [VITE, 'preview', '--port', port])
    execFileSync(process.execPath, [TSX, '-e', code])

  A server under test is started as `node --import tsx server/index.ts`
  instead, so it is one process rather than tsx's CLI and a child of it.

  PYTHON is an interpreter with cv2 and Pillow: $PYTHON when set, Homebrew's
  on a Mac (/usr/bin/python3 has neither), `python` on Windows.
*/
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const binOf = (pkg) => {
  const file = require.resolve(`${pkg}/package.json`)
  const { bin } = require(file)
  return join(dirname(file), typeof bin === 'string' ? bin : bin[pkg])
}

export const TSX = binOf('tsx')
export const VITE = binOf('vite')

const HOMEBREW = '/opt/homebrew/bin/python3'
export const PYTHON =
  process.env.PYTHON ?? (process.platform === 'win32' ? 'python' : existsSync(HOMEBREW) ? HOMEBREW : 'python3')
