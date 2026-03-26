import type { Api } from '@/lib/api/schema';

export type BusRoute = Api['BusRouteResponse'];
export type Bus = Api['BusResponse'];
export type BusEnrollment = Api['BusEnrollmentResponse'];
export type BusTrip = Api['BusTripResponse'];
export type BusTripStudent = Api['BusTripStudentResponse'];
export type BusTracking = Api['BusTrackingResponse'];

// ---------------------------------------------------------------------------
// Request types — keep hand-written (generated types have different
// required/optional fields)
// ---------------------------------------------------------------------------

export interface CreateBusRouteRequest {
  routeName: string;
  description?: string;
  pickupPoints?: string[];
}

export interface CreateBusRequest {
  routeId?: string;
  plateNumber: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
}

export interface EnrollStudentRequest {
  busId: string;
  studentId: string;
  pickupPoint?: string;
}

// Request types from generated OpenAPI schemas
export type CreateBusTripRequest = Api['CreateBusTripRequest'];
export type UpdateTripStudentRequest = Api['UpdateTripStudentRequest'];
