import { validateInput } from '../validators/validateInput';
import { luhn } from '../utils/luhn';
import { type CardResult, BATCH_MAX_SIZE, CONCURRENCY_LIMIT } from '../types/types';

import pLimit from 'p-limit';


export function validateOne(rawInput: unknown): CardResult {
  const input = typeof rawInput === 'string' ? rawInput : String(rawInput);

  const inputResult = validateInput(rawInput);

  if (!inputResult.valid || !inputResult.sanitized) {
    return { input, valid: false, error: inputResult.error };
  }

  const passesLuhn = luhn(inputResult.sanitized);

  if (!passesLuhn) {
    return {
      input,
      valid: false,
      error: 'Card number failed Luhn checksum validation.',
    };
  }

  return { input, valid: true };
}


export async function validate(
  cardNumber: string | string[]
): Promise<CardResult[]> {
  const inputs: unknown[] = Array.isArray(cardNumber)
    ? cardNumber
    : [cardNumber];

  if (inputs.length > BATCH_MAX_SIZE) {
    throw new Error(
      `Batch size ${inputs.length} exceeds the maximum allowed size of ${BATCH_MAX_SIZE}.`
    );
  }

  if (inputs.length === 0) {
    return [];
  }

  const limit = pLimit(CONCURRENCY_LIMIT);

  const tasks = inputs.map((rawInput) =>
    limit(async (): Promise<CardResult> => validateOne(rawInput))
  );

  return Promise.all(tasks);
}