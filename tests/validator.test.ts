import { validateInput } from '../src/validators/validateInput';

describe('validateInput()', () => {

  //  EMPTY / MISSING INPUT 

  describe('empty / missing input', () => {
    test('rejects null', () => {
      const result = validateInput(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('rejects undefined', () => {
      const result = validateInput(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('rejects empty string', () => {
      const result = validateInput('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('rejects whitespace-only string', () => {
      const result = validateInput('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // NON-DIGIT INPUT

  describe('non-digit characters', () => {
    test('rejects alphabetic input', () => {
      const result = validateInput('abcdefghijklmnop');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('rejects mixed alphanumeric input', () => {
      const result = validateInput('4532abc112830366');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('rejects input with special characters (!, @, #)', () => {
      const result = validateInput('4532!@#112830366');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // INPUT SANITIZATION 

  describe('input sanitization', () => {
    test('strips spaces and returns sanitized digit string', () => {
      const result = validateInput('4532 0151 1283 0366');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('4532015112830366');
    });

    test('strips dashes and returns sanitized digit string', () => {
      const result = validateInput('4532-0151-1283-0366');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('4532015112830366');
    });

    test('strips mixed spaces and dashes', () => {
      const result = validateInput('4532 0151-1283 0366');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('4532015112830366');
    });
  });

  // LENGTH VALIDATION

  describe('length validation (13–19 digits after sanitization)', () => {
    test('rejects input shorter than 13 digits', () => {
      const result = validateInput('123456789012'); // 12 digits
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('rejects input longer than 19 digits', () => {
      const result = validateInput('12345678901234567890'); // 20 digits
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('accepts exactly 13 digits (lower boundary)', () => {
      const result = validateInput('4000000000006');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('4000000000006');
    });

    test('accepts exactly 19 digits (upper boundary)', () => {
      const result = validateInput('6221260012340696448');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('6221260012340696448');
    });

    test('accepts a standard 16-digit number', () => {
      const result = validateInput('4532015112830366');
      expect(result.valid).toBe(true);
    });
  });

});
