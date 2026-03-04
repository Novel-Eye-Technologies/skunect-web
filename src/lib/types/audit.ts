export interface AuditLog {
  id: string;
  schoolId: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
}
