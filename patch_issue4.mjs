import fs from 'fs';
import path from 'path';

const possibleFiles = [
  'cimiento/cripto-core/core.js',
  'cimiento/storage-dexie/storage.js',
  'cimiento/storage-dexie/storage-v2.js'
];

const verificationCode = `
    // 🔗 Verificación de la cadena de hashes al arrancar (Issue #4)
    const logs = await this.db.log.toArray();
    logs.sort((a, b) => a.indice - b.indice);
    for (let i = 1; i < logs.length; i++) {
      if (logs[i].hash_previo !== logs[i - 1].hash_entrada) {
        throw new Error("LOG ROTO en entrada " + i);
      }
    }
`;

let patched = false;

for (const relPath of possibleFiles) {
  const filePath = path.resolve(relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  No existe: ${relPath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Buscar el método init() (async init() o init())
  const initRegex = /async\s+init\s*\(\)\s*\{/;
  const match = content.match(initRegex);

  if (!match) {
    console.log(`⚠️  No se encontró init() en: ${relPath}`);
    continue;
  }

  const initIndex = match.index + match[0].length;
  // Insertar el código justo después de la apertura de init()
  const newContent =
    content.slice(0, initIndex) +
    verificationCode +
    content.slice(initIndex);

  fs.writeFileSync(filePath, newContent);
  console.log(`✅ Parcheado: ${relPath}`);
  patched = true;
  break; // solo parcheamos el primer archivo que tenga init()
}

if (!patched) {
  console.error('❌ No se pudo parchear ningún archivo. Revisa las rutas o el método init().');
}
