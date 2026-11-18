import request from 'supertest';
import app from './server.js';

test('GET /api/ciudades debe retornar un código 200', async () => {
    const response = await request(app).get('/api/ciudades');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
});