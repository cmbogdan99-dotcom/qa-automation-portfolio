"""Negative and edge-case coverage for the restful-booker API.

Covers rejected auth, unauthorized writes, malformed payloads and
missing resources, the cases a real booking service must get right.
"""
import pytest
import requests

from conftest import JSON_HEADERS


@pytest.mark.negative
def test_auth_with_bad_credentials_returns_no_token(base_url):
    response = requests.post(
        f"{base_url}/auth",
        json={"username": "admin", "password": "wrong"},
        headers=JSON_HEADERS,
        timeout=30,
    )
    assert response.status_code == 200  # API answers 200 with a reason, not 401.
    assert "token" not in response.json()
    assert "reason" in response.json()


@pytest.mark.negative
def test_update_without_token_is_forbidden(base_url, created_booking):
    booking_id, payload = created_booking
    response = requests.put(
        f"{base_url}/booking/{booking_id}",
        json=payload,
        headers=JSON_HEADERS,  # no auth cookie
        timeout=30,
    )
    assert response.status_code == 403


@pytest.mark.negative
def test_delete_without_token_is_forbidden(base_url, created_booking):
    booking_id, _ = created_booking
    response = requests.delete(f"{base_url}/booking/{booking_id}", timeout=30)
    assert response.status_code == 403


@pytest.mark.negative
def test_create_with_missing_fields_is_rejected(base_url):
    response = requests.post(
        f"{base_url}/booking",
        json={"firstname": "OnlyName"},
        headers=JSON_HEADERS,
        timeout=30,
    )
    # The API refuses to persist an incomplete booking (500 on this demo).
    assert response.status_code >= 400


@pytest.mark.negative
def test_get_nonexistent_booking_returns_404(base_url):
    response = requests.get(f"{base_url}/booking/99999999", timeout=30)
    assert response.status_code == 404


@pytest.mark.negative
def test_update_nonexistent_booking_returns_error(base_url, auth_token):
    response = requests.put(
        f"{base_url}/booking/99999999",
        json={
            "firstname": "Ghost",
            "lastname": "Record",
            "totalprice": 1,
            "depositpaid": False,
            "bookingdates": {"checkin": "2026-01-01", "checkout": "2026-01-02"},
        },
        headers={**JSON_HEADERS, "Cookie": f"token={auth_token}"},
        timeout=30,
    )
    assert response.status_code >= 400
