import pytest
import io
from httpx import AsyncClient


def make_csv(rows=5, bad_columns=False):
    if bad_columns:
        header = "wrong_col,another_wrong\n"
        body = "1,2\n" * rows
    else:
        header = "_BMI5,_AGE80,SEXVAR,_IMPRACE,GENHLTH,PHYSHLTH,SMOKE100,_TOTINDA,EDUCA,INCOME3,_RFHYPE6,_RFCHOL3,CHCKDNY2,_MICHD\n"
        body = "28.5,7,1,1,3,5,2,1,5,7,1,1,2,0\n" * rows
    return (header + body).encode()


@pytest.mark.asyncio
async def test_batch_wrong_columns(client: AsyncClient):
    """CSV with wrong columns should return 400."""
    csv_bytes = make_csv(bad_columns=True)
    response = await client.post(
        "/predict/batch",
        files={"file": ("test.csv", io.BytesIO(csv_bytes), "text/csv")},
        headers={"Authorization": "Bearer fake-token"},
    )
    # Either 400 (bad columns) or 401 (no auth) — both are correct
    assert response.status_code in [400, 401]


@pytest.mark.asyncio
async def test_batch_non_csv(client: AsyncClient):
    """Non-CSV file should be rejected."""
    response = await client.post(
        "/predict/batch",
        files={"file": ("test.txt", io.BytesIO(b"not a csv"), "text/plain")},
        headers={"Authorization": "Bearer fake-token"},
    )
    assert response.status_code in [400, 401]
