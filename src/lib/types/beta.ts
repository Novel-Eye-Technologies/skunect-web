export interface BetaSignup {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: BetaSignupRole;
  schoolName: string | null;
  schoolSize: string | null;
  city: string | null;
  status: BetaSignupStatus;
  invitationToken: string | null;
  invitationSentAt: string | null;
  invitationAcceptedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BetaSignupRole = 'TEACHER' | 'PARENT' | 'SCHOOL_ADMIN' | 'SCHOOL_OWNER';

export type BetaSignupStatus = 'PENDING' | 'CONTACTED' | 'INVITED' | 'ACCEPTED' | 'ENROLLED';

export interface CreateBetaSignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: BetaSignupRole;
  schoolName?: string;
  schoolSize?: string;
  city?: string;
}

export interface SendBetaInvitationRequest {
  signupIds: string[];
}

export interface AcceptBetaInvitationRequest {
  schoolName: string;
  schoolEmail: string;
  schoolPhone?: string;
  schoolAddress?: string;
  schoolCity?: string;
  schoolState?: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone?: string;
  studentCount: number;
}

export interface BetaSignupStats {
  total: number;
  pending: number;
  contacted: number;
  invited: number;
  accepted: number;
  enrolled: number;
  byRole: {
    SCHOOL_OWNER: number;
    SCHOOL_ADMIN: number;
    TEACHER: number;
    PARENT: number;
  };
}
