import { createHmac } from 'node:crypto'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const accountSecret = (base: string, purpose: string) => createHmac('sha256', base).update(`beasty:${purpose}:v1`).digest('hex')

/** Shares the existing host, not the Pages data namespace or cookie. */
export async function createHostedGoods(origin: string, baseSecret: string, clientSecret: string) {
  const entry = resolve(root, 'services/goods/server/app.ts')
  if (!existsSync(entry)) return null
  const { createApp } = await import(pathToFileURL(entry).href)
  const prod = process.env.NODE_ENV === 'production'
  return createApp({
    APP_URL: origin,
    APP_BASE_PATH: '/goods',
    DB_SCHEMA: 'bsty_goods',
    AUTH_SECRET: process.env.GOODS_AUTH_SECRET || accountSecret(baseSecret, 'goods-session'),
    DATABASE_URL: process.env.GOODS_DATABASE_URL || process.env.DATABASE_URL,
    PGPOOL_MAX: process.env.GOODS_PGPOOL_MAX || '5',
    MAIL_MODE: prod ? 'resend' : 'spool',
    MAIL_FROM: process.env.OTP_FROM_EMAIL || process.env.MAIL_FROM,
    MAIL_SPOOL_DIR: resolve(root, '.verify/goods-mail'),
    UPLOAD_DIR: process.env.GOODS_UPLOAD_DIR || (prod ? '/var/data/goods/photos' : resolve(root, '.verify/goods-photos')),
    PERSISTENT_UPLOADS: prod ? 'true' : undefined,
    DIST_DIR: resolve(root, 'services/goods/dist'),
    TRUSTED_ORIGINS: '',
    ADMIN_EMAILS: process.env.GOODS_ADMIN_EMAILS || '',
    // Temporary sample catalog explicitly requested for this website preview.
    GOODS_DEMO_CATALOG: process.env.GOODS_DEMO_CATALOG ?? '1',
    BEASTY_IDENTITY_ORIGIN: origin,
    BEASTY_SSO_CLIENT_ID: 'bsty-goods',
    BEASTY_SSO_CLIENT_SECRET: clientSecret,
  })
}
