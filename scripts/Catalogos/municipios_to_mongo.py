"""
municipios_to_mongo.py
Carga el archivo 'Municipios 2026.xlsx' desde Downloads
e inserta cada fila como un documento en MongoDB.

Variables del .env:
  NOT_MONGODB_URL   — URI de MongoDB Atlas (requerido)
  NOT_DB_NAME       — base de datos (default: test)
  NOT_COLLECTION    — colección      (default: municipios)
"""

import os
import math
import certifi
import pandas as pd
from pathlib import Path
from pymongo import MongoClient, errors

# ── Cargar .env desde la raíz del proyecto (cronos-backend/) ──────────────────
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
EXCEL_PATH  = os.path.join(CATALOG_DIR, "Municipios 2026.xlsx")
MONGO_URI   = os.environ.get("NOT_MONGODB_URL", "")
DB_NAME     = os.environ.get("NOT_DB_NAME", "test")
COLLECTION  = os.environ.get("NOT_COLLECTION", "catalogo-municipios")
BATCH_SIZE  = 500
# ─────────────────────────────────────────────────────────────────────────────


def clean_value(val):
    if val is None:
        return None
    try:
        if pd.isna(val):
            return None
    except (TypeError, ValueError):
        pass
    if hasattr(val, "item"):
        val = val.item()
    if isinstance(val, float) and val == int(val) and not math.isinf(val):
        return int(val)
    return val


def row_to_doc(row: pd.Series) -> dict:
    return {col: clean_value(row[col]) for col in row.index}


def load_and_insert(excel_path: str, mongo_uri: str, db_name: str, collection: str):
    if not mongo_uri:
        print("ERROR: NOT_MONGODB_URL no está definida en el .env")
        return

    print(f"Leyendo archivo: {excel_path}")
    df = pd.read_excel(excel_path, dtype_backend="numpy_nullable")
    total_rows = len(df)
    print(f"  → {total_rows} filas  |  {len(df.columns)} columnas")

    print(f"\nConectando a MongoDB…")
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5_000, tlsCAFile=certifi.where())
    try:
        client.admin.command("ping")
    except errors.ServerSelectionTimeoutError as e:
        print(f"\nERROR: No se pudo conectar a MongoDB.\n  Detalle: {e}")
        return

    col = client[db_name][collection]
    print(f"  → Base de datos : {db_name}")
    print(f"  → Colección     : {collection}")

    inserted = 0
    errors_count = 0

    for start in range(0, total_rows, BATCH_SIZE):
        batch_df  = df.iloc[start : start + BATCH_SIZE]
        documents = [row_to_doc(row) for _, row in batch_df.iterrows()]
        try:
            result = col.insert_many(documents, ordered=False)
            inserted += len(result.inserted_ids)
        except errors.BulkWriteError as bwe:
            inserted     += bwe.details.get("nInserted", 0)
            errors_count += len(bwe.details.get("writeErrors", []))

        pct = min((start + BATCH_SIZE) / total_rows * 100, 100)
        print(f"  Progreso: {pct:5.1f}%  ({inserted} insertados)", end="\r")

    print(f"\n\nListo.")
    print(f"  Documentos insertados : {inserted}")
    if errors_count:
        print(f"  Documentos con error  : {errors_count}")
    print(f"  Colección final       : {db_name}.{collection}")
    client.close()


if __name__ == "__main__":
    load_and_insert(EXCEL_PATH, MONGO_URI, DB_NAME, COLLECTION)
