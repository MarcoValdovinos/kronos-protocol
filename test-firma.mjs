import { webcrypto as crypto } from 'crypto';
import { firmarDoble, verificarDobleFirma } from './src/registry/doble-firma.js';

async function pruebaDeFuego() {
  console.log("══════════════════════════════════════════════");
  console.log(" 🔥 PRUEBA DE FUEGO: DOBLE FIRMA ED25519 (51/49)");
  console.log("══════════════════════════════════════════════\n");

  // 1. Generar Llaves Criptográficas (Ed25519)
  console.log("⏳ Generando llaves Ed25519 (Humano e IA)...");
  const llavesHumano = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  const llavesIA = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);

  // 2. Crear y Firmar el Documento
  const documentoOriginal = "Este es un contrato legal de propiedad intelectual.";
  console.log("📝 Documento original:", documentoOriginal);

  const firma = await firmarDoble({
    contenido: documentoOriginal,
    agenteIa: "ARKHE-AI-49",
    llavePrivHumano: llavesHumano.privateKey,
    llavePrivIA: llavesIA.privateKey
  });
  console.log("✍️  Documento firmado (Hash:", firma.documento_hash.substring(0, 16) + "...)\n");

  // 3. Validar Documento Original (Debe dar VERDE)
  console.log("🟢 TEST 1: Verificando documento original (Debe ser VÁLIDO)...");
  const check1 = await verificarDobleFirma(firma, llavesHumano.publicKey, llavesIA.publicKey);
  console.log("   Resultado:", check1.veredicto);
  console.log("   Firma Humano:", check1.firmas_independientes?.humano ? "✅ VÁLIDA" : "❌ INVÁLIDA");
  console.log("   Firma IA:    ", check1.firmas_independientes?.ia ? "✅ VÁLIDA" : "❌ INVÁLIDA");

  // 4. Simular un Ataque (Alterar el Hash)
  console.log("\n🚨 TEST 2: Simulando un ataque (Alterando el hash)...");
  firma.documento_hash = "0000000000000000000000000000000000000000000000000000000000000000";
  
  const check2 = await verificarDobleFirma(firma, llavesHumano.publicKey, llavesIA.publicKey);
  console.log("   Resultado:", check2.veredicto);
  console.log("   Firma Humano:", check2.firmas_independientes?.humano ? "✅ VÁLIDA" : "❌ INVÁLIDA (BLOQUEADO)");
  console.log("   Firma IA:    ", check2.firmas_independientes?.ia ? "✅ VÁLIDA" : "❌ INVÁLIDA (BLOQUEADO)");

  console.log("\n══════════════════════════════════════════════");
  console.log(" 🏆 VEREDICTO FINAL:");
  if (check1.valida === true && check2.valida === false) {
    console.log(" ✅ EL PARCHE FUNCIONA: El sistema acepta lo real y bloquea lo falso.");
  } else {
    console.log(" ❌ ERROR: La validación falló. Revisar código.");
  }
  console.log("══════════════════════════════════════════════");
}

pruebaDeFuego().catch(console.error);
