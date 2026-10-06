"""Small SQLite persistence layer for the single-farm dashboard."""

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

DB_PATH = Path(__file__).resolve().parent / "smart_agriculture.db"


def _connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database() -> None:
    with _connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS fields (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                crop TEXT NOT NULL,
                area_hectares REAL NOT NULL,
                status TEXT NOT NULL DEFAULT 'Growing well',
                progress INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model TEXT NOT NULL,
                result TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )
        defaults = {
            "weather_alerts": True,
            "units": "Metric",
            "weekly_digest": True,
        }
        for key, value in defaults.items():
            connection.execute(
                "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
                (key, json.dumps(value)),
            )


def list_fields() -> list[dict[str, Any]]:
    with _connect() as connection:
        rows = connection.execute(
            "SELECT id, name, crop, area_hectares, status, progress, created_at "
            "FROM fields ORDER BY created_at DESC"
        ).fetchall()
    return [dict(row) for row in rows]


def create_field(values: dict[str, Any]) -> dict[str, Any]:
    field_id = str(uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    with _connect() as connection:
        connection.execute(
            "INSERT INTO fields (id, name, crop, area_hectares, status, progress, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                field_id,
                values["name"],
                values["crop"],
                values["area_hectares"],
                values.get("status", "Growing well"),
                values.get("progress", 0),
                created_at,
            ),
        )
    return {"id": field_id, **values, "created_at": created_at}


def update_field(field_id: str, values: dict[str, Any]) -> dict[str, Any] | None:
    allowed = {"name", "crop", "area_hectares", "status", "progress"}
    updates = {key: value for key, value in values.items() if key in allowed}
    if not updates:
        return next((field for field in list_fields() if field["id"] == field_id), None)
    assignments = ", ".join(f"{key} = ?" for key in updates)
    with _connect() as connection:
        cursor = connection.execute(
            f"UPDATE fields SET {assignments} WHERE id = ?",
            (*updates.values(), field_id),
        )
        if cursor.rowcount == 0:
            return None
        row = connection.execute(
            "SELECT id, name, crop, area_hectares, status, progress, created_at "
            "FROM fields WHERE id = ?",
            (field_id,),
        ).fetchone()
    return dict(row)


def delete_field(field_id: str) -> bool:
    with _connect() as connection:
        cursor = connection.execute("DELETE FROM fields WHERE id = ?", (field_id,))
    return cursor.rowcount > 0


def get_settings() -> dict[str, Any]:
    with _connect() as connection:
        rows = connection.execute("SELECT key, value FROM settings").fetchall()
    return {row["key"]: json.loads(row["value"]) for row in rows}


def update_settings(values: dict[str, Any]) -> dict[str, Any]:
    with _connect() as connection:
        for key, value in values.items():
            connection.execute(
                "INSERT INTO settings (key, value) VALUES (?, ?) "
                "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                (key, json.dumps(value)),
            )
    return get_settings()


def record_prediction(model: str, result: Any) -> None:
    with _connect() as connection:
        connection.execute(
            "INSERT INTO predictions (model, result, created_at) VALUES (?, ?, ?)",
            (model, json.dumps(result), datetime.now(timezone.utc).isoformat()),
        )


def get_insights() -> dict[str, Any]:
    fields = list_fields()
    with _connect() as connection:
        rows = connection.execute(
            "SELECT result, created_at FROM predictions "
            "WHERE model = ? ORDER BY id DESC LIMIT 30",
            ("random_forest_model.pkl",),
        ).fetchall()
        recent_rows = connection.execute(
            "SELECT model, result, created_at FROM predictions ORDER BY id DESC LIMIT 20"
        ).fetchall()
        prediction_count = connection.execute("SELECT COUNT(*) FROM predictions").fetchone()[0]

    yields = []
    for row in reversed(rows):
        try:
            value = float(json.loads(row["result"]))
        except (TypeError, ValueError, json.JSONDecodeError):
            continue
        yields.append({"date": row["created_at"], "yield_t_per_ha": value})

    model_names = {
        "crop_recommendation_model.pkl": "Crop recommendation",
        "fertilizer_model.pkl": "Fertilizer prediction",
        "irrigation_model.pkl": "Irrigation prediction",
        "price_prediction_model.pkl": "Price prediction",
        "random_forest_model.pkl": "Yield prediction",
    }
    recent_predictions = [
        {
            "model": model_names.get(row["model"], row["model"]),
            "result": json.loads(row["result"]),
            "date": row["created_at"],
        }
        for row in recent_rows
    ]

    return {
        "field_count": len(fields),
        "total_area_hectares": round(sum(field["area_hectares"] for field in fields), 2),
        "prediction_count": prediction_count,
        "yield_predictions": yields,
        "recent_predictions": recent_predictions,
        "latest_prediction": recent_predictions[0] if recent_predictions else None,
        "crop_count": len({field["crop"] for field in fields}),
    }
