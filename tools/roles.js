// Zostawia w tabelach ENT_GROUPS / ROLE_KEY tylko role uzywane przez przycieta karte lite.
// uzycie: node roles.js in.js out.js
const fs = require('fs');
const [inF, outF] = process.argv.slice(2);
let src = fs.readFileSync(inF, 'utf8');
const seg = (a, b) => { const i = src.indexOf(a); if (i < 0) throw new Error('brak ' + a); const j = src.indexOf(b, i); return [i, j + b.length]; };
const [e0, e1] = seg('const ENT_GROUPS = [', '\n];\n');
const [r0, r1] = seg('const ROLE_KEY = {', '\n};\n');
const [d0, d1] = seg('const DEMO = {', '\n    };');
const [g0, g1] = seg('const GR = [', '\n    ];');
const S = ['sensor', 'input_number', 'number'], B = ['binary_sensor', 'switch', 'input_boolean'], BTN = ['button', 'input_button'];
const groups = new Function('S', 'B', 'BTN', 'return ' + src.slice(e0 + 'const ENT_GROUPS = '.length, e1 - 2) + ';')(S, B, BTN);
const keys = new Function('return ' + src.slice(r0 + 'const ROLE_KEY = '.length, r1 - 2) + ';')();
// kod poza tabelami
const rest = [[e0, e1], [r0, r1], [d0, d1], [g0, g1]].sort((a, b) => b[0] - a[0]).reduce((t, [a, b]) => t.slice(0, a) + t.slice(b), src);
const NO = ['stats', 'confirm', 'mirror', 'acc'];
const used = r => !NO.includes(r) && new RegExp("['\"`]" + r + "['\"`]|\\bE\\." + r + "\\b").test(rest);
const dom = d => d === S ? 'S' : d === B ? 'B' : d === BTN ? 'BTN' : JSON.stringify(d).replace(/"/g, "'");
const Q = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
let kept = 0, dropped = [];
const gt = groups.map(([name, fs_]) => {
  const f = fs_.filter(x => used(x[0]) || (dropped.push(x[0]), false));
  kept += f.length;
  return f.length ? `  [${Q(name)}, [\n    ` + f.map(x => `[${Q(x[0])}, ${Q(x[1])}, ${dom(x[2])}]`).join(', ') + ']]' : null;
}).filter(Boolean);
const keep = new Set(groups.flatMap(g => g[1].map(x => x[0])).filter(used));
const kt = Object.keys(keys).filter(k => keep.has(k) || used(k)).map(k => `${k}: ${Q(keys[k])}`);
let out = src;
// od konca, zeby indeksy sie nie przesuwaly
const reps = [[e0, e1, 'const ENT_GROUPS = [\n' + gt.join(',\n') + '\n];\n'], [r0, r1, 'const ROLE_KEY = {\n  ' + kt.join(', ') + ',\n};\n']].sort((a, b) => b[0] - a[0]);
for (const [a, b, t] of reps) out = out.slice(0, a) + t + out.slice(b);
// GR (edytor): tylko role z tabel
out = out.replace(/(const GR = \[)([\s\S]*?)(\n    \];)/, (m, a, body, c) => a + body.replace(/\[('[^'\]]*'(?:, '[^'\]]*')*)\], 0\]/g, (mm, list) => '[' + list.split(', ').filter(x => keep.has(x.slice(1, -1))).join(', ') + '], 0]') + c);
fs.writeFileSync(outF, out);
console.log('role: zostaje', kept, 'usunieto', dropped.length, '\n  usuniete:', dropped.join(' '));
