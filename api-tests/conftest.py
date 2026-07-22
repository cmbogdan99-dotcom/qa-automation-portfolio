"""Shared fixtures for the restful-booker API suite.

The public demo at https://restful-booker.herokuapp.com resets periodically,
so every test creates the data it needs instead of relying on seed records.
"""
import pytest
import requests

BASE_URL = "https://restful-booker.herokuapp.com"
ADMIN_USER = "admin"
ADMIN_PASS = "password123"

# Default headers the API expects on write operations.
JSON_HEADERS = {"Content-Type": "application/json", "Accept": "application/json"}


@pytest.fixture(scope="session")
def base_url():
    """Root URL of the API under test."""
    return BASE_URL


@pytest.fixture(scope="session")
def auth_token(base_url):
    """Session-scoped auth token used for update and delete calls.

    Fetched once per run to keep the flaky public demo happy.
    """
    response = requests.post(
        f"{base_url}/auth",
        json={"username": ADMIN_USER, "password": ADMIN_PASS},
        headers=JSON_HEADERS,
        timeout=30,
    )
    assert response.status_code == 200, f"auth failed: {response.text}"
    token = response.json().get("token")
    assert token, "no token returned by /auth"
    return token


@pytest.fixture
def sample_payload():
    """A fresh, valid booking payload. Callable-free so each test mutates its own copy."""
    return {
        "firstname": "Bogdan",
        "lastname": "Carcadea",
        "totalprice": 150,
        "depositpaid": True,
        "bookingdates": {"checkin": "2026-08-01", "checkout": "2026-08-07"},
        "additionalneeds": "Breakfast",
    }


@pytest.fixture
def created_booking(base_url, sample_payload):
    """Create a booking, yield (id, payload), then clean it up.

    Cleanup tolerates a booking already gone (the demo may have reset).
    """
    response = requests.post(
        f"{base_url}/booking",
        json=sample_payload,
        headers=JSON_HEADERS,
        timeout=30,
    )
    assert response.status_code == 200, f"create failed: {response.text}"
    booking_id = response.json()["bookingid"]

    yield booking_id, sample_payload

    requests.delete(
        f"{base_url}/booking/{booking_id}",
        headers={"Cookie": f"token={_safe_token(base_url)}"},
        timeout=30,
    )


def _safe_token(base_url):
    """Best-effort token for teardown so cleanup never blocks the suite."""
    try:
        r = requests.post(
            f"{base_url}/auth",
            json={"username": ADMIN_USER, "password": ADMIN_PASS},
            headers=JSON_HEADERS,
            timeout=30,
        )
        return r.json().get("token", "")
    except requests.RequestException:
        return ""
