from datetime import datetime
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from ... import database

router = APIRouter(prefix="/api/fields", tags=["fields"])


class FieldInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=80)
    crop: str = Field(min_length=1, max_length=60)
    area_hectares: float = Field(gt=0, le=1_000_000)
    status: Literal["Growing well", "Needs attention", "Ready for harvest"] = "Growing well"
    progress: int = Field(default=0, ge=0, le=100)


class FieldRecord(FieldInput):
    id: str
    created_at: datetime


@router.get("", response_model=list[FieldRecord])
def get_fields() -> list[dict]:
    return database.list_fields()


@router.post("", response_model=FieldRecord, status_code=201)
def add_field(field: FieldInput) -> dict:
    return database.create_field(field.model_dump())


@router.put("/{field_id}", response_model=FieldRecord)
def edit_field(field_id: str, field: FieldInput) -> dict:
    updated = database.update_field(field_id, field.model_dump())
    if updated is None:
        raise HTTPException(status_code=404, detail="Field not found.")
    return updated


@router.delete("/{field_id}", status_code=204)
def remove_field(field_id: str) -> None:
    if not database.delete_field(field_id):
        raise HTTPException(status_code=404, detail="Field not found.")
