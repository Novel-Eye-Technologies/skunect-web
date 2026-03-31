import type { Api } from '@/lib/api/schema';

export type BusRoute = Api['BusRouteResponse'];
export type Bus = Api['BusResponse'];
export type BusEnrollment = Api['BusEnrollmentResponse'];
export type BusTrip = Api['BusTripResponse'];
export type BusTripStudent = Api['BusTripStudentResponse'];
export type BusTracking = Api['BusTrackingResponse'];

// Request types from generated OpenAPI schemas
export type CreateBusRouteRequest = Api['CreateBusRouteRequest'];
export type CreateBusRequest = Api['CreateBusRequest'];
export type EnrollStudentRequest = Api['EnrollStudentRequest'];
export type CreateBusTripRequest = Api['CreateBusTripRequest'];
export type UpdateTripStudentRequest = Api['UpdateTripStudentRequest'];
