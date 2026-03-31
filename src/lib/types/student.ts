import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type CreateStudentRequest = Api['CreateStudentRequest'];
export type UpdateStudentRequest = Api['UpdateStudentRequest'];
export type LinkParentRequest = Api['LinkParentRequest'];

// Sub-types from generated schemas
export type GuardianInfo = Api['GuardianInfo'];
export type ParentLinkResponse = Api['ParentLinkResponse'];
export type FileUploadResponse = Api['FileUploadResponse'];

// Response types from generated OpenAPI schemas
export type StudentListItem = Api['StudentResponse'];
export type StudentDetail = Api['StudentResponse'] & {
  /** Backend may return documents array not yet in OpenAPI spec */
  documents?: StudentDocument[];
};
export type ParentInfo = Api['ParentLinkResponse'] & {
  /** Backend may return extra fields not yet in OpenAPI spec */
  occupation?: string | null;
  address?: string | null;
};

// No generated schema — keep hand-written
export interface StudentDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}
