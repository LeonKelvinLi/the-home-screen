/* Item artwork must not read apparel names inside ordinary food descriptions. */
import assert from 'node:assert/strict'
import { glyphFor } from '../src/ios/ItemThumb'
assert.equal(glyphFor('Crab roe noodles/rice', 'A delectable dish that showcases fresh crab roe', 'Fujian noodles & dim sum'), 'noodles')
assert.notEqual(glyphFor('Potstickers', '', 'Chinese dumplings'), 'shirt')
for (const name of ['Hat', 'T-shirt', 'Hoodies', 'Crewneck', 'Sweatshirt', 'Sticker']) assert.equal(glyphFor(name, '', 'Apparel'), 'shirt')
console.log('PASS: food descriptions and potstickers do not match apparel; actual apparel does.')
