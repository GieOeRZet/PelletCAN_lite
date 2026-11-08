#!/bin/bash
# etapy 2-4 budowy lite: skladanie -> przyciecie tekstowe -> modul LITE -> przyciecie AST
set -e
D=$(dirname "$0")
node $D/assemble.js "$1" "$2" /tmp/lite_flat.js
python3 $D/lite_post.py /tmp/lite_flat.js /tmp/lite_flat2.js
D="$D" python3 - <<'PY'
import os
from pathlib import Path
d=Path('/tmp/lite_flat2.js'); s=d.read_text()
j=s.index('  } catch (e) { console.error')
d.write_text(s[:j]+Path(os.environ['D'], 'lite_guard.js').read_text()+s[j:])
PY
node $D/prune.js /tmp/lite_flat2.js "$3"
node --check "$3"
