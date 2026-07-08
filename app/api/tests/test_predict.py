import pytest
from httpx import AsyncClient

VALID_INPUT = {
    "_BMI5":    28.5,
    "_AGE80":   7,
    "SEXVAR":   1,
    "_IMPRACE": 1,
    "GENHLTH":  3,
    "PHYSHLTH": 5,
    "SMOKE100": 2,
    "_TOTINDA": 1,
    "EDUCA":    5,
    "INCOME3":  7,
    "_RFHYPE6": 1,
    "_RFCHOL3": 1,
    "CHCKDNY2": 2,
    "_MICHD":   0,
}


@pytest.mark.asyncio
async def test_predict_unauthenticated(client: AsyncClient):
    """Public prediction should work without auth."""
    response = await client.post("/predict", json=VALID_INPUT)
    # Will return 503 if model not loaded in test env — that's fine
    assert response.status_code in [200, 503]


@pytest.mark.asyncio
async def test_predict_invalid_bmi(client: AsyncClient):
    """BMI out of range should return 422."""
    bad_input = {**VALID_INPUT, "_BMI5": 999}
    response = await client.post("/predict", json=bad_input)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_predict_missing_field(client: AsyncClient):
    """Missing required field should return 422."""
    bad_input = {k: v for k, v in VALID_INPUT.items() if k != "_BMI5"}
    response = await client.post("/predict", json=bad_input)
    assert response.status_code == 422
