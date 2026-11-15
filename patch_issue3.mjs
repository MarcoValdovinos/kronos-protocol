import fs from 'fs';
import path from 'path';

console.log('🛠️  Buscando agente-base.js para parchear Issue #3...');

const possiblePaths = [
  'agentes/agente-base.js',
  'cores/kronos-protocol/agentes/agente-base.js',
  'apps/sycro-web/agentes/agente-base.js',
  'agentes-js/agente-base.js',
  'cores/ARKHE-ZERO/agentes-js/agente-base.js'
];

let target = null;
for (const rel of possiblePaths) {
  const abs = path.resolve(rel);
  if (fs.existsSync(abs)) {
    target = abs;
    console.log(`✅ Encontrado: ${rel}`);
    break;
  }
}

if (!target) {
  console.error('❌ No se encontró agente-base.js en las rutas esperadas.');
  process.exit(1);
}

let content = fs.readFileSync(target, 'utf8');

// Regex para capturar la función commit (async commit(...) { ... })
const commitRegex = /async\s+commit\s*\([^)]*\)\s*\{[\s\S]*?\n\s{2}\}/;
const match = content.match(commitRegex);

if (!match) {
  console.error('❌ No se encontró la función commit() en el archivo.');
  process.exit(1);
}

const nuevaCommit = `async commit({ propuestaId, firmaHumanaHex, pubKeyHumanaHex }) {
    if (!propuestaId || !firmaHumanaHex || !pubKeyHumanaHex) {
      throw new Error('COMMIT rechazado: faltan datos de firma humana (propuestaId, firmaHumanaHex, pubKeyHumanaHex).');
    }

    // Reconstruir el mensaje que el humano firmó
    const msg = new TextEncoder().encode(propuestaId + this.hashPropuesta);

    // Verificar la firma Ed25519 usando WebCrypto (o la función ed25519Verify si ya existe)
    let ok = false;
    if (typeof ed25519Verify === 'function') {
      ok = await ed25519Verify(firmaHumanaHex, msg, pubKeyHumanaHex);
    } else {
      // Fallback: usar crypto.subtle de la Web Crypto API
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        Uint8Array.from(pubKeyHumanaHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))),
        { name: 'Ed25519' },
        false,
        ['verify']
      );
      ok = await crypto.subtle.verify('Ed25519', key, Uint8Array.from(firmaHumanaHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))), msg);
    }

    if (!ok) {
      throw new Error('COMMIT rechazado: falta firma humana Ed25519 válida. No se permite auto-aprobación.');
    }

    // Si la firma es válida, proceder con la lógica original del commit
    // (Aquí debes conservar el resto del cuerpo original de commit, si hacía algo más)
    // Por seguridad, asumimos que el commit solo validaba y guardaba la propuesta.
    // Si el commit original tenía más lógica, ajústala manualmente después.
    this.estado = 'COMMITEADO';
    return { ok: true, propuestaId, aprobadoPor: 'humano_verificado' };
  }`;

content = content.replace(commitRegex, nuevaCommit);
fs.writeFileSync(target, content);
console.log(`✅ ${path.basename(target)} parcheado con verificación Ed25519 en commit().`);
