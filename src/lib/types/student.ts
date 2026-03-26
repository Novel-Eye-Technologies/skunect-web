import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type CreateStudentRequest = Api['CreateStudentRequest'];
export type UpdateStudentRequest = Api['UpdateStudentRequest'];
export type LinkParentRequest = Api['LinkParentRequest'];

// Sub-types from generated schemas
export type GuardianInfo = Api['GuardianInfo'];

// Response types — generated schemas have all fields optional, keep hand-written
export interface StudentListItem {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  otherName: string | null;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  classId: string;
  className: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'SUSPENDED' | 'EXPELLED';
  photo: string | null;
  createdAt: string;
}

export interface StudentDetail extends StudentListItem {
  address: string | null;
  stateOfOrigin: string | null;
  lga: string | null;
  religion: string | null;
  bloodGroup: string | null;
  genotype: string | null;
  allergies: string | null;
  medicalConditions: string | null;
  parents: ParentInfo[];
  documents: StudentDocument[];
}

export interface ParentInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship: string;
  occupation: string | null;
  address: string | null;
}

export interface StudentDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
}

export interface ParentLinkResponse {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  relationship: string;
  isEmergencyContact: boolean;
  isApproved: boolean;
}
