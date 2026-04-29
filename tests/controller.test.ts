import request from 'supertest';
import { buildApp } from '../src/app';

const app = buildApp();

describe('POST /validate — unified endpoint', () => {

  // SINGLE INPUT 

  describe('single string input → flat response', () => {
    test('returns { input, valid: true } for a valid number', async () => {
      const res = await request(app)
        .post('/validate')
        .send({ cardNumber: '4532015112830366' });

      expect(res.status).toBe(200);
      expect(res.body.input).toBe('4532015112830366');
      expect(res.body.valid).toBe(true);
      expect(res.body.results).toBeUndefined();
    });

    test('returns { input, valid: false, error } for an invalid number', async () => {
      const res = await request(app)
        .post('/validate')
        .send({ cardNumber: '4532015112830367' });

      expect(res.status).toBe(200);
      expect(res.body.input).toBe('4532015112830367');
      expect(res.body.valid).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.results).toBeUndefined();
    });

    test('returns valid: false for an empty string', async () => {
      const res = await request(app)
        .post('/validate')
        .send({ cardNumber: '' });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(false);
      expect(res.body.results).toBeUndefined();
    });

    test('returns valid: false for a non-digit string', async () => {
      const res = await request(app)
        .post('/validate')
        .send({ cardNumber: 'not-a-number' });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(false);
      expect(res.body.results).toBeUndefined();
    });

    test('accepts a space-formatted number and returns flat result', async () => {
      const res = await request(app)
        .post('/validate')
        .send({ cardNumber: '4532 0151 1283 0366' });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.results).toBeUndefined();
    });

    test('accepts a dash-formatted number and returns flat result', async () => {
      const res = await request(app)
        .post('/validate')
        .send({ cardNumber: '4532-0151-1283-0366' });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.results).toBeUndefined();
    });
  });

  // BATCH INPUT (array)

  describe('array input → results array response', () => {
    test('returns { results: [...] } for a batch of valid numbers', async () => {
      const res = await request(app)
        .post('/validate')
        .send({
          cardNumber: [
            '4532015112830366',
            '5425233430109903',
            '378282246310005',
          ],
        });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results).toHaveLength(3);
      expect(res.body.valid).toBeUndefined();   // no flat field
      expect(res.body.input).toBeUndefined();   // no flat field
    });

    test('marks all valid numbers as valid in the results array', async () => {
      const res = await request(app)
        .post('/validate')
        .send({
          cardNumber: ['4532015112830366', '5425233430109903'],
        });

      res.body.results.forEach((r: { valid: boolean }) => {
        expect(r.valid).toBe(true);
      });
    });

    test('returns an empty results array for an empty array input', async () => {
      const res = await request(app)
        .post('/validate')
        .send({ cardNumber: [] });

      expect(res.status).toBe(200);
      expect(res.body.results).toHaveLength(0);
    });
  });

  // MIXED VALID / INVALID 

  describe('mixed valid and invalid in a batch', () => {
    test('reports each result independently and preserves input order', async () => {
      const res = await request(app)
        .post('/validate')
        .send({
          cardNumber: [
            '4532015112830366', // valid
            '4532015112830367', // invalid — bad checksum
            '5425233430109903', // valid
            'not-a-number',    // invalid — non-digit
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.results).toHaveLength(4);
      expect(res.body.results[0].valid).toBe(true);
      expect(res.body.results[1].valid).toBe(false);
      expect(res.body.results[2].valid).toBe(true);
      expect(res.body.results[3].valid).toBe(false);
    });

    test('each result echoes its original input string', async () => {
      const res = await request(app)
        .post('/validate')
        .send({
          cardNumber: ['4532015112830366', '4532015112830367'],
        });

      expect(res.body.results[0].input).toBe('4532015112830366');
      expect(res.body.results[1].input).toBe('4532015112830367');
    });

    test('invalid results include an error message, valid ones do not', async () => {
      const res = await request(app)
        .post('/validate')
        .send({ cardNumber: ['4532015112830366', '123'] });

      expect(res.body.results[0].error).toBeUndefined();
      expect(res.body.results[1].error).toBeDefined();
    });
  });

  //  EDGE CASES 

  describe('edge cases', () => {
    test('returns 400 when the array exceeds 100 items', async () => {
      const oversized = Array(101).fill('4532015112830366');
      const res = await request(app)
        .post('/validate')
        .send({ cardNumber: oversized });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test('returns 422 when the cardNumber field is missing', async () => {
      const res = await request(app)
        .post('/validate')
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.error).toBeDefined();
    });

    test('accepts exactly 100 items (upper boundary) and returns results array', async () => {
      const maxBatch = Array(100).fill('4532015112830366');
      const res = await request(app)
        .post('/validate')
        .send({ cardNumber: maxBatch });

      expect(res.status).toBe(200);
      expect(res.body.results).toHaveLength(100);
    });
  });

});