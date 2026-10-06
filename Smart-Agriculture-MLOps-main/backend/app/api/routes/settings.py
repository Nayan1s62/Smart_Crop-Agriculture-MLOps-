from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

from ... import database

router = APIRouter(prefix="/api/settings", tags=["settings"])


class SettingsUpdate(BaseModel):
    weather_alerts: bool
    units: Literal["Metric", "Imperial"]
    weekly_digest: bool


@router.get("")
def get_settings() -> dict:
    return database.get_settings()


@router.put("")
def save_settings(settings: SettingsUpdate) -> dict:
    return database.update_settings(settings.model_dump())
