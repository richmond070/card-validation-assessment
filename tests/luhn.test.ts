import { luhn } from '../src/utils/luhn';

describe('luhn()', () => {

  describe('numbers that pass the Luhn checksum', () => {
    test('returns true for a valid 16-digit number', () => {
      expect(luhn('4532015112830366')).toBe(true);
    });

    test('returns true for another valid 16-digit number', () => {
      expect(luhn('5425233430109903')).toBe(true);
    });

    test('returns true for a valid 15-digit number', () => {
      expect(luhn('378282246310005')).toBe(true);
    });

    test('returns true for a valid 16-digit number (different prefix)', () => {
      expect(luhn('6011111111111117')).toBe(true);
    });
  });


  describe('numbers that fail the Luhn checksum', () => {
    test('returns false when the check digit is off by one', () => {
      expect(luhn('4532015112830367')).toBe(false); // valid ends in ...366
    });

    test('returns false for a sequential number', () => {
      expect(luhn('1234567890123456')).toBe(false);
    });

    test('returns false for a repeating-digit number with bad checksum', () => {
      expect(luhn('1111111111111111')).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('returns true for a valid 13-digit number (minimum boundary)', () => {
      expect(luhn('4000000000006')).toBe(true);
    });

    test('returns true for a valid 19-digit number (maximum boundary)', () => {
      expect(luhn('6221260012340696448')).toBe(true);
    });

    test('does not throw when given a single digit', () => {
      // Length validity is the validator's responsibility — luhn must not crash
      expect(() => luhn('0')).not.toThrow();
    });

    test('all-zeros passes Luhn math (0 % 10 === 0) — content checks are the validator\'s concern', () => {
      expect(luhn('0000000000000000')).toBe(true);
    });
  });

});
