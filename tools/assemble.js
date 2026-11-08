// Sklada karte lite w JEDEN plik: nakłada poprawki EDITS na rdzen (jak robil to loader w przegladarce) i wkleja rdzen inline.
// uzycie: node assemble.js card.js core.js out.js
const fs = require('fs');
const [cardF, coreF, outF] = process.argv.slice(2);
let card = fs.readFileSync(cardF, 'utf8'), code = fs.readFileSync(coreF, 'utf8');
const a = card.indexOf('    const EDITS = [');
const b = card.indexOf('    EDITS.forEach(e => {');
const arr = new Function(card.slice(a, b).replace('const EDITS =', 'return ') + '')();
let miss = 0;
for (const e of arr) {
  if (e.t === 'x') { if (code.split(e.old).length !== 2) { console.error('BRAK wzorca', e.old.slice(0, 70)); miss++; } else code = code.replace(e.old, () => e.new); }
  else { const re = new RegExp(e.src, e.fl); if (!re.test(code)) { console.error('BRAK regex', e.src.slice(0, 70)); miss++; } else { re.lastIndex = 0; code = code.replace(re, () => e.new); } }
}
const c0 = card.indexOf('    const DIR = new URL');
const c1 = card.indexOf("    document.head.appendChild(s);\n") + "    document.head.appendChild(s);\n".length;
card = card.slice(0, c0) + '    (() => {\n' + code + '\n    })();\n' + card.slice(c1);
fs.writeFileSync(outF, card);
console.log('missing', miss, 'size', card.length);
