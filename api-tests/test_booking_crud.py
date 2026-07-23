"""Happy-path CRUD coverage for the restful-booker /booking endpoint.

Endpoints exercised: POST /auth, GET /booking, GET /booking/{id},
POST /booking, PUT /booking/{id}, PATCH /booking/{id}, DELETE /booking/{id}.
"""
import pytest
import requests
from jsonschema import validate

from conftest import JSON_HEADERS

# Structure a single booking response must satisfy.
BOOKING_SCHEMA = {
    "type": "object",
    "required": ["firstname", "lastname", "totalprice", "depositpaid", "bookingdates"],
    "properties": {
        "firstname": {"type": "string"},
        "lastname": {"type": "string"},
        "totalprice": {"type": "number"},
        "depositpaid": {"type": "boolean"},
        "bookingdates": {
            "type": "object",
            "required": ["checkin", "checkout"],
            "properties": {
                "checkin": {"type": "string"},
                "checkout": {"type": "string"},
            },
        },
        "additionalneeds": {"type": "string"},
    },
}


@pytest.mark.crud
def test_auth_returns_token(base_url):
    response = requests.post(
        f"{base_url}/auth",
        json={"username": "admin", "password": "password123"},
        headers=JSON_HEADERS,
        timeout=30,
    )
    assert response.status_code == 200
    assert response.json().get("token")


@pytest.mark.crud
def test_list_bookings_returns_array(base_url):
    response = requests.get(f"{base_url}/booking", timeout=30)
    assert response.status_code == 200
    body = response.json()
    assert isinstance(body, list)
    # After creating our own record the list is guaranteed non-empty.
    assert all("bookingid" in item for item in body)


@pytest.mark.crud
def test_create_booking_echoes_payload(base_url, sample_payload):
    response = requests.post(
        f"{base_url}/booking", json=sample_payload, headers=JSON_HEADERS, timeout=30
    )
    assert response.status_code == 200
    body = response.json()
    assert "bookingid" in body
    assert body["booking"]["firstname"] == sample_payload["firstname"]
    assert body["booking"]["totalprice"] == sample_payload["totalprice"]
    # Cleanup.
    requests.delete(
        f"{base_url}/booking/{body['bookingid']}",
        headers={"Cookie": f"token={_token(base_url)}"},
        timeout=30,
    )


@pytest.mark.crud
def test_get_booking_by_id_matches_schema(base_url, created_booking):
    booking_id, payload = created_booking
    response = requests.get(f"{base_url}/booking/{booking_id}", timeout=30)
    assert response.status_code == 200
    body = response.json()
    validate(instance=body, schema=BOOKING_SCHEMA)
    assert body["firstname"] == payload["firstname"]
    assert body["lastname"] == payload["lastname"]


@pytest.mark.crud
def test_list_filter_by_name(base_url, created_booking):
    booking_id, payload = created_booking
    response = requests.get(
        f"{base_url}/booking",
        params={"firstname": payload["firstname"], "lastname": payload["lastname"]},
        timeout=30,
    )
    assert response.status_code == 200
    ids = [item["bookingid"] for item in response.json()]
    assert booking_id in ids


@pytest.mark.crud
def test_full_update_put(base_url, auth_token, created_booking):
    booking_id, payload = created_booking
    updated = dict(payload)
    updated["firstname"] = "Updated"
    updated["totalprice"] = 999
    response = requests.put(
        f"{base_url}/booking/{booking_id}",
        json=updated,
        headers={**JSON_HEADERS, "Cookie": f"token={auth_token}"},
        timeout=30,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["firstname"] == "Updated"
    assert body["totalprice"] == 999


@pytest.mark.crud
def test_partial_update_patch(base_url, auth_token, created_booking):
    booking_id, _ = created_booking
    response = requests.patch(
        f"{base_url}/booking/{booking_id}",
        json={"firstname": "Patched"},
        headers={**JSON_HEADERS, "Cookie": f"token={auth_token}"},
        timeout=30,
    )
    assert response.status_code == 200
    assert response.json()["firstname"] == "Patched"


@pytest.mark.crud
def test_delete_booking_then_gone(base_url, auth_token, sample_payload):
    create = requests.post(
        f"{base_url}/booking", json=sample_payload, headers=JSON_HEADERS, timeout=30
    )
    booking_id = create.json()["bookingid"]

    delete = requests.delete(
        f"{base_url}/booking/{booking_id}",
        headers={"Cookie": f"token={auth_token}"},
        timeout=30,
    )
    assert delete.status_code == 201

    verify = requests.get(f"{base_url}/booking/{booking_id}", timeout=30)
    assert verify.status_code == 404


def _token(base_url):
    r = requests.post(
        f"{base_url}/auth",
        json={"username": "admin", "password": "password123"},
        headers=JSON_HEADERS,
        timeout=30,
    )
    return r.json().get("token", "")
