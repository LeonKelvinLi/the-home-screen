/*
  A COMPONENT DECLARED INSIDE ANOTHER COMPONENT LOSES ITS STATE.

  This is the bug Glenn reported on the About page: "when you tap a drop-down,
  it doesn't stay on." PanelSections was declared in Panel's body, so every
  render of Panel produced a NEW function. React compares by identity, decided
  it was a different component, unmounted the old tree and mounted a fresh one
  — with fresh state. The landing screen swaps its photo every three seconds,
  so the chapter you opened closed itself three seconds later.

  Nothing caught it. It was declared at column zero, so it read like a
  top-level function, and the About audit checked aria-expanded immediately
  after the click, well inside the three seconds.

  So this reads the actual syntax tree rather than the indentation: any
  function that returns JSX, or is used as <Foo />, and is declared inside
  another function, is reported. The AST is the only place the nesting is
  unambiguous.
*/
import ts from 'typescript'
import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'

const files = globSync('src/**/*.{ts,tsx}')
const bad = []

/* A hook call in the body is what makes the remount cost real state, so it is
   reported separately from a nested component that only renders. Both are
   wrong; one is a live bug. */
const HOOK = /^use[A-Z]/

for (const file of files) {
  const src = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX)

  const returnsJsx = (node) => {
    let found = false
    const walk = (n) => {
      if (found) return
      // Don't descend into a nested function: its JSX is its own business.
      if (n !== node && (ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n))) return
      if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) { found = true; return }
      ts.forEachChild(n, walk)
    }
    ts.forEachChild(node, walk)
    return found
  }

  const hooksIn = (node) => {
    const hits = []
    const walk = (n) => {
      if (n !== node && (ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n))) return
      if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && HOOK.test(n.expression.text)) hits.push(n.expression.text)
      ts.forEachChild(n, walk)
    }
    ts.forEachChild(node, walk)
    return hits
  }

  const visit = (node, depth) => {
    let nextDepth = depth
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
      const name = node.name?.text
        ?? (ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name) ? node.parent.name.text : null)
      const isComponent = name && /^[A-Z]/.test(name) && returnsJsx(node)
      if (isComponent && depth > 0) {
        const { line } = src.getLineAndCharacterOfPosition(node.getStart(src))
        bad.push({ file, line: line + 1, name, hooks: hooksIn(node) })
      }
      nextDepth = depth + 1
    }
    ts.forEachChild(node, (c) => visit(c, nextDepth))
  }
  visit(src, 0)
}

for (const b of bad) {
  const why = b.hooks.length
    ? `holds state (${[...new Set(b.hooks)].join(', ')}) that is wiped on every parent render`
    : 'is rebuilt and remounted on every parent render'
  console.log(`FAIL  ${b.file}:${b.line}  <${b.name}> is declared inside another component — it ${why}. Move it to module scope.`)
}
console.log(`\nnested components: ${bad.length}`)
console.log(bad.length ? '1 failed' : 'PASS — every component is declared at module scope')
process.exit(bad.length ? 1 : 0)
