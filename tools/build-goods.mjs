import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const goods = resolve(root, 'services/goods')
if (existsSync(resolve(goods, 'package.json'))) {
  for (const args of [['ci', '--include=dev'], ['run', 'build']]) {
    const result = spawnSync('npm', args, {
      cwd: goods,
      stdio: 'inherit',
      env: { ...process.env, GOODS_BASE_PATH: '/goods' },
    })
    if (result.error) throw result.error
    if (result.status !== 0) process.exit(result.status ?? 1)
  }
}
