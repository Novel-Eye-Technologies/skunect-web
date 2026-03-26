/**
 * Re-exports generated OpenAPI schema types with friendly names.
 *
 * Usage:
 *   import type { Api } from '@/lib/api/schema';
 *   type Assessment = Api['AssessmentResponse'];
 *   type BulkGradeRequest = Api['BulkGradeRequest'];
 *
 * These types are auto-generated from the backend OpenAPI spec.
 * Run `npm run api:sync` to regenerate after backend changes.
 * DO NOT edit generated-types.ts manually.
 */
import type { components } from './generated-types';

/** Shorthand for all backend schema types */
export type Api = components['schemas'];

/** Shorthand for all API paths */
export type { paths as ApiPaths } from './generated-types';
export type { operations as ApiOperations } from './generated-types';
