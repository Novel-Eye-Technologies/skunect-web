import type { Api } from '@/lib/api/schema';

// Response types from generated OpenAPI schemas
export type EligibleStudent = Api['EligibleStudentResponse'];
export type PromotionRecord = Api['PromotionResponse'];
export type PromoteLevelResponse = Api['PromoteLevelResponse'];
export type UnmatchedStudent = Api['UnmatchedStudent'];

// Request types from generated OpenAPI schemas
export type BulkPromoteRequest = Api['BulkPromoteRequest'];
export type PromoteLevelRequest = Api['PromoteLevelRequest'];
