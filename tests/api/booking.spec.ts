import { test, expect, request } from '@playwright/test';

const BASE_URL = 'https://restful-booker.herokuapp.com';

test.describe('Booking API', () => {

  test('GET all bookings returns 200 and array', async () => {
    const api = await request.newContext();
    const response = await api.get(`${BASE_URL}/booking`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test('GET single booking returns correct structure', async () => {
    const api = await request.newContext();
    const response = await api.get(`${BASE_URL}/booking/1`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('firstname');
    expect(body).toHaveProperty('lastname');
    expect(body).toHaveProperty('totalprice');
    expect(body).toHaveProperty('depositpaid');
    expect(body).toHaveProperty('bookingdates');
  });

});

test.describe('Booking CRUD flow', () => {

  test('create and delete booking', async () => {
    const api = await request.newContext();

    // Auth
    const authResponse = await api.post(`${BASE_URL}/auth`, {
      data: { username: 'admin', password: 'password123' }
    });
    expect(authResponse.status()).toBe(200);
    const { token } = await authResponse.json();
    expect(token).toBeTruthy();

    // Create
    const createResponse = await api.post(`${BASE_URL}/booking`, {
      data: {
        firstname: 'Bogdan',
        lastname: 'Carcadea',
        totalprice: 150,
        depositpaid: true,
        bookingdates: { checkin: '2026-08-01', checkout: '2026-08-07' },
        additionalneeds: 'Breakfast'
      }
    });
    expect(createResponse.status()).toBe(200);
    const { bookingid, booking } = await createResponse.json();
    expect(bookingid).toBeTruthy();
    expect(booking.firstname).toBe('Bogdan');

    // Delete
    const deleteResponse = await api.delete(`${BASE_URL}/booking/${bookingid}`, {
      headers: { Cookie: `token=${token}` }
    });
    expect(deleteResponse.status()).toBe(201);

    // Verify deleted
    const verifyResponse = await api.get(`${BASE_URL}/booking/${bookingid}`);
    expect(verifyResponse.status()).toBe(404);
  });

});