export interface BusRoute {
  id: string;
  schoolId: string;
  routeName: string;
  description: string | null;
  pickupPoints: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Bus {
  id: string;
  schoolId: string;
  routeId: string | null;
  routeName?: string;
  plateNumber: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
  isActive: boolean;
  createdAt: string;
}

export interface BusEnrollment {
  id: string;
  schoolId: string;
  busId: string;
  studentId: string;
  studentName?: string;
  busPlateNumber?: string;
  routeName?: string;
  pickupPoint: string | null;
  isActive: boolean;
  enrolledAt: string;
  createdAt: string;
}

export interface BusTrip {
  id: string;
  schoolId: string;
  busId: string;
  busPlateNumber?: string;
  tripDate: string;
  tripType: 'MORNING_PICKUP' | 'AFTERNOON_DROP';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startedAt: string | null;
  completedAt: string | null;
  students?: BusTripStudent[];
  createdAt: string;
}

export interface BusTripStudent {
  id: string;
  tripId: string;
  studentId: string;
  studentName?: string;
  status: 'PENDING' | 'BOARDED' | 'DROPPED_OFF' | 'ABSENT';
  boardedAt: string | null;
  droppedOffAt: string | null;
}

export interface BusTracking {
  enrollment: BusEnrollment;
  latestTrip: BusTrip | null;
  studentTripStatus: BusTripStudent | null;
}

// ---------------------------------------------------------------------------
// Request types
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

export interface CreateBusTripRequest {
  busId: string;
  tripDate: string;
  tripType: 'MORNING_PICKUP' | 'AFTERNOON_DROP';
}

export interface UpdateTripStudentRequest {
  status: 'PENDING' | 'BOARDED' | 'DROPPED_OFF' | 'ABSENT';
}
