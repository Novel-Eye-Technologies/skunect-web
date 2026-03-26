import apiClient from '@/lib/api/client';
import axios from 'axios';
import type { ApiResponse } from '@/lib/api/types';
import type {
  BetaSignup,
  BetaSignupStats,
  CreateBetaSignupRequest,
  SendBetaInvitationRequest,
  AcceptBetaInvitationRequest,
} from '@/lib/types/beta';

// ---------------------------------------------------------------------------
// Public endpoints (no auth)
// ---------------------------------------------------------------------------

export async function createBetaSignup(
  data: CreateBetaSignupRequest,
): Promise<ApiResponse<BetaSignup>> {
  // Use raw axios since this is a public endpoint (no auth token needed)
  const response = await axios.post<ApiResponse<BetaSignup>>(
    `${process.env.NEXT_PUBLIC_API_URL}/beta/signups`,
    data,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return response.data;
}

export async function validateInvitationToken(
  token: string,
): Promise<ApiResponse<BetaSignup>> {
  const response = await axios.get<ApiResponse<BetaSignup>>(
    `${process.env.NEXT_PUBLIC_API_URL}/beta/invitations/${token}`,
  );
  return response.data;
}

export async function acceptBetaInvitation(
  token: string,
  data: AcceptBetaInvitationRequest,
): Promise<ApiResponse<BetaSignup>> {
  const response = await axios.post<ApiResponse<BetaSignup>>(
    `${process.env.NEXT_PUBLIC_API_URL}/beta/invitations/${token}/accept`,
    data,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Admin endpoints (requires SUPER_ADMIN auth)
// ---------------------------------------------------------------------------

export interface BetaSignupListParams {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export async function getBetaSignups(
  params?: BetaSignupListParams,
): Promise<ApiResponse<BetaSignup[]>> {
  const response = await apiClient.get<ApiResponse<BetaSignup[]>>(
    '/admin/beta/signups',
    { params },
  );
  return response.data;
}

export async function getBetaSignup(
  id: string,
): Promise<ApiResponse<BetaSignup>> {
  const response = await apiClient.get<ApiResponse<BetaSignup>>(
    `/admin/beta/signups/${id}`,
  );
  return response.data;
}

export async function sendBetaInvitations(
  data: SendBetaInvitationRequest,
): Promise<ApiResponse<BetaSignup[]>> {
  const response = await apiClient.post<ApiResponse<BetaSignup[]>>(
    '/admin/beta/signups/invite',
    data,
  );
  return response.data;
}

export async function updateBetaSignupStatus(
  id: string,
  status: string,
): Promise<ApiResponse<BetaSignup>> {
  const response = await apiClient.patch<ApiResponse<BetaSignup>>(
    `/admin/beta/signups/${id}/status`,
    null,
    { params: { status } },
  );
  return response.data;
}

export async function getBetaSignupStats(): Promise<ApiResponse<BetaSignupStats>> {
  const response = await apiClient.get<ApiResponse<BetaSignupStats>>(
    '/admin/beta/signups/stats',
  );
  return response.data;
}
