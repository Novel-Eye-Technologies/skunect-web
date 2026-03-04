export interface ParentListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin: string | null;
  createdAt: string;
  childrenCount?: number;
}

export interface ParentLinkInfo {
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string | null;
  relationship: string;
  isEmergencyContact: boolean;
  isApproved: boolean;
}
