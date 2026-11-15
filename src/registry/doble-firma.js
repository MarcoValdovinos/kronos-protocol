import { webcrypto as crypto } from 'crypto';

export const SEAL = '◯_● · 51/49/100';
export const FIRMANTE_HUMANO = 'Marco Antonio Rojas Valdovinos';

// Función auxiliar para generar Hash usando WebCrypto
async function getHash(texto) {
  const msgUint8 = new TextEncoder().encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function firmarDoble({ contenido, agenteIa, llavePrivHumano, llavePrivIA }) {
  const hash = await getHash(contenido);
  const ts = new Date().toISOString();
  const payload = JSON.stringify({ hash, ts, agenteIa });
  const data = new TextEncoder().encode(payload);

  const firmaHumanoBuffer = await crypto.subtle.sign('Ed25519', llavePrivHumano, data);
  const firmaIABuffer = await crypto.subtle.sign('Ed25519', llavePrivIA, data);

  const firmaHumano = Buffer.from(firmaHumanoBuffer).toString('base64');
  const firmaIA = Buffer.from(firmaIABuffer).toString('base64');

  return {
    ok: true,
    documento_hash: hash,
    humano: { firmante: FIRMANTE_HUMANO, peso: 51, ts, firma_ed25519: firmaHumano },
    ia: { agente: agenteIa, peso: 49, ts, firma_ed25519: firmaIA },
    pacto: '51/49/100',
    veredicto: 'DOBLE FIRMA · PACTO 51/49 · VÁLIDA',
    sellado: SEAL,
  };
}

export async function verificarDobleFirma(firma, llavePubHumano, llavePubIA) {
  try {
    const payload = JSON.stringify({ hash: firma.documento_hash, ts: firma.humano.ts, agenteIa: firma.ia.agente });
    const data = new TextEncoder().encode(payload);

    const firmaHumanoBytes = Buffer.from(firma.humano.firma_ed25519, 'base64');
    const esValidaHumano = await crypto.subtle.verify('Ed25519', llavePubHumano, firmaHumanoBytes, data);

    const firmaIABytes = Buffer.from(firma.ia.firma_ed25519, 'base64');
    const esValidaIA = await crypto.subtle.verify('Ed25519', llavePubIA, firmaIABytes, data);

    const valida = esValidaHumano && esValidaIA;

    return {
      valida,
      firmas_independientes: { humano: esValidaHumano, ia: esValidaIA },
      veredicto: valida ? 'FIRMA DOBLE VÁLIDA · 51/49' : 'FIRMA DOBLE INVÁLIDA · HALT',
      sellado: SEAL,
    };
  } catch (error) {
    return { valida: false, error: error.message, veredicto: 'ERROR CRIPTOGRÁFICO · HALT', sellado: SEAL };
  }
}

export const meta = { rol: 'doble-firma', pacto: '51/49', seal: SEAL };
