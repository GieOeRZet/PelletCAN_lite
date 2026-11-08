// Przycina zlozony plik karty lite: usuwa kod zapisu i kod poziomow powyzej podstawowego (AST, acorn).
// uzycie: node prune.js in.js out.js
const fs = require('fs');
const acorn = require('/opt/npm-tools/node_modules/acorn');
const [inF, outF] = process.argv.slice(2);
const src = fs.readFileSync(inF, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true });
const R = JSON.parse(fs.readFileSync(__dirname + '/prune.rules.json', 'utf8'));
const edits = [];
const E = (a, b, t) => edits.push([a, b, t]);
const S = n => src.slice(n.start, n.end);
const kname = k => k && (k.type === 'Identifier' ? k.name : k.type === 'Literal' ? String(k.value) : null);
const rmMethods = new Set(R.removeMethods), rmActs = new Set(R.removeActs), rmCases = new Set(R.removeCases);

function visit(n, parent, key) {
  if (!n || typeof n.type !== 'string') return;
  // 1. wywolania uslug HA -> void 0
  if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && !n.callee.computed && R.killCalls.includes(n.callee.property.name)) {
    E(n.start, n.end, 'void 0'); return;
  }
  // 2. metody klasy
  if (n.type === 'MethodDefinition' && rmMethods.has(kname(n.key))) { E(n.start, n.end, ''); return; }
  // 3. C.prototype.X = ...;  (takze ze wzorcem (function(o){...})(C.prototype.X);)
  if (n.type === 'ExpressionStatement' && n.expression.type === 'AssignmentExpression' && n.expression.left.type === 'MemberExpression'
      && n.expression.left.object.type === 'MemberExpression' && kname(n.expression.left.object.property) === 'prototype'
      && rmMethods.has(kname(n.expression.left.property))) { E(n.start, n.end, ''); return; }
  // 4. galezie act === '...'
  if (n.type === 'IfStatement' && parent && parent.type === 'IfStatement' && key === 'alternate' && n.test.type === 'BinaryExpression'
      && n.test.operator === '===' && n.test.left.type === 'Identifier' && n.test.left.name === 'act' && n.test.right.type === 'Literal' && rmActs.has(n.test.right.value)) {
    E(n.start, n.end, n.alternate ? S(n.alternate) : ';');
    if (n.alternate) visit(n.alternate, parent, key);   // dalszy lancuch (jego edycje leza wewnatrz tej samej zamiany - patrz nizej)
    return;
  }
  // 5. case 'x':
  if (n.type === 'SwitchCase' && n.test && n.test.type === 'Literal' && rmCases.has(n.test.value)) { E(n.start, n.end, ''); return; }
  for (const k in n) {
    if (k === 'type' || k === 'start' || k === 'end') continue;
    const v = n[k];
    if (Array.isArray(v)) v.forEach(x => visit(x, n, k)); else if (v && typeof v.type === 'string') visit(v, n, k);
  }
}
visit(ast, null, null);
// edycje zagniezdzone (zamiana galezi zawierajaca inne edycje) - budujemy tekst rekurencyjnie
edits.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
function apply(from, to, list) {
  let out = '', pos = from, i = 0;
  while (i < list.length) {
    const [a, b, t] = list[i];
    if (a < pos) { i++; continue; }
    out += src.slice(pos, a);
    // edycje wewnatrz [a,b)
    const inner = []; let j = i + 1;
    while (j < list.length && list[j][0] >= a && list[j][1] <= b) { inner.push(list[j]); j++; }
    out += (t && inner.length && t === src.slice(a, b)) ? apply(a, b, inner) : (t.length && t !== '' && t !== ';' && t !== 'void 0' && inner.length ? applyIn(t, a, b, inner) : t);
    pos = b; i = j;
  }
  return out + src.slice(pos, to);
}
// zamiana galezi `if` na jej alternate: wewnetrzne edycje dotycza tekstu alternate, ktory jest podciagiem zrodla
function applyIn(t, a, b, inner) {
  const base = src.indexOf(t, a);
  const sub = inner.filter(e => e[0] >= base && e[1] <= base + t.length);
  return base >= 0 ? apply(base, base + t.length, sub) : t;
}
let out = apply(0, src.length, edits);
fs.writeFileSync(outF, out);
console.log('edits', edits.length, 'size', src.length, '->', out.length);
