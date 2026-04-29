# Card Validation API

A REST API that validates card numbers using the Luhn algorithm. Built with TypeScript, Express, and a strict Test-Driven Development approach.

---

## Requirements

- Node.js v18 or higher
- npm v8 or higher

---

## Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd card-validator

# 2. Install dependencies
npm install

# 3. Run tests
npm test

# 4. Start the server
npm run build
npm start
```

The server runs on `http://localhost:3000` by default. Set a different port with the `PORT` environment variable:

```bash
PORT=8080 npm start
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

The test suite covers 5 files across 61 tests:

| File                  | What it tests                                   |
| --------------------- | ----------------------------------------------- |
| `luhn.test.ts`        | Luhn algorithm — pure function, no HTTP         |
| `validator.test.ts`   | Input sanitization and validation gates         |
| `service.test.ts`     | Service layer — single and batch async pipeline |
| `unified.test.ts`     | HTTP endpoint — request/response contract       |
| `rateLimiter.test.ts` | Rate limiting — 429 responses and headers       |

---

## API

### `POST /validate`

Validates a card number or a list of card numbers.

**The endpoint detects input type from the value of `cardNumber` and mirrors the shape in the response.**

---

#### Single input

```bash
curl -X POST http://localhost:3000/validate \
  -H "Content-Type: application/json" \
  -d '{ "cardNumber": "4532015112830366" }'
```

Response — flat object:

```json
{
  "input": "4532015112830366",
  "valid": true
}
```

Invalid number:

```json
{
  "input": "4532015112830367",
  "valid": false,
  "error": "Card number failed Luhn checksum validation."
}
```

---

#### Batch input

```bash
curl -X POST http://localhost:3000/validate \
  -H "Content-Type: application/json" \
  -d '{ "cardNumber": ["4532015112830366", "4532015112830367", "not-a-number"] }'
```

Response — wrapped array:

```json
{
  "results": [
    { "input": "4532015112830366", "valid": true },
    {
      "input": "4532015112830367",
      "valid": false,
      "error": "Card number failed Luhn checksum validation."
    },
    {
      "input": "not-a-number",
      "valid": false,
      "error": "Input must contain digits only (spaces and dashes are allowed as separators)."
    }
  ]
}
```

---

#### Accepted input formats

Spaces and dashes are stripped before validation. All three of these are equivalent:

```
"4532015112830366"
"4532 0151 1283 0366"
"4532-0151-1283-0366"
```

---

### Status codes

| Code  | Meaning                                                  |
| ----- | -------------------------------------------------------- |
| `200` | Request processed — check `valid` field for the outcome  |
| `400` | Array input exceeds the 100-item limit                   |
| `422` | `cardNumber` field is missing from the request body      |
| `429` | Rate limit exceeded (100 requests per 15 minutes per IP) |
| `404` | Route not found                                          |

---

### Validation rules

A number is valid if it passes all four gates in order:

1. **Exists** — not null, not undefined, not empty or whitespace
2. **String type** — must be a string (or array of strings for batch)
3. **Digits only** — after stripping spaces and dashes, only `0–9` are allowed
4. **Length** — 13 to 19 digits (inclusive)
5. **Luhn checksum** — passes the Luhn algorithm

---

## Project Structure

```
src/
  types.ts              — shared interfaces and constants
  utils/
    luhn.ts             — pure Luhn algorithm function
  validator/
    validateInput.ts    — input sanitization and validation gates
  service/
    cardService.ts      — async validation pipeline (single + batch)
  controller/
    cardController.ts   — HTTP layer: request parsing, response shaping
  app.ts                — Express app factory (buildApp)
  index.ts              — server entry point

tests/
  luhn.test.ts
  validator.test.ts
  service.test.ts
  unified.test.ts
  rateLimiter.test.ts
```
