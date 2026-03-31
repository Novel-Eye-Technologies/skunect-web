import type { Api } from '@/lib/api/schema';

export type BetaSignup = Api['BetaSignupResponse'];
export type CreateBetaSignupRequest = Api['CreateBetaSignupRequest'];
export type SendBetaInvitationRequest = Api['SendBetaInvitationRequest'];
export type AcceptBetaInvitationRequest = Api['AcceptBetaInvitationRequest'];
export type BetaSignupStats = Api['BetaSignupStatsResponse'];

export type BetaSignupRole = 'TEACHER' | 'PARENT' | 'SCHOOL_ADMIN' | 'SCHOOL_OWNER';
export type BetaSignupStatus = 'PENDING' | 'CONTACTED' | 'INVITED' | 'ACCEPTED' | 'ENROLLED';
