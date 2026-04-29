import type { Request, Response } from 'express';
import { validate } from '../services/cardService';
import { BATCH_MAX_SIZE } from '../types/types';


export async function validateController(
  req: Request,
  res: Response
): Promise<void> {
  // 422: missing field
  if (!('cardNumber' in req.body)) {
    res.status(422).json({
      error: 'Request body must include a "cardNumber" field.',
    });
    return;
  }

  const { cardNumber } = req.body as { cardNumber: unknown };
  const isBatch = Array.isArray(cardNumber);

  //  400: oversized array
  if (isBatch && (cardNumber as unknown[]).length > BATCH_MAX_SIZE) {
    res.status(400).json({
      error: `Batch size ${(cardNumber as unknown[]).length} exceeds the maximum of ${BATCH_MAX_SIZE}.`,
    });
    return;
  }

  const input: string | string[] = isBatch
    ? (cardNumber as string[])
    : typeof cardNumber === 'string'
      ? cardNumber
      : String(cardNumber);


  const results = await validate(input);

  if (isBatch) {
    res.status(200).json({ results });
  } else {
    res.status(200).json(results[0]);
  }
}