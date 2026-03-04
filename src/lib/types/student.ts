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

export interface GuardianInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship: string;
  isEmergencyContact: boolean;
}

export interface CreateStudentRequest {
  admissionNumber?: string; // optional — auto-generated if blank
  firstName: string;
  lastName: string;
  otherName?: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  classId: string;
  photoUrl?: string;
  address?: string;
  stateOfOrigin?: string;
  lga?: string;
  religion?: string;
  bloodGroup?: string;
  genotype?: string;
  allergies?: string;
  medicalConditions?: string;
  guardians?: GuardianInfo[];
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  status?: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'SUSPENDED' | 'EXPELLED';
}

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
}

export interface LinkParentRequest {
  parentUserId: string;
  relationship: string;
}
