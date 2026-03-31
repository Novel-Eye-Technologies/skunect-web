import type { Api } from '@/lib/api/schema';

// Response types from generated OpenAPI schemas
export type EligibleStudent = Api['EligibleStudentResponse'];
export type PromotionRecord = Api['PromotionResponse'];

// Request types from generated OpenAPI schemas
export type BulkPromoteRequest = Api['BulkPromoteRequest'];
