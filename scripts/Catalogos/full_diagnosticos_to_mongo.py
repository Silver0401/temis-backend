"""
diagnosticos_to_mongo.py
Carga el archivo DIAGNOSTICOS.xlsx desde Downloads e inserta
cada fila como un documento en MongoDB.

Lee la conexión desde el archivo .env del proyecto (cronos-backend/).
Variables requeridas en .env:
  NOT_MONGODB_URL   — URI completo de MongoDB Atlas
Opcionales:
  NOT_DB_NAME       — nombre de la base de datos (default: test)
  NOT_COLLECTION    — nombre de la colección   (default: cie-catalog)
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
    # El script vive en scripts/, sube un nivel para encontrar .env
    env_file = Path(__file__).resolve().parent.parent.parent / ".env.prod"
    if not env_file.exists():
        # Intenta .env.dev como fallback
        env_file = Path(__file__).resolve().parent.parent.parent / ".env.dev"
    load_dotenv(dotenv_path=env_file)
    print(f"Variables cargadas desde: {env_file}")
except ImportError:
    print("AVISO: python-dotenv no está instalado. Instálalo con: pip install python-dotenv")
    print("       Se usarán las variables de entorno del sistema si existen.\n")

# ── Configuración ─────────────────────────────────────────────────────────────
CATALOG_DIR = os.environ.get(
    "NOT_CATALOG_DIR",
    os.path.expanduser(
        "~/Library/Mobile Documents/com~apple~CloudDocs/Documents/"
        "Legal Docs/docs-cronos/NOM-024/GIIS/Catálogos"
    ),
)
EXCEL_PATH  = os.path.join(CATALOG_DIR, "DIAGNOSTICOS.xlsx")
MONGO_URI   = os.environ.get("NOT_MONGODB_URL", "")
DB_NAME     = os.environ.get("NOT_DB_NAME", "test")
COLLECTION  = os.environ.get("NOT_COLLECTION", "cie-catalog")
BATCH_SIZE  = 500
# ─────────────────────────────────────────────────────────────────────────────


def clean_value(val):
    """Convierte tipos incompatibles con BSON a tipos nativos de Python."""
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
    """Convierte una fila de DataFrame en un documento MongoDB."""
    return {col: clean_value(row[col]) for col in row.index}


def load_and_insert(excel_path: str, mongo_uri: str, db_name: str, collection: str):
    if not mongo_uri:
        print("ERROR: NOT_MONGODB_URL no está definida.")
        print("       Revisa tu archivo .env o .env.dev en la raíz del proyecto.")
        return

    # 1. Leer Excel
    print(f"Leyendo archivo: {excel_path}")
    df = pd.read_excel(excel_path, dtype_backend="numpy_nullable")
    total_rows = len(df)
    print(f"  → {total_rows} filas  |  {len(df.columns)} columnas")

    # 2. Conectar a MongoDB
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

    # 3. Insertar en lotes
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
