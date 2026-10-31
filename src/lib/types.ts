export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type NoticeCategory = 'GENERAL' | 'EVENT' | 'ELECTION' | 'URGENT';
export type DueStatus = 'UNPAID' | 'PAID' | 'OVERDUE';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
export type RegistrationStatus = 'REGISTERED' | 'CANCELLED';

export type Meta = { page: number; limit: number; total: number };
export type FieldError = { path?: string | number; message: string };

// Every backend response has this shape
export type ApiSuccess<T> = { success: true; message: string; data: T; meta?: Meta };
export type ApiFailure = { success: false; message: string; status: number; errors: FieldError[] };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profileImage?: string | null;
  role: Role;
  isBlocked: boolean;
  authProvider?: string;
  createdAt: string;
  updatedAt: string;
  memberProfile?: { id: string; studentIdNo: string; membershipStatus: MembershipStatus } | null;
};

export type MemberProfile = {
  id: string;
  studentIdNo: string;
  session: string;
  class: string;
  membershipStatus: MembershipStatus;
  joinedAt: string;
  section?: { id: string; name: string } | null;
  user: { id: string; name: string; email: string; phone: string | null; profileImage?: string | null };
};

export type PublicMember = {
  id: string;
  studentIdNo: string;
  session: string;
  class: string;
  joinedAt: string;
  section?: { id: string; name: string } | null;
  user: { id: string; name: string; profileImage?: string | null; phone?: string | null };
};

export type EventItem = {
  id: string;
  title: string;
  description: string | null;
  venue: string;
  eventDate: string;
  fee: string;
  capacity: number | null;
  status: EventStatus;
  createdAt: string;
  createdBy: { id: string; name: string } | null;
  registeredCount: number;
  seatsLeft: number | null;
};

export type EventRegistration = {
  id: string;
  status: RegistrationStatus;
  registeredAt: string;
  event: { id: string; title: string; venue: string; eventDate: string; fee: string; status: EventStatus };
};

export type StaffRegistration = {
  id: string;
  status: RegistrationStatus;
  registeredAt: string;
  user: {
    id: string;
    name: string;
    phone: string | null;
    memberProfile: { studentIdNo: string; session: string; class: string } | null;
  };
};

export type Notice = {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string } | null;
};

export type Due = {
  id: string;
  month: number;
  year: number;
  amount: string;
  status: DueStatus;
  dueDate: string;
  member?: { id: string; studentIdNo: string; user: { id: string; name: string } };
};

export type Payment = {
  id: string;
  amount: string;
  purpose: string;
  status: PaymentStatus;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string };
  due: { id: string; month: number; year: number } | null;
};

export type InitiatedPayment = {
  paymentId: string;
  amount: string;
  bkashPaymentId: string;
  bkashURL: string;
};
