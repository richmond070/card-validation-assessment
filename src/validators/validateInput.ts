import { ValidationResult } from '../types/types';

const MIN_LENGTH = 13;
const MAX_LENGTH = 19;


export function validateInput(rawInput: unknown): ValidationResult {

  if (rawInput === null || rawInput === undefined) {
    return { valid: false, error: 'Input is required.' };
  }

  if (typeof rawInput !== 'string') {
    return { valid: false, error: 'Input must be a string.' };
  }

  if (rawInput.trim() === '') {
    return { valid: false, error: 'Input must not be empty.' };
  }

  //Sanitize: strip spaces and dashes only 
  const sanitized = rawInput.replace(/[\s-]/g, '');

  // Digit-only check after sanitization
  if (!/^\d+$/.test(sanitized)) {
    return {
      valid: false,
      error: 'Input must contain digits only (spaces and dashes are allowed as separators).',
    };
  }

  // Length check 
  if (sanitized.length < MIN_LENGTH) {
    return {
      valid: false,
      error: `Card number too short. Minimum ${MIN_LENGTH} digits required.`,
    };
  }

  if (sanitized.length > MAX_LENGTH) {
    return {
      valid: false,
      error: `Card number too long. Maximum ${MAX_LENGTH} digits allowed.`,
    };
  }

  return { valid: true, sanitized };
}
