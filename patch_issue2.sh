#!/bin/bash

echo "🛠️  Generando sello de tiempo RFC 3161 para verify.html (Issue #2)..."

# 1. Verificar que verify.html existe
VERIFY_FILE="verify.html"
if [ ! -f "$VERIFY_FILE" ]; then
  echo "❌ No se encontró $VERIFY_FILE. Abortando."
  exit 1
fi

# 2. Crear el directorio evidence si no existe
mkdir -p evidence

# 3. Generar la solicitud de sello de tiempo (TSQ) para verify.html
echo "⏳ Generando solicitud de sello de tiempo (TSQ)..."
openssl ts -query -data "$VERIFY_FILE" -no_nonce -sha256 -out evidence/verify.html.tsq

# 4. Enviar la solicitud a FreeTSA y guardar la respuesta (TSR)
echo "⏳ Contactando a FreeTSA para obtener el sello (TSR)..."
curl -s -H "Content-Type: application/timestamp-query" \
     --data-binary @evidence/verify.html.tsq \
     https://freetsa.org/tsr \
     -o evidence/verify.html.tsr

# 5. Verificar que el TSR se generó correctamente
if [ ! -s evidence/verify.html.tsr ]; then
  echo "❌ Error: No se pudo obtener el TSR de FreeTSA. Revisa tu conexión."
  exit 1
fi
echo "✅ TSR generado: evidence/verify.html.tsr"

# 6. Descargar el certificado de la TSA (FreeTSA)
echo "⏳ Descargando certificado de FreeTSA (tsa.crt)..."
curl -s https://freetsa.org/files/tsa.crt -o evidence/tsa.crt

if [ ! -s evidence/tsa.crt ]; then
  echo "⚠️  No se pudo descargar tsa.crt. Puedes obtenerlo manualmente desde https://freetsa.org/files/tsa.crt"
else
  echo "✅ Certificado TSA guardado: evidence/tsa.crt"
fi

# 7. Limpiar archivo temporal TSQ
rm -f evidence/verify.html.tsq

echo "🏁 Proceso completado. Archivos en evidence/:"
ls -lh evidence/verify.html.tsr evidence/tsa.crt 2>/dev/null
