import '@testing-library/jest-dom/vitest'

// Deterministic test env. Real values land via Vercel env in Phase 2b+.
// (Vitest already sets NODE_ENV=test; only JWT_SECRET needs a default.)
process.env.JWT_SECRET ??= 'test-jwt-secret-must-be-at-least-32-bytes-long-aaaa'
