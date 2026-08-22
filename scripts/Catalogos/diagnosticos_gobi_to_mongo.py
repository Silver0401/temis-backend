"""
diagnosticos_gobi_to_mongo.py
Reconstruye la colección del catálogo CIE-10 (DIAGNOSTICO_SIS) a partir de
'GOBI Salud Diagnosticos Apr 24.xlsx'.

BORRA la colección completa y la vuelve a cargar: es un catálogo, no datos del
usuario, y así el script es repetible sin chocar con el índice único de
CATALOG_KEY.

Variables del .env:
  NOT_MONGODB_URL   — URI de MongoDB Atlas (requerido)
  NOT_DB_NAME       — base de datos (default: test)
  NOT_COLLECTION    — colección      (default: catalogo-dxcie-10)

Uso:
  python3 scripts/Catalogos/diagnosticos_gobi_to_mongo.py
  python3 scripts/Catalogos/diagnosticos_gobi_to_mongo.py --dry-run
"""

import os
import sys
from pathlib import Path

import certifi
from openpyxl import load_workbook
from pymongo import MongoClient, errors, ASCENDING, TEXT

# ── Cargar .env desde la raíz del proyecto ────────────────────────────────────
try:
    from dotenv import load_dotenv
    env_file = Path(__file__).resolve().parent.parent.parent / ".env"
    if not env_file.exists():
        env_file = Path(__file__).resolve().parent.parent.parent / ".env.dev"
    load_dotenv(dotenv_path=env_file)
    print(f"Variables cargadas desde: {env_file}")
except ImportError:
    print("AVISO: python-dotenv no instalado. Instala con: pip install python-dotenv\n")

# ── Configuración ─────────────────────────────────────────────────────────────
CATALOG_DIR = os.environ.get(
    "NOT_CATALOG_DIR",
    os.path.expanduser(
        "~/Library/Mobile Documents/com~apple~CloudDocs/Documents/"
        "Legal Docs/docs-cronos/NOM-024/GIIS/Catálogos"
    ),
)
EXCEL_PATH  = os.path.join(CATALOG_DIR, "GOBI Salud Diagnosticos Apr 24.xlsx")
MONGO_URI   = os.environ.get("NOT_MONGODB_URL", "")
DB_NAME     = os.environ.get("NOT_DB_NAME", "test")
COLLECTION  = os.environ.get("NOT_COLLECTION", "catalogo-dxcie-10")
BATCH_SIZE  = 500
# ─────────────────────────────────────────────────────────────────────────────


def normalize_header(name) -> str:
    """
    Nombre de columna listo para usarse como llave de Mongo.

    El Excel de GOBI trae cuatro encabezados con un espacio al final
    ('CLAVE_CAPITULO ', 'CAPITULO ', 'ES_SUIVE_MORB ', 'EPI_CLAVE '), y ese
    espacio viajaba tal cual a la llave del documento. El resultado era un campo
    que ningún esquema declara, y `records.create` rechazaba el diagnóstico por
    propiedad desconocida.

    Es `strip()`, NO "quitar espacios": 'EPI_CLAVE_DESC 2024' lleva un espacio
    intermedio que sí forma parte del nombre y debe conservarse.
    """
    return str(name).strip() if name is not None else ""


def clean_value(val):
    """Celda vacía -> None. Los flotantes enteros se guardan como int."""
    if val is None:
        return None
    if isinstance(val, str):
        val = val.strip()
        return val if val else None
    if isinstance(val, float) and val.is_integer():
        return int(val)
    return val


def read_rows(excel_path: str):
    """Devuelve (encabezados, filas) leyendo la primera hoja del libro."""
    wb = load_workbook(excel_path, read_only=True, data_only=True)
    ws = wb[wb.sheetnames[0]]
    filas = ws.iter_rows(values_only=True)

    crudos = next(filas)
    headers = [normalize_header(h) for h in crudos]

    sucios = [(c, h) for c, h in zip(crudos, headers) if str(c or "") != h]
    if sucios:
        print("\n  Encabezados normalizados:")
        for crudo, limpio in sucios:
            print(f"    {crudo!r} → {limpio!r}")

    vistos = {}
    for h in headers:
        if h:
            vistos[h] = vistos.get(h, 0) + 1
    repetidos = [h for h, n in vistos.items() if n > 1]
    if repetidos:
        raise SystemExit(f"ERROR: encabezados duplicados tras normalizar: {repetidos}")

    documentos = []
    for fila in filas:
        doc = {
            h: clean_value(v)
            for h, v in zip(headers, fila)
            if h  # columnas sin encabezado se descartan
        }
        # Una fila sin CATALOG_KEY no es un diagnóstico; suele ser relleno final.
        if doc.get("CATALOG_KEY"):
            documentos.append(doc)

    wb.close()
    return headers, documentos


def create_indexes(col):
    print("\nCreando índices…")
    col.create_index([("CATALOG_KEY", ASCENDING)], unique=True, name="idx_catalog_key")
    print("  ✓ CATALOG_KEY  (único, exacto)")
    col.create_index([("NOMBRE", TEXT)], name="idx_nombre_text")
    print("  ✓ NOMBRE       (texto, búsqueda parcial)")
    print("Índices creados.\n")


def load_and_insert(excel_path, mongo_uri, db_name, collection, dry_run=False):
    if not mongo_uri:
        print("ERROR: NOT_MONGODB_URL no está definida en el .env")
        return

    print(f"Leyendo archivo: {excel_path}")
    headers, documentos = read_rows(excel_path)
    print(f"  → {len(documentos)} filas  |  {len([h for h in headers if h])} columnas")

    if dry_run:
        print("\n--dry-run: no se escribe nada. Llaves resultantes:")
        for h in headers:
            if h:
                print(f"    {h!r}")
        return

    print("\nConectando a MongoDB…")
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5_000, tlsCAFile=certifi.where())
    try:
        client.admin.command("ping")
    except errors.ServerSelectionTimeoutError as e:
        print(f"\nERROR: No se pudo conectar a MongoDB.\n  Detalle: {e}")
        return

    col = client[db_name][collection]
    print(f"  → Base de datos : {db_name}")
    print(f"  → Colección     : {collection}")

    # Reconstrucción completa: el catálogo se reemplaza, no se mezcla.
    previos = col.count_documents({})
    if previos:
        print(f"\nBorrando {previos} documentos previos…")
        col.delete_many({})

    inserted = 0
    errors_count = 0

    for start in range(0, len(documentos), BATCH_SIZE):
        lote = documentos[start : start + BATCH_SIZE]
        try:
            result = col.insert_many(lote, ordered=False)
            inserted += len(result.inserted_ids)
        except errors.BulkWriteError as bwe:
            inserted     += bwe.details.get("nInserted", 0)
            errors_count += len(bwe.details.get("writeErrors", []))

        pct = min((start + BATCH_SIZE) / len(documentos) * 100, 100)
        print(f"  Progreso: {pct:5.1f}%  ({inserted} insertados)", end="\r")

    print("\n\nListo.")
    print(f"  Documentos insertados : {inserted}")
    if errors_count:
        print(f"  Documentos con error  : {errors_count}")
    print(f"  Colección final       : {db_name}.{collection}")

    create_indexes(col)
    client.close()


if __name__ == "__main__":
    load_and_insert(
        EXCEL_PATH, MONGO_URI, DB_NAME, COLLECTION, dry_run="--dry-run" in sys.argv
    )
