export type AuthStatus = 'loggedOut' | 'register' | 'pendingApproval' | 'loggedIn';

export type EducatorViewType =
  'dashboard' |
  'opportunities' |
  'opportunityDetail' |
  'opportunityTaskDetail' |
  'my-projects' |
  'proposals' |
  'earnings' |
  'inbox' |
  'support' |
  'profile' |
  'taskDetail' |
  'createBid' |
  'bidDetail' |
  'editBid' |
  'tasks' |
  'assignments' |
  'assignmentDetail' |
  'settings';

export type ViewType =
  'dashboard' |
  'projects' |
  'projectDetail' |
  'createProject' |
  'createUser' |
  'editUser' |
  'bidDetail' |
  'taskDetail' |
  'educationalRequests' |
  'requestDetail' |
  'educators' |
  'educatorDetail' |
  'educatorApplications' |
  'educatorApplicationDetail' |
  'rejectedEducators' |
  'users' |
  'userDetail' |
  'finance' |
  'invoiceDetail' |
  'reports' |
  'calendar' |
  'settings' |
  'specializations' |
  'skills' |
  'services' |
  'support' |
  'supportTicketDetail';

export type AdminViewType = ViewType;

export enum RegisterStep {
  ACCOUNT_INFO = 1,
  PROFESSIONAL_INFO = 2,
  DOCUMENTS = 3,
}

export enum ProjectStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export enum BidStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ASSIGNED = 'ASSIGNED',
  REJECTED = 'REJECTED',
}

export enum AssignmentType {
  INVITATION = 'INVITATION',
  DIRECT = 'DIRECT',
  FROM_BID = 'FROM_BID',
}

export enum AssignmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum ProjectCreationType {
    PUBLIC = 'PUBLIC',
    STANDALONE = 'STANDALONE',
    FROM_REQUEST = 'FROM_REQUEST',
}

export enum EducatorStatus {
    PENDING_REVIEW = 'PENDING_REVIEW',
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'SUSPENDED',
    REJECTED = 'rejected',
    BANNED = 'BANNED',
}

export enum VerificationStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED',
}

export enum EducationalRequestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}

export enum PaymentStatus {
    PAID = 'PAID',
    UNPAID = 'UNPAID',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
}

export enum FulfillmentStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

export enum PricingType {
    FIXED = 'FIXED',
    HOURLY = 'HOURLY',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    BANNED = 'BANNED',
}

export enum SupportTicketStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED'
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE'
}

export enum ExperienceLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    EXPERT = 'EXPERT'
}

export enum IdType {
    NATIONAL_ID = 'NATIONAL_ID',
    PASSPORT = 'PASSPORT'
}

export enum SkillLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    EXPERT = 'EXPERT'
}

export enum LanguageLevel {
    BASIC = 'BASIC',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    NATIVE = 'NATIVE'
}

export enum AvailabilityStatus {
    AVAILABLE = 'AVAILABLE',
    UNAVAILABLE = 'UNAVAILABLE',
}

export type RequestActivityType = 'CREATED' | 'STATUS_CHANGED' | 'NOTE' | 'PROJECT_LINKED' | 'DETAILS_UPDATED' | 'PAYMENT_STATUS_CHANGED' | 'FULFILLMENT_STATUS_CHANGED' | 'AGREEMENT_UPDATED';

export type PricedBidTask = { taskId: string; status: BidStatus; amount: number; rejectionReason?: string; approvalMessage?: string; bidTaskId?: string; };

export type ToastNotification = {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
};

// --- New & Updated Interfaces for Profile ---

export interface EducatorProfile {
    identityStatus: VerificationStatus | string | null;
    verificationStatus?: VerificationStatus | string | null;
    gender: Gender | 'male' | 'female' | null;
    birthDate: string | null;
    nationality: string | null;
    country: string | null;
    city: string | null;
    educationLevel?: string | null;
    experienceYears: number;
    employmentStatus?: string | null;
    profileCompletion: number;
    experienceLevel?: ExperienceLevel | string | null;
    idType: IdType | 'national_id' | 'passport' | string | null;
    idNumber: string;
    idDocumentUrl?: string | null;
    idDocumentBackUrl?: string | null;
    rejectionReason?: string | null;
    isComplete?: boolean;
}

export interface AcademicMajor {
    id: string;
    majorName: string | null;
    isCustom: boolean;
    institution: string | null;
    graduationYear: string | null;
    degree: string | null;
    documentUrl?: string | null;
    verificationStatus: VerificationStatus | string;
    rejectionReason?: string | null;
}

export interface Service {
    id: string;
    name: string;
    description: string | null;
    isCustom: boolean;
    serviceId?: string | null;
    customDescription?: string | null;
}

export interface WorkExperience {
    id: string;
    title: string;
    organization: string | null;
    startDate: string | null;
    endDate: string | null;
    description?: string | null;
    documentUrl?: string | null;
    verificationStatus: VerificationStatus | string;
    rejectionReason?: string | null;
}

export interface Certification {
    id: string;
    title: string;
    issuingAuthority?: string | null;
    organization?: string | null;
    type?: string | null;
    issueDate?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    description?: string | null;
    documentUrl?: string | null;
    verificationStatus: VerificationStatus | string;
    rejectionReason?: string | null;
}

export interface Achievement {
    id: string;
    title: string;
    type: string;
    description?: string | null;
    organization?: string | null;
    documentUrl?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    date?: string | null;
    verificationStatus?: VerificationStatus | string | null;
    rejectionReason?: string | null;
}

export interface SocialLink {
    id: string;
    platform: 'linkedin' | 'twitter' | 'github' | 'website' | string;
    url: string;
}

export interface Skill {
    id: string;
    name: string;
    level: SkillLevel | number;
    isCustom: boolean;
    skillId?: string | null;
}

export interface Language {
    id: string;
    name: string;
    level: LanguageLevel | number | string;
    isPrimary?: boolean | null;
}

export interface ListItem {
    id: string;
    name: string;
    level?: SkillLevel | LanguageLevel | number | string;
    isCustom: boolean;
    description?: string;
}

export interface PaymentInfo {
    id?: string;
    bankName: string;
    accountHolderName?: string;
    iban: string;
    name?: string;
    address?: string;
    bankCountry?: string;
    bankCode?: string;
    isApproved?: boolean;
}

export interface Educator {
  id: string;
  name: string;
  email: string;
  phone: string;
  discipline?: string | null;
  schoolName?: string | null;
  country?: string | null;
  city?: string | null;
  status: EducatorStatus | string;
  avatarUrl: string;
  rating: number;
  availabilityStatus: AvailabilityStatus | string;
  bio: string;
  bioTitle?: string | null;

  profile: EducatorProfile;
  basicInfo?: EducatorProfile;
  academicMajors: AcademicMajor[];
  languages: Language[];
  services: Service[];
  skills: Skill[];
  achievements: Achievement[];
  workExperience: WorkExperience[];
  certifications: Certification[];
  socialLinks: SocialLink[];
  paymentInfo: PaymentInfo;
  bankInfo?: PaymentInfo;
}

// --- End of Profile Interfaces ---

export interface Attachment {
  id: string;
  title?: string;
  description?: string | null;
  name: string;
  url: string;
  size: string;
  type: string;
  uploadedBy?: 'admin' | 'provider';
  uploadedAt?: string;
  uploader?: { id?: string | null; name?: string | null; type?: string | null } | null;
  file?: File;
}

export interface TaskBidDetail {
  id: string;
  status: string;
  status_label?: string;
  amount: number;
  rejection_reason?: string | null;
  approval_message?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ExternalSubTask {
  id: string;
  title: string;
  attachments: Attachment[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdBy: 'admin' | 'provider';
  providerId?: string;
  attachments?: Attachment[];
  createdAt: string;
  modifiedAt?: string;
}

export interface TaskNote {
    id: string;
    content: string;
    createdAt: string;
    createdBy: 'admin' | 'provider';
    authorName: string;
    authorAvatar: string;
}

export interface Assignment {
  id: string;
  educatorId: string;
  type: AssignmentType;
  status: AssignmentStatus;
  amount?: number;
  agreementNotes?: string;
  /** Stored in its own column; shown in the "reason" field. */
  rejectionReason?: string;
  /** Returned by the assignment mutation endpoints; used to refresh caches. */
  task_id?: string;
}

export interface TaskActivityLog {
    id: string;
    messageKey: string;
    messagePayload?: Record<string, string | number>;
    actorName: string;
    timestamp: string;
}

export type TaskAttachment = Attachment;

export interface Task {
  id:string;
  title: string;
  description: string;
  status: ProjectStatus;
  assignments: Assignment[];
  budget: number | null;
  deadline: string;
  isPublic: boolean;
  biddingStatus: 'OPEN' | 'CLOSED';
  subTasks: SubTask[];
  attachments: Attachment[];
  deliverables: Attachment[];
  notes: TaskNote[];
  creationDate: string;
  activityLog: TaskActivityLog[];
  modifiedAt?: string;
  // Educator-specific flags (optional)
  hasEducatorBidForTask?: boolean;
  bidDetailForTask?: TaskBidDetail;
  externalSubTasks?: ExternalSubTask[];
}

export interface ProjectActivityLog {
    id: string;
    messageKey: string;
    messagePayload?: Record<string, string | number>;
    actor: string;
    timestamp: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  tags: string[];
  budget: number | null;
  isPublished: boolean;
  tasks: Task[];
  creationType: ProjectCreationType;
  createdBy: string;
  createdAt: string;
  deadline: string | null;
  educationalRequestId: string | null;
  activityLog: ProjectActivityLog[];
  requesterName?: string;
  // Educator opportunity flags (optional)
  hasEducatorBidForOpportunity?: boolean;
  bid?: Bid & { totalAmount?: number; status?: string };
}

export interface Bid {
  id: string;
  projectId: string;
  educatorId: string;
  bidTasks: PricedBidTask[];
  deliveryDays: number;
  proposal: string;
  createdAt: string;
  attachments: Attachment[];
  links: { id: string, title: string, url: string }[];
}

export type AppNotificationIcon = 'bid' | 'task' | 'project' | 'user' | 'invoice' | 'request' | 'application';

export interface AppNotification {
    id: string;
    message: string;
    link?: { view: EducatorViewType; id?: string, data?: any };
    isRead: boolean;
    timestamp: string;
    icon: AppNotificationIcon;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'PENDING' | 'PROCESSED';
  requestedAt: string;
  processedAt?: string;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  description: string;
  amount: number;
  date: string;
}

export interface InboxMessage {
  id: string;
  from: 'ADMIN' | 'YOU';
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface SupportTicketMessage {
    sender: 'educator' | 'admin';
    senderName: string;
    senderAvatar: string;
    content: string;
    timestamp: string;
    attachments?: Attachment[];
}

export interface SupportTicket {
  id: string;
  educatorId: string;
  subject: string;
  category: string;
  status: SupportTicketStatus;
  createdAt: string;
  lastReply: string;
  messages: SupportTicketMessage[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    avatarUrl: string;
    registrationDate: string;
    status: UserStatus;
}

export interface EducationalRequest {
    id: string;
    code?: string;
    title: string;
    description: string;
    subject: string;
    educationLevel: string;
    academicMajor?: string | null;
    requesterId: string;
    status: EducationalRequestStatus;
    paymentStatus: PaymentStatus;
    fulfillmentStatus: FulfillmentStatus;
    reviewedAt?: string | null;
    budget: number | null;
    urgencyLevel?: string | null;
    pricingType: PricingType;
    expectedDeliveryDate: string | null;
    attachments: Attachment[];
    finalAgreement: string;
    additionalNotes?: string | null;
    activityLog: RequestActivityLog[];
    createdAt: string;
    project?: { id: string; title: string } | null;
}


export interface VerifiableDocument extends VerifiableItem {
    id: string;
    fileName: string;
    fileUrl: string;
}

export interface VerifiableItem {
    status: VerificationStatus;
    rejectionReason?: string;
}


export interface CertificationApplication extends VerifiableItem {
    id: string;
    title: string;
    issuingAuthority: string;
    issueDate: string;
    document: VerifiableDocument;
}

export interface ExperienceApplication extends VerifiableItem {
    id: string;
    role: string;
    company: string;
    startDate: string;
    endDate: string | 'الحاضر';
    description: string;
    document?: VerifiableDocument;
}


export interface EducatorApplication {
    id: string;
    educatorId: string;
    status: EducatorStatus;
    applicationDate: string;
    rejectionReason?: string;
    personalId: VerifiableDocument;
    certifications: CertificationApplication[];
    experiences: ExperienceApplication[];
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    requesterId: string;
    projectId: string;
    issueDate: string;
    dueDate: string;
    totalAmount: number;
    status: InvoiceStatus;
}

export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    ISSUED = 'ISSUED',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELED = 'CANCELED'
}

export interface RequestActivityLog {
    id: string;
    type: RequestActivityType;
    detailsKey: string;
    detailsPayload?: Record<string, string | number>;
    actor: string;
    actorAvatar: string;
    timestamp: string;
    reason?: string;
}

export type AdminActivityIcon = 'application' | 'invoice' | 'project' | 'user' | 'request';

export interface AdminActivity {
    id: string;
    icon: AdminActivityIcon;
    messageKey: string;
    messagePayload?: Record<string, string | number>;
    actorName: string;
    actorAvatar: string;
    timestamp: string;
    link?: { view: ViewType; id: string };
}

export type AdminMessageType = 'urgent' | 'warning' | 'info';

export interface AdminMessage {
    id: string;
    type: AdminMessageType;
    title: string;
    content: string;
    timestamp: string;
    isRead: boolean;
}

// For Admin Settings
export interface ManagedItem {
    id: string;
    name: string;
    isActive: boolean;
}

// Auth related types
export type UserRole = 'admin' | 'educator';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    phone: string;
    role: UserRole;
    // إضافة حقول أخرى حسب الحاجة
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    status: UserStatus | EducatorStatus;
    avatarUrl?: string;
    // معلومات إضافية حسب نوع المستخدم
    educator?: Educator;
    permissions?: string[];
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt: string;
}

export interface AuthState {
    user: AuthUser | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    status: AuthStatus;
}

export interface LoginResponse {
    user: AuthUser;
    tokens: AuthTokens;
    status: AuthStatus;
}

export interface RefreshTokenResponse {
    tokens: AuthTokens;
}
