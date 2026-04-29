import { validate, validateOne } from '../src/services/cardService';

describe('validate()', () => {

  // SINGLE STRING INPUT 

  describe('single string input', () => {
    test('resolves to a one-item array for a valid number', async () => {
      const results = await validate('4532015112830366');
      expect(results).toHaveLength(1);
      expect(results[0]!.valid).toBe(true);
    });

    test('resolves to a one-item array for an invalid number', async () => {
      const results = await validate('4532015112830367');
      expect(results).toHaveLength(1);
      expect(results[0]!.valid).toBe(false);
      expect(results[0]!.error).toBeDefined();
    });

    test('echoes the original input string in the result', async () => {
      const results = await validate('4532015112830366');
      expect(results[0]!.input).toBe('4532015112830366');
    });

    test('accepts a space-formatted number', async () => {
      const results = await validate('4532 0151 1283 0366');
      expect(results[0]!.valid).toBe(true);
    });

    test('accepts a dash-formatted number', async () => {
      const results = await validate('4532-0151-1283-0366');
      expect(results[0]!.valid).toBe(true);
    });

    test('returns valid: false for an empty string', async () => {
      const results = await validate('');
      expect(results[0]!.valid).toBe(false);
    });

    test('returns valid: false for a non-digit string', async () => {
      const results = await validate('abcdefghijklmnop');
      expect(results[0]!.valid).toBe(false);
    });

    test('returns valid: false for a too-short number', async () => {
      const results = await validate('123456789012');
      expect(results[0]!.valid).toBe(false);
    });
  });

  // ARRAY INPUT 

  describe('array input', () => {
    test('resolves to a result for every item in the array', async () => {
      const results = await validate([
        '4532015112830366',
        '5425233430109903',
        '378282246310005',
      ]);
      expect(results).toHaveLength(3);
    });

    test('marks all valid numbers as valid', async () => {
      const results = await validate([
        '4532015112830366',
        '5425233430109903',
      ]);
      results.forEach((r) => expect(r.valid).toBe(true));
    });

    test('preserves input order in results', async () => {
      const results = await validate([
        '4532015112830366', // valid
        '4532015112830367', // invalid
        '5425233430109903', // valid
      ]);
      expect(results[0]!.valid).toBe(true);
      expect(results[1]!.valid).toBe(false);
      expect(results[2]!.valid).toBe(true);
    });

    test('resolves to an empty array for an empty array input', async () => {
      const results = await validate([]);
      expect(results).toHaveLength(0);
    });

    test('rejects when the array exceeds BATCH_MAX_SIZE', async () => {
      const oversized = Array(101).fill('4532015112830366');
      await expect(validate(oversized)).rejects.toThrow(/batch size/i);
    });

    test('accepts exactly 100 items (upper boundary)', async () => {
      const maxBatch = Array(100).fill('4532015112830366');
      const results = await validate(maxBatch);
      expect(results).toHaveLength(100);
      results.forEach((r) => expect(r.valid).toBe(true));
    });
  });

  //  MIXED VALID / INVALID 

  describe('mixed valid and invalid in array', () => {
    test('reports each result independently', async () => {
      const results = await validate([
        '4532015112830366', // valid
        '4532015112830367', // invalid — bad checksum
        '5425233430109903', // valid
        'not-a-number',    // invalid — non-digit
      ]);
      expect(results[0]!.valid).toBe(true);
      expect(results[1]!.valid).toBe(false);
      expect(results[2]!.valid).toBe(true);
      expect(results[3]!.valid).toBe(false);
    });

    test('invalid results carry an error message, valid ones do not', async () => {
      const results = await validate(['4532015112830366', '123']);
      expect(results[0]!.error).toBeUndefined();
      expect(results[1]!.error).toBeDefined();
    });
  });
});


describe('validateOne()', () => {
  // Luhn checksum
  describe('invalid Luhn checksum', () => {
    test('returns { valid: false } for a number with a wrong check digit', () => {
      const result = validateOne('4532015112830367'); // check digit off by 1
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('returns { valid: false } for a sequential number', () => {
      const result = validateOne('1234567890123456');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // EMPTY INPUT 

  describe('empty / missing input', () => {
    test('returns { valid: false } for null', () => {
      const result = validateOne(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('returns { valid: false } for undefined', () => {
      const result = validateOne(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('returns { valid: false } for an empty string', () => {
      const result = validateOne('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  //  NON-DIGIT INPUT

  describe('non-digit input', () => {
    test('returns { valid: false } for alphabetic input', () => {
      const result = validateOne('abcdefghijklmnop');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('returns { valid: false } for mixed alphanumeric input', () => {
      const result = validateOne('4532abc112830366');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('returns { valid: false } for input with special characters', () => {
      const result = validateOne('4532!@#112830366');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  //  INVALID LENGTH 

  describe('invalid length', () => {
    test('returns { valid: false } for a 12-digit number (too short)', () => {
      const result = validateOne('123456789012');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('returns { valid: false } for a 20-digit number (too long)', () => {
      const result = validateOne('12345678901234567890');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  //  SANITIZED INPUT 

  describe('sanitized input (spaces and dashes stripped before validation)', () => {
    test('accepts a space-formatted valid number and validates it correctly', () => {
      const result = validateOne('4532 0151 1283 0366');
      expect(result.valid).toBe(true);
    });

    test('accepts a dash-formatted valid number and validates it correctly', () => {
      const result = validateOne('4532-0151-1283-0366');
      expect(result.valid).toBe(true);
    });

    test('rejects a formatted number that fails Luhn after sanitization', () => {
      const result = validateOne('4532-0151-1283-0367'); // wrong check digit
      expect(result.valid).toBe(false);
    });
  });

});
