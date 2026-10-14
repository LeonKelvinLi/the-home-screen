/* Regression probes for the patched dependency advisories. No shell is run. */
import assert from 'node:assert/strict'
import proxyaddr from 'proxy-addr'
import shellQuote from 'shell-quote'

// Short IPv4-mapped IPv6 prefixes must not trust arbitrary IPv4 clients.
assert.equal(proxyaddr.compile('::ffff:10.0.0.0/8')('203.0.113.25'), false)
assert.equal(proxyaddr.compile('::/1')('203.0.113.25'), false)
const correctSubnet = proxyaddr.compile('::ffff:10.0.0.0/104')
assert.equal(correctSubnet('10.1.2.3'), true)
assert.equal(correctSubnet('203.0.113.25'), false)

// A newline after a shell comment must be rejected, never rendered as code.
for (const newline of ['\n', '\r', '\u2028', '\u2029']) {
  assert.throws(() => shellQuote.quote(['echo', { comment: 'review' }, `a${newline}id;#`]), TypeError)
}
assert.equal(typeof shellQuote.quote(['echo', 'ordinary argument']), 'string')
console.log('Patched dependency regression checks passed.')
