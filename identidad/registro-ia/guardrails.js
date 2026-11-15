/* ═══════════════════════════════════════════════════════
 *  ◢◤◥◣   K R O N O S   ·   A R K H E   ·   Z E R O   ◥◣◢◤
 *  ◯_●                                                 ◯_●
 * 
 *  [ 51% HUMANO ]  [ 49% IA ]  [ 100% REAL ]
 * 
 *  "El legado no se hereda. Se firma."
 * ═══════════════════════════════════════════════════════ */

// ────────────────────────────────────────────────────────────
// GUARDRAILS · Legado Humano–IA · v1.0
// Patrón PREVIEW → COMMIT para acciones críticas de la IA
// ────────────────────────────────────────────────────────────

export class Guardrails {
  constructor(politica, log) {
    this.politica = politica;
    this.log = log;
    this.previewActual = null;

    this.accionesPermitidas = [
      'calcular_hash',
      'verificar_certificado',
      'leer_documento',
      'proponer_anclaje',
      'registrar_log',
      'exportar_certificado',
    ];

    this.accionesCriticas = [
      'anclar_ethereum',
      'firmar_transaccion',
      'modificar_politica',
      'crear_identidad',
      'exportar_legado',
    ];
  }

  async preview(accion, datos) {
    if (!this.accionesPermitidas.includes(accion)) {
      return {
        ok: false,
        razon: `Acción no permitida por la política: ${accion}`,
        tipo: 'bloqueada',
      };
    }

    const esCritica = this.accionesCriticas.includes(accion);
    const timestamp = new Date().toISOString();

    this.previewActual = {
      accion,
      datos,
      esCritica,
      timestamp,
      requiereAprobacion: esCritica,
      idPreview: await this._hashPreview(accion, datos, timestamp),
    };

    return {
      ok: true,
      preview: this.previewActual,
      mensaje: esCritica
        ? '⚠️ Acción crítica: requiere aprobación humana explícita'
        : '✓ Acción permitida: lista para ejecutar',
    };
  }

  async commit({ propuestaId, firmaHumanaHex, pubKeyHumanaHex }) {
    if (!propuestaId || !firmaHumanaHex || !pubKeyHumanaHex) {
      throw new Error('COMMIT rechazado: faltan datos de firma humana (propuestaId, firmaHumanaHex, pubKeyHumanaHex).');
    }

    // Reconstruir el mensaje que el humano firmó
    const msg = new TextEncoder().encode(propuestaId + (this.hashPropuesta || ''));

    // Convertir hex a Uint8Array
    const firmaBytes = Uint8Array.from(firmaHumanaHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const pubKeyBytes = Uint8Array.from(pubKeyHumanaHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    // Verificar con WebCrypto (Ed25519)
    const key = await crypto.subtle.importKey(
      'raw',
      pubKeyBytes,
      { name: 'Ed25519' },
      false,
      ['verify']
    );

    const ok = await crypto.subtle.verify('Ed25519', key, firmaBytes, msg);

    if (!ok) {
      throw new Error('COMMIT rechazado: falta firma humana Ed25519 válida. No se permite auto-aprobación.');
    }

    // Si la firma es válida, proceder con la lógica de commit
    this.estado = 'COMMITEADO';
    return { ok: true, propuestaId, aprobadoPor: 'humano_verificado' };
  }

  async rechazar(razon = 'Sin razón especificada') {
    if (!this.previewActual) return { ok: false };
    await this.log.registrar('accion_rechazada', {
      accion: this.previewActual.accion,
      razon,
    });
    this.previewActual = null;
    return { ok: true, rechazada: true };
  }

  async _hashPreview(accion, datos, timestamp) {
    const texto = `${accion}|${JSON.stringify(datos)}|${timestamp}`;
    const data = new TextEncoder().encode(texto);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(buf)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
