import fs from 'fs';
import path from 'path';

const filesToFix = [
  'apps/api/main.py',
  'src/kronos360/crypto/audit_log.py',
  'src/kronos360/crypto/guard.py',
  'src/kronos360/crypto/hashing.py',
  'src/kronos360/crypto/keyfile.py',
  'src/kronos360/crypto/signatures.py'
];

let fixed = 0;

for (const rel of filesToFix) {
  const abs = path.resolve(rel);
  if (!fs.existsSync(abs)) {
    console.log(`⚠️  No existe: ${rel}`);
    continue;
  }

  let content = fs.readFileSync(abs, 'utf8');
  const lines = content.split('\n');

  // Buscar línea del from __future__
  const futureLineIdx = lines.findIndex(l => l.trim().startsWith('from __future__ import'));
  if (futureLineIdx === -1) {
    console.log(`⏭️  Sin from __future__: ${rel}`);
    continue;
  }

  // Extraer esa línea y quitarla
  const futureLine = lines[futureLineIdx];
  lines.splice(futureLineIdx, 1);

  // Buscar el cierre del sello (segunda aparición de `"""` en las primeras 10 líneas)
  let closingIdx = -1;
  let count = 0;
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    if (lines[i].includes('"""')) {
      count++;
      if (count === 2) {
        closingIdx = i;
        break;
      }
    }
  }

  // Insertar from __future__ justo después del cierre del sello
  if (closingIdx !== -1) {
    lines.splice(closingIdx + 1, 0, '', futureLine);
  } else {
    // Si no hay sello, poner al principio
    lines.unshift(futureLine);
  }

  fs.writeFileSync(abs, lines.join('\n'));
  console.log(`✅ Corregido: ${rel}`);
  fixed++;
}

console.log(`\n🏁 ${fixed} archivos corregidos.`);
