"""═══════════════════════════════════════════════════════
  ◢◤◥◣   K R O N O S   ·   A R K H E   ·   Z E R O   ◥◣◢◤
  ◯_●                                                 ◯_●
 
  [ 51% HUMANO ]  [ 49% IA ]  [ 100% REAL ]
 
  "El legado no se hereda. Se firma."
 ═══════════════════════════════════════════════════════"""

from __future__ import annotations


"""Hash primario del sistema: SHA3-512."""


import hashlib


def sha3_512_hex(payload: bytes) -> str:
    """Devuelve el SHA3-512 de payload en hexadecimal minusculas."""
    return hashlib.sha3_512(payload).hexdigest()
