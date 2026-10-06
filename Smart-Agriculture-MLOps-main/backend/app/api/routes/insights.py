from fastapi import APIRouter

from ... import database

router = APIRouter(prefix="/api/insights", tags=["insights"])


@router.get("")
def get_insights() -> dict:
    return database.get_insights()
