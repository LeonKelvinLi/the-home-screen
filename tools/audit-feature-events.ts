import assert from 'node:assert/strict'

// Isolated ingestion contract. Never connects to a production database.
process.env.DATABASE_URL = 'postgresql://audit:audit@127.0.0.1:1/audit'
const { pool } = await import('../server/db/schema')
const { ingest } = await import('../server/intel')
const calls: { sql: string; values: unknown[] }[] = []
const original = pool.query
pool.query = (async (sql: string, values: unknown[]) => {
  calls.push({ sql, values })
  return { rows: [], rowCount: values.length / 26 }
}) as typeof pool.query
try {
  const kinds = ['gallery', 'watch', 'news', 'calendar', 'share', 'phone']
  const events = kinds.map((kind, i) => ({ e: 'feature_opened', id: `event${i}audit`, p: { kind, email: 'private@example.test' } }))
  events.push({ e: 'unknown_event', id: 'invalidAudit', p: { kind: 'news', email: 'private@example.test' } })
  const result = await ingest({ events }, { anon: null, memberId: 'private-member', ua: 'Mozilla/5.0', gpc: true })
  assert.equal(result.stored, 6)
  assert.equal(result.refused, 1)
  assert.equal(calls.length, 1)
  assert.match(calls[0].sql, /INSERT INTO analytics_events/)
  for (let i = 0; i < 6; i++) {
    assert.deepEqual(JSON.parse(calls[0].values[i * 26 + 9] as string), { kind: kinds[i] })
    assert.equal(calls[0].values[i * 26 + 3], null, 'GPC must remove member identity')
  }
  assert.ok(!JSON.stringify(calls).includes('private@example.test'))
  console.log('Feature ingestion passed: six kinds, unknown event refused, private fields removed.')
} finally {
  pool.query = original
  await pool.end()
}
