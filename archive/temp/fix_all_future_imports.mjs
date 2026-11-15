import fs from 'fs';
import path from 'path';

// Función recursiva para encontrar todos los .py
function findPyFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === '__pycache__' || file === 'venv' || file === 'qv-env') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findPyFiles(fullPath));
    } else if (file.endsWith('.py')) {
      results.push(fullPath);
    }
  }
  return results;
}

const allPyFiles = findPyFiles('.');
console.log(`🔍 Encontrados ${allPyFiles.length} archivos .py. Buscando el bug del sello...`);

let fixed = 0;

for (const absPath of allPyFiles) {
  let content = fs.readFileSync(absPath, 'utf8');
  const lines = content.split('\n');

  // Solo procesar si tiene el sello Y tiene from __future__
  if (!content.includes('El legado no se hereda')) continue;
  
  const futureLineIdx = lines.findIndex(l => l.trim().startsWith('from __future__ import'));
  if (futureLineIdx === -1) continue;

  // Verificar si el from __future__ está mal ubicado (después del sello)
  const sealClosingIdx = lines.findIndex((l, i) => i < 15 && l.includes('"""') && i > 0);
  if (futureLineIdx < sealClosingIdx) continue; // Ya está bien, saltar

  // Mover el from __future__ justo después del cierre del sello
  const futureLine = lines[futureLineIdx];
  lines.splice(futureLineIdx, 1);
  
  // Buscar el cierre del sello (segunda aparición de """ en las primeras 15 líneas)
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

  if (closingIdx !== -1) {
    lines.splice(closingIdx + 1, 0, '', futureLine);
  } else {
    lines.unshift(futureLine);
  }

  fs.writeFileSync(absPath, lines.join('\n'));
  console.log(`✅ Corregido: ${path.relative('.', absPath)}`);
  fixed++;
}

console.log(`\n🏁 ${fixed} archivos corregidos en total.`);
