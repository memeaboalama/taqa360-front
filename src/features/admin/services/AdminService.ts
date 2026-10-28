import { apiClient } from '../../../core/api/client';
import { apiClient as baseApiClient } from '../../../core/api/baseClient';
import {
  Project,
  Educator,
  User,
  EducationalRequest,
  Invoice,
  AdminActivity,
  SupportTicket,
  EducatorApplication,
  ManagedItem,
  UserStatus,
  EducatorStatus,
  PaginatedResponse,
  VerificationStatus,
  AvailabilityStatus,
  EducatorProfile,
  AcademicMajor,
  WorkExperience,
  Certification,
  Achievement,
  Language,
  Skill,
  Service,
  SocialLink,
  PaymentInfo
} from '../../../shared/types';
import { env } from '../../../core/config/env';

const normalizeKey = (value: any) => typeof value === 'string'
  ? value.trim().replace(/[\s-]+/g, '_').toUpperCase()
  : '';

const sanitizeDate = (value: any): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const str = String(value).trim();
  if (!str || str === '0000-00-00' || str === '0000-00-00 00:00:00' || str === '-0001-11-30') {
    return null;
  }
  return str;
};

const toNumeric = (value: any, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const ensureArray = <T>(value: any): T[] => (Array.isArray(value) ? value : []);
const toStringId = (value: any) => (value !== null && value !== undefined ? String(value) : '');

const VERIFICATION_STATUS_SET = new Set<string>(Object.values(VerificationStatus));

const mapVerificationStatus = (value: any): VerificationStatus | string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    const normalized = normalizeKey(value);
    return VERIFICATION_STATUS_SET.has(normalized) ? (normalized as VerificationStatus) : normalized;
  }
  return value;
};

const EDUCATOR_STATUS_MAPPING: Record<string, EducatorStatus> = {
  PENDING: EducatorStatus.PENDING_REVIEW,
  PENDING_REVIEW: EducatorStatus.PENDING_REVIEW,
  SUBMITTED: EducatorStatus.PENDING_REVIEW,
  ACTIVE: EducatorStatus.ACTIVE,
  INACTIVE: EducatorStatus.INACTIVE,
  SUSPENDED: EducatorStatus.SUSPENDED,
  REJECTED: EducatorStatus.REJECTED,
  BANNED: EducatorStatus.BANNED
};

const mapEducatorStatus = (value: any): EducatorStatus | string => {
  if (value === null || value === undefined) {
    return EducatorStatus.PENDING_REVIEW;
  }
  if (typeof value === 'string') {
    const normalized = normalizeKey(value);
    return EDUCATOR_STATUS_MAPPING[normalized] ?? value;
  }
  return value;
};

const AVAILABILITY_STATUS_MAPPING: Record<string, AvailabilityStatus> = {
  AVAILABLE: AvailabilityStatus.AVAILABLE,
  ACTIVE: AvailabilityStatus.AVAILABLE,
  OPEN: AvailabilityStatus.AVAILABLE,
  UNAVAILABLE: AvailabilityStatus.UNAVAILABLE,
  INACTIVE: AvailabilityStatus.UNAVAILABLE,
  BUSY: AvailabilityStatus.UNAVAILABLE,
  AWAY: AvailabilityStatus.UNAVAILABLE
};

const mapAvailabilityStatus = (value: any): AvailabilityStatus | string => {
  if (value === null || value === undefined) {
    return AvailabilityStatus.UNAVAILABLE;
  }
  if (typeof value === 'string') {
    const normalized = normalizeKey(value);
    return AVAILABILITY_STATUS_MAPPING[normalized] ?? normalized;
  }
  return value;
};

const resolveUrl = (u: any): string | null => {
  if (!u && u !== 0) return null;
  const url = String(u || '').trim();
  if (!url) return null;
  if (/^(data:|blob:|https?:)\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('/')) return `${env.API_BASE_URL}${url}`;
  return `${env.API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\/+/, '')}`;
};

const normalizeAcademicMajor = (value: any): AcademicMajor => ({
  id: toStringId(value?.id),
  majorName: value?.majorName ?? value?.name ?? null,
  isCustom: Boolean(value?.isCustom ?? value?.is_custom ?? false),
  institution: value?.institution ?? null,
  graduationYear: value?.graduationYear ?? value?.graduation_year ?? null,
  degree: value?.degree ?? null,
  documentUrl: resolveUrl(value?.documentUrl ?? value?.document_url ?? null),
  verificationStatus: mapVerificationStatus(value?.verificationStatus ?? value?.status) ?? VerificationStatus.PENDING,
  rejectionReason: value?.rejectionReason ?? value?.rejection_reason ?? null
});

const normalizeLanguage = (value: any): Language => ({
  id: toStringId(value?.id),
  name: value?.name ?? '',
  level: value?.level ?? value?.proficiency ?? '',
  isPrimary: value?.isPrimary ?? value?.is_primary ?? null
});

const normalizeSkill = (value: any): Skill => {
  const level = value?.level ?? value?.skillLevel ?? value?.proficiency;
  const numericLevel = typeof level === 'number' ? level : Number(level);
  return {
    id: toStringId(value?.id),
    name: value?.name ?? '',
    level: Number.isFinite(numericLevel) ? numericLevel : (level ?? 0),
    isCustom: Boolean(value?.isCustom ?? value?.is_custom ?? !value?.skillId),
    skillId: value?.skillId ?? value?.skill_id ?? null
  };
};

const normalizeService = (value: any): Service => ({
  id: toStringId(value?.id),
  name: value?.name ?? '',
  description: value?.description ?? value?.details ?? null,
  isCustom: Boolean(value?.isCustom ?? value?.is_custom ?? !value?.serviceId),
  serviceId: value?.serviceId ?? value?.service_id ?? null,
  customDescription: value?.customDescription ?? value?.custom_description ?? null
});

const normalizeAchievement = (value: any): Achievement => ({
  id: toStringId(value?.id ?? value?.uuid),
  title: value?.title ?? '',
  type: value?.type ?? '',
  description: value?.description ?? null,
  organization: value?.organization ?? value?.issuingAuthority ?? null,
  documentUrl: resolveUrl(value?.documentUrl ?? value?.document_url ?? null),
  startDate: sanitizeDate(value?.startDate ?? value?.start_date),
  endDate: sanitizeDate(value?.endDate ?? value?.end_date),
  date: sanitizeDate(value?.date),
  verificationStatus: mapVerificationStatus(value?.verificationStatus ?? value?.status) ?? VerificationStatus.PENDING,
  rejectionReason: value?.rejectionReason ?? value?.rejection_reason ?? null
});

const normalizeWorkExperience = (value: any): WorkExperience => ({
  id: toStringId(value?.id),
  title: value?.title ?? '',
  organization: value?.organization ?? value?.company ?? null,
  startDate: sanitizeDate(value?.startDate ?? value?.start_date),
  endDate: sanitizeDate(value?.endDate ?? value?.end_date),
  description: value?.description ?? null,
  documentUrl: resolveUrl(value?.documentUrl ?? value?.document_url ?? null),
  verificationStatus: mapVerificationStatus(value?.verificationStatus ?? value?.status) ?? VerificationStatus.PENDING,
  rejectionReason: value?.rejectionReason ?? value?.rejection_reason ?? null
});

const normalizeCertification = (value: any): Certification => ({
  id: toStringId(value?.id),
  title: value?.title ?? '',
  issuingAuthority: value?.issuingAuthority ?? value?.organization ?? null,
  organization: value?.organization ?? value?.issuingAuthority ?? null,
  type: value?.type ?? null,
  description: value?.description ?? null,
  documentUrl: resolveUrl(value?.documentUrl ?? value?.document_url ?? null),
  issueDate: sanitizeDate(value?.issueDate ?? value?.issue_date),
  startDate: sanitizeDate(value?.startDate ?? value?.start_date),
  endDate: sanitizeDate(value?.endDate ?? value?.end_date),
  verificationStatus: mapVerificationStatus(value?.verificationStatus ?? value?.status) ?? VerificationStatus.PENDING,
  rejectionReason: value?.rejectionReason ?? value?.rejection_reason ?? null
});

const normalizeSocialLink = (value: any): SocialLink => ({
  id: toStringId(value?.id ?? value?.platform ?? value?.url),
  platform: value?.platform ?? value?.type ?? '',
  url: value?.url ?? value?.link ?? ''
});

const normalizePaymentInfo = (value: any): PaymentInfo => {
  const source = value ?? {};
  return {
    id: source.id !== undefined && source.id !== null ? String(source.id) : undefined,
    bankName: source.bankName ?? source.bank_name ?? '',
    accountHolderName: source.accountHolderName ?? source.account_holder_name ?? source.name ?? undefined,
    name: source.name ?? source.accountHolderName ?? source.account_holder_name ?? undefined,
    iban: source.iban ?? '',
    address: source.address ?? source.bankAddress ?? source.branch_address ?? undefined,
    bankCountry: source.bankCountry ?? source.bank_country ?? undefined,
    bankCode: source.bankCode ?? source.bank_code ?? undefined,
    isApproved: source.isApproved ?? source.is_approved ?? undefined
  };
};

const normalizeProfile = (source: any): EducatorProfile => {
  const profile = source ?? {};
  return {
    identityStatus: mapVerificationStatus(profile.identityStatus ?? profile.verificationStatus ?? profile.status) ?? VerificationStatus.PENDING,
    verificationStatus: mapVerificationStatus(profile.verificationStatus ?? profile.status) ?? null,
    gender: profile.gender ?? null,
    birthDate: sanitizeDate(profile.birthDate ?? profile.birth_date),
    nationality: profile.nationality ?? null,
    country: profile.country ?? null,
    city: profile.city ?? null,
    educationLevel: profile.educationLevel ?? profile.education_level ?? null,
    experienceYears: toNumeric(profile.experienceYears ?? profile.experience_years, 0),
    employmentStatus: profile.employmentStatus ?? profile.employment_status ?? null,
    profileCompletion: toNumeric(profile.profileCompletion ?? profile.profile_completion ?? 0, 0),
    experienceLevel: profile.experienceLevel ?? profile.experience_level ?? null,
    idType: profile.idType ?? profile.id_type ?? null,
    idNumber: profile.idNumber ?? profile.id_number ?? '',
    idDocumentUrl: resolveUrl(profile.idDocumentUrl ?? profile.id_document_url ?? null),
    idDocumentBackUrl: resolveUrl(profile.idDocumentBackUrl ?? profile.id_document_back_url ?? null),
    rejectionReason: profile.rejectionReason ?? profile.rejection_reason ?? null,
    isComplete: profile.isComplete ?? profile.is_complete ?? false
  };
};

const isWorkExperienceType = (type: string) => {
  const normalized = normalizeKey(type);
  return normalized.includes('WORK_EXPERIENCE') || normalized === 'EXPERIENCE' || normalized === 'WORK';
};

const isCertificationType = (type: string) => {
  const normalized = normalizeKey(type);
  return normalized.includes('CERTIFICATE') || normalized.includes('CERTIFICATION') || normalized === 'COURSE' || normalized === 'WORKSHOP';
};

const deriveWorkExperiencesFromAchievements = (items: Achievement[]): WorkExperience[] =>
  items
    .filter((item) => isWorkExperienceType(item.type ?? ''))
    .map((item) => ({
      id: item.id,
      title: item.title,
      organization: item.organization ?? null,
      startDate: sanitizeDate(item.startDate ?? item.date),
      endDate: sanitizeDate(item.endDate ?? item.date),
      description: item.description ?? null,
      documentUrl: resolveUrl(item.documentUrl ?? null),
      verificationStatus: mapVerificationStatus(item.verificationStatus) ?? VerificationStatus.PENDING,
      rejectionReason: item.rejectionReason ?? null
    }));

const deriveCertificationsFromAchievements = (items: Achievement[]): Certification[] =>
  items
    .filter((item) => isCertificationType(item.type ?? ''))
    .map((item) => ({
      id: item.id,
      title: item.title,
      issuingAuthority: item.organization ?? null,
      organization: item.organization ?? null,
      type: item.type ?? null,
      description: item.description ?? null,
      documentUrl: resolveUrl(item.documentUrl ?? null),
      issueDate: sanitizeDate(item.date ?? item.startDate),
      startDate: sanitizeDate(item.startDate),
      endDate: sanitizeDate(item.endDate),
      verificationStatus: mapVerificationStatus(item.verificationStatus) ?? VerificationStatus.PENDING,
      rejectionReason: item.rejectionReason ?? null
    }));

const extractEducatorPayload = (payload: any) =>
  payload?.data?.educator ?? payload?.educator ?? (payload?.data && !Array.isArray(payload.data) ? payload.data : payload);

const transformEducatorResponse = (payload: any): Educator => {
  const raw = extractEducatorPayload(payload) ?? {};
  const profile = normalizeProfile(raw.profile ?? raw.basicInfo ?? raw.basic_info ?? raw);
  const basicInfo = raw.basicInfo || raw.basic_info ? normalizeProfile(raw.basicInfo ?? raw.basic_info) : profile;
  const academicMajors = ensureArray<any>(raw.academicMajors ?? raw.academic_majors).map(normalizeAcademicMajor);
  const languages = ensureArray<any>(raw.languages).map(normalizeLanguage);
  const services = ensureArray<any>(raw.services).map(normalizeService);
  const skills = ensureArray<any>(raw.skills).map(normalizeSkill);
  const achievements = ensureArray<any>(raw.achievements).map(normalizeAchievement);
  const workExperienceRaw = ensureArray<any>(raw.workExperience ?? raw.experiences).map(normalizeWorkExperience);
  const certificationsRaw = ensureArray<any>(raw.certifications).map(normalizeCertification);
  const workExperience = workExperienceRaw.length > 0 ? workExperienceRaw : deriveWorkExperiencesFromAchievements(achievements);
  const certifications = certificationsRaw.length > 0 ? certificationsRaw : deriveCertificationsFromAchievements(achievements);
  const socialLinks = ensureArray<any>(raw.socialLinks ?? raw.social_links).map(normalizeSocialLink);
  const paymentSource = raw.paymentInfo ?? raw.payment_info ?? raw.bankInfo ?? raw.bank_info ?? null;
  const bankSource = raw.bankInfo ?? raw.bank_info ?? null;

  return {
    id: toStringId(raw.id),
    name: raw.name ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    discipline: raw.discipline ?? raw.specialization ?? raw.basicInfo?.specialization ?? raw.profile?.specialization ?? null,
    schoolName: raw.schoolName ?? raw.school_name ?? null,
    country: raw.country ?? profile.country ?? null,
    city: raw.city ?? profile.city ?? null,
    status: mapEducatorStatus(raw.status),
    avatarUrl: raw.avatarUrl ?? raw.avatar_url ?? '',
    rating: toNumeric(raw.rating, 0),
    availabilityStatus: mapAvailabilityStatus(raw.availabilityStatus ?? raw.availability_status),
    bio: ((): string => {
      const b = raw?.bio;
      if (b && typeof b === 'object') {
        return String(b?.description ?? b?.desc ?? b?.text ?? '').trim();
      }
      return String(b ?? '').trim();
    })(),
    bioTitle: ((): string | null => {
      const b = raw?.bio;
      if (b && typeof b === 'object') {
        const t = String(b?.title ?? '').trim();
        return t || null;
      }
      return null;
    })(),
    profile,
    basicInfo,
    academicMajors,
    languages,
    services,
    skills,
    achievements,
    workExperience,
    certifications,
    socialLinks,
    paymentInfo: normalizePaymentInfo(paymentSource),
    bankInfo: bankSource ? normalizePaymentInfo(bankSource) : undefined
  };
};

export interface AdminDashboardStats {
  totalRevenue: number;
  activeProjects: number;
  totalEducators: number;
  pendingRequests: number;
  monthlyRevenue: number[];
  projectsByStatus: { [key: string]: number };
  educatorsByStatus: { [key: string]: number };
  recentActivity: AdminActivity[];
}

export class AdminService {
  /**
   * Academic Majors (Admin)
   */
  static async getAcademicMajors(params?: { page?: number; per_page?: number; search?: string; status?: string; }) {
    const response = await apiClient.get<any>('/admin/edu/academic-majors', params);
    const raw = response.data as any;
    const list = Array.isArray(raw?.data?.academic_majors)
      ? raw.data.academic_majors
      : Array.isArray(raw?.academic_majors)
        ? raw.academic_majors
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw)
            ? raw
            : [];
    return list as any[];
  }

  static async createAcademicMajor(name: { ar: string; en: string }) {
    const payload = { name };
    const response = await apiClient.post<any>('/admin/edu/academic-majors', payload);
    const raw = response.data as any;
    return (raw?.data?.academic_major ?? raw?.academic_major ?? raw) as any;
  }

  static async updateAcademicMajor(id: string, name: { ar: string; en: string }) {
    const payload = { name };
    const response = await apiClient.put<any>(`/admin/edu/academic-majors/${id}`, payload);
    const raw = response.data as any;
    return (raw?.data?.academic_major ?? raw?.academic_major ?? raw) as any;
  }

  static async toggleAcademicMajorStatus(id: string) {
    const response = await apiClient.post<any>(`/admin/edu/academic-majors/${id}/status-toggle`);
    const raw = response.data as any;
    return (raw?.data?.academic_major ?? raw?.academic_major ?? raw) as any;
  }

  static async deleteAcademicMajor(id: string): Promise<void> {
    await apiClient.delete<null>(`/admin/edu/academic-majors/${id}`);
  }

  /**
   * Services (Admin)
   */
  static async getServices(params?: { page?: number; per_page?: number; search?: string; status?: string; }) {
    const response = await apiClient.get<any>('/admin/edu/services', params);
    const raw = response.data as any;
    const list = Array.isArray(raw?.data?.services)
      ? raw.data.services
      : Array.isArray(raw?.services)
        ? raw.services
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw)
            ? raw
            : [];
    return list as any[];
  }

  static async createService(payload: { name: { ar: string; en: string }; description?: { ar: string; en: string } }) {
    const response = await apiClient.post<any>('/admin/edu/services', payload);
    const raw = response.data as any;
    return (raw?.data?.service ?? raw?.service ?? raw) as any;
  }

  static async updateService(id: string, payload: { name: { ar: string; en: string }; description?: { ar: string; en: string } }) {
    const response = await apiClient.put<any>(`/admin/edu/services/${id}`, payload);
    const raw = response.data as any;
    return (raw?.data?.service ?? raw?.service ?? raw) as any;
  }

  static async toggleServiceStatus(id: string) {
    const response = await apiClient.post<any>(`/admin/edu/services/${id}/status-toggle`);
    const raw = response.data as any;
    return (raw?.data?.service ?? raw?.service ?? raw) as any;
  }

  static async deleteService(id: string): Promise<void> {
    await apiClient.delete<null>(`/admin/edu/services/${id}`);
  }

  /**
   * Skills (Admin)
   */
  static async getSkills(params?: { page?: number; per_page?: number; search?: string; status?: string; }) {
    const response = await apiClient.get<any>('/admin/edu/skills', params);
    const raw = response.data as any;
    const list = Array.isArray(raw?.data?.skills)
      ? raw.data.skills
      : Array.isArray(raw?.skills)
        ? raw.skills
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw)
            ? raw
            : [];
    return list as any[];
  }

  static async createSkill(name: { ar: string; en: string }) {
    const response = await apiClient.post<any>('/admin/edu/skills', { name });
    const raw = response.data as any;
    return (raw?.data?.skill ?? raw?.skill ?? raw) as any;
  }

  static async updateSkill(id: string, name: { ar: string; en: string }) {
    const response = await apiClient.put<any>(`/admin/edu/skills/${id}`, { name });
    const raw = response.data as any;
    return (raw?.data?.skill ?? raw?.skill ?? raw) as any;
  }

  static async toggleSkillStatus(id: string) {
    const response = await apiClient.post<any>(`/admin/edu/skills/${id}/status-toggle`);
    const raw = response.data as any;
    return (raw?.data?.skill ?? raw?.skill ?? raw) as any;
  }

  static async deleteSkill(id: string): Promise<void> {
    await apiClient.delete<null>(`/admin/edu/skills/${id}`);
  }

  /**
   * Bids (Admin)
   */
  static async getBid(id: string) {
    const response = await apiClient.get<any>(`/admin/bids/${id}`);
    return response.data;
  }

  /**
   * Dashboard
   */
  static async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await apiClient.get<AdminDashboardStats>('/admin/dashboard/stats');
    // apiClient now handles status and throws errors, so direct check is not needed here
    return response.data;
  }

  /**
   * Projects Management
   */
  static async getProjects(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
    created_by?: string;
  }): Promise<PaginatedResponse<Project>> {
    const response = await apiClient.get<PaginatedResponse<Project>>('/admin/projects', params);
    return response.data;
  }

  static async getProject(id: string) {
    const response = await apiClient.get<any>(`/admin/projects/${id}`);
    return response.data;
  }

  // Project Attachments
  /**
   * Cancel = the admin withdraws the assignment (the specialist stops seeing the
   * task). This is NOT the reject endpoint: rejecting marks the assignment as
   * rejected, which is a decision the specialist made, not the admin.
   */
  static async cancelAssignment(assignmentId: string, reason?: string) {
    const response = await apiClient.post<any>(
      `/admin/tasks/assignments/${assignmentId}/cancel`,
      { reason: reason ?? null }
    );
    return response?.data;
  }

  static async getProjectAttachments(projectId: string) {
    const response = await apiClient.get<any>(`/admin/projects/${projectId}/attachments`);
    // const raw = (response.data as any);
    // const list = Array.isArray(raw?.data?.attachments) ? raw.data.attachments : (Array.isArray(raw?.attachments) ? raw.attachments : []);

    // console.log("---------------------------- list --------------", list);
    
    // return list.map((a: any) => ({
    //   id: String(a.id),
    //   title: a.title ?? a.original_name ?? '',
    //   description: a.description ?? null,
    //   name: a.original_name ?? a.title ?? 'attachment',
    //   url: a.url ?? a.preview_url ?? a.download_url ?? '',
    //   size: typeof a.size === 'number' ? `${a.size} MB` : String(a.size ?? ''),
    //   type: a.type ?? a.collection_name ?? 'PROJECT_ATTACHMENT',
    //   uploadedBy: a.uploader?.type === 'Admin' ? 'admin' : 'provider',
    //   uploadedAt: a.uploadedAt ?? a.created_at ?? a.updated_at ?? undefined,
    //   uploader: a.uploader ? {
    //     id: a.uploader.id ?? null,
    //     name: a.uploader.name ?? null,
    //     type: a.uploader.type ?? null,
    //   } : null,
    // })) as any;
    return response;
  }

  /**
   * Deliverables the specialists uploaded from educator/taskDetail.
   *
   * They are stored against the task (task_files), not the project
   * (project_files), so getProjectAttachments above never returns them.
   */
  static async getProjectDeliverables(projectId: string) {
    const response = await apiClient.get<any>(`/admin/projects/${projectId}/deliverables`);
    const raw: any = response?.data;
    const payload = raw?.data ?? raw;
    const groups = Array.isArray(payload?.deliverables) ? payload.deliverables : [];

    const normalized = {
      counts: payload?.counts ?? { tasks: 0, files: 0 },
      groups: groups.map((g: any) => ({
        task: {
          id: String(g?.task?.id ?? ''),
          title: g?.task?.title ?? 'مهمة',
          status: g?.task?.status ?? '',
        },
        count: Number(g?.count ?? 0),
        files: (Array.isArray(g?.files) ? g.files : []).map((f: any) => ({
          id: String(f?.id ?? ''),
          name: f?.name ?? f?.original_name ?? 'ملف',
          original_name: f?.original_name ?? null,
          type: f?.type ?? null,
          collection_name: f?.collection_name ?? null,
          url: f?.url ?? '',
          size: f?.size ?? null,
          uploadedAt: f?.uploadedAt ?? null,
          uploader: f?.uploader ?? null,
        })),
      })),
    };

    // useBaseQuery applies `select: (data) => data.data`, so the payload has to
    // sit under a `data` key. Returning it bare made query.data undefined and
    // the tab reported "no deliverables" even on a 200 response.
    return { data: normalized } as any;
  }

  static async createProjectAttachment(projectId: string, payload: { title: string; description?: string | null; attachment: File; }) {
    const form = new FormData();
    if (payload.title) form.append('title', payload.title);
    if (typeof payload.description !== 'undefined') form.append('description', payload.description ?? '');
    form.append('attachment', payload.attachment);
    const response = await apiClient.post<any>(`/admin/projects/${projectId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const raw = response.data as any;
    const list = Array.isArray(raw?.data?.attachments) ? raw.data.attachments : (Array.isArray(raw?.attachments) ? raw.attachments : []);
    return list.map((a: any) => ({
      id: String(a.id),
      title: a.title ?? a.original_name ?? '',
      description: a.description ?? null,
      name: a.original_name ?? a.title ?? 'attachment',
      url: a.url ?? a.preview_url ?? a.download_url ?? '',
      size: typeof a.size === 'number' ? `${a.size} MB` : String(a.size ?? ''),
      type: a.type ?? a.collection_name ?? 'PROJECT_ATTACHMENT',
      uploadedBy: a.uploader?.type === 'Admin' ? 'admin' : 'provider',
      uploadedAt: a.uploadedAt ?? a.created_at ?? a.updated_at ?? undefined,
      uploader: a.uploader ? {
        id: a.uploader.id ?? null,
        name: a.uploader.name ?? null,
        type: a.uploader.type ?? null,
      } : null,
    })) as any;
  }

  static async updateProjectAttachment(projectId: string, attachmentId: string, payload: { title?: string; description?: string | null; attachment?: File; }) {
    const form = new FormData();
    if (typeof payload.title !== 'undefined') form.append('title', payload.title ?? '');
    if (typeof payload.description !== 'undefined') form.append('description', payload.description ?? '');
    if (payload.attachment instanceof File) form.append('attachment', payload.attachment);
    form.append('_method', 'PUT');
    const response = await apiClient.post<any>(`/admin/projects/${projectId}/attachments/${attachmentId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const raw = response.data as any;
    const list = Array.isArray(raw?.data?.attachments) ? raw.data.attachments : (Array.isArray(raw?.attachments) ? raw.attachments : []);
    return list.map((a: any) => ({
      id: String(a.id),
      title: a.title ?? a.original_name ?? '',
      description: a.description ?? null,
      name: a.original_name ?? a.title ?? 'attachment',
      url: a.url ?? a.preview_url ?? a.download_url ?? '',
      size: typeof a.size === 'number' ? `${a.size} MB` : String(a.size ?? ''),
      type: a.type ?? a.collection_name ?? 'PROJECT_ATTACHMENT',
      uploadedBy: a.uploader?.type === 'Admin' ? 'admin' : 'provider',
      uploadedAt: a.uploadedAt ?? a.created_at ?? a.updated_at ?? undefined,
      uploader: a.uploader ? {
        id: a.uploader.id ?? null,
        name: a.uploader.name ?? null,
        type: a.uploader.type ?? null,
      } : null,
    })) as any;
  }

  static async deleteProjectAttachment(projectId: string, attachmentId: string) {
    const response = await apiClient.delete<any>(`/admin/projects/${projectId}/attachments/${attachmentId}`);
    return response.data;
  }

  static async getTask(id: string) {
    const response = await apiClient.get<any>(`/admin/tasks/${id}`);
    // Return the full ApiResponse shape; useBaseQuery will extract data
    return response.data;
  }

  static async createTaskNote(taskId: string, content: string) {
    const response = await apiClient.post<any>(`/admin/tasks/${taskId}/notes`, { content });
    return response.data;
  }

  static async createProject(projectData: Partial<Project>): Promise<Project> {
    const response = await apiClient.post<Project>('/admin/projects', projectData);
    return response.data;
  }

  static async updateProject(id: string, projectData: Partial<Project> | FormData) {
    if (projectData instanceof FormData) {
      const response = await apiClient.put<any>(`/admin/projects/${id}`, projectData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }
    const response = await apiClient.put<any>(`/admin/projects/${id}`, projectData as any);
    return response.data;
  }

  static async deleteProject(id: string): Promise<void> {
    await apiClient.delete<null>(`/admin/projects/${id}`);
  }

  static async changeProjectStatus(id: string, status: string, reason?: string) {
    const response = await apiClient.post<any>(`/admin/projects/${id}/change-status`, { status, reason });
    return response.data;
  }

  static async publishProject(id: string) {
    const response = await apiClient.post<any>(`/admin/projects/${id}/publish`);
    return response.data;
  }

  static async unpublishProject(id: string) {
    const response = await apiClient.post<any>(`/admin/projects/${id}/unpublish`);
    return response.data;
  }

  /**
   * Tasks Management (Admin)
   */
  static async createTask(projectId: string, taskData: {
    title: string;
    description?: string | null;
    deadline?: string | null;
    budget?: number | null;
    isPublic?: boolean;
    is_public?: boolean;
  }) {
    const payload = {
      project_id: projectId,
      title: taskData.title,
      description: taskData.description ?? null,
      deadline: taskData.deadline ?? null,
      budget: taskData.budget ?? null,
      is_public: Boolean(taskData.is_public ?? taskData.isPublic ?? false)
    };
    const response = await apiClient.post<any>(`/admin/tasks`, payload);
    return response.data;
  }

  /**
   * Assign educators to task (admin endpoint)
   */
  static async assignTaskEducators(taskId: string, payload: { educators: string[]; assigned_type: string; amount?: number | null; bid_id?: string | null; agreement_notes?: string | null; }) {
    const body = {
      educators: payload.educators,
      assigned_type: payload.assigned_type,
      amount: payload.amount ?? null,
      bid_id: payload.bid_id ?? null,
      agreement_notes: payload.agreement_notes ?? null
    };
    const response = await apiClient.post<any>(`/admin/tasks/${taskId}/assignments`, body);
    return response.data;
  }

  /**
   * Update task (admin)
   */
  static async updateTask(taskId: string, taskData: Partial<{ title: string; description?: string | null; deadline?: string | null; budget?: number | null; is_public?: boolean; isPublic?: boolean }>) {
    const payload: any = {
      title: taskData.title,
      description: taskData.description ?? null,
      deadline: taskData.deadline ?? null,
      budget: taskData.budget ?? null,
      is_public: typeof taskData.is_public !== 'undefined' ? taskData.is_public : taskData.isPublic
    };
    const response = await apiClient.put<any>(`/admin/tasks/${taskId}`, payload);
    return response.data;
  }

  /**
   * Change task status (admin)
   */
  static async changeTaskStatus(taskId: string, status: string, reason?: string) {
    const response = await apiClient.post<any>(`/admin/tasks/${taskId}/change-status`, { status, reason });
    return response.data;
  }

  /**
   * Open/Close bidding for a task (admin)
   */
  static async openTaskBidding(taskId: string) {
    const response = await apiClient.post<any>(`/admin/tasks/${taskId}/open-bidding`);
    return response.data;
  }

  static async closeTaskBidding(taskId: string) {
    const response = await apiClient.post<any>(`/admin/tasks/${taskId}/close-bidding`);
    return response.data;
  }

  /**
   * Sub-tasks management (admin)
   */
  static async createSubTask(taskId: string, title: string) {
    const response = await apiClient.post<any>(`/admin/tasks/${taskId}/subtasks`, { title });
    return response.data;
  }

  static async updateSubTask(subTaskId: string, title: string) {
    const response = await apiClient.put<any>(`/admin/tasks/subtasks/${subTaskId}`, { title });
    return response.data;
  }

  static async deleteSubTask(subTaskId: string) {
    const response = await apiClient.delete<any>(`/admin/tasks/subtasks/${subTaskId}`);
    return response.data;
  }

  static async uploadSubTaskAttachment(taskId: string, subTaskId: string, file: File, title?: string) {
    const formData = new FormData();
    formData.append('attachment', file);
    if (title) formData.append('title', title);
    const baseUrl = env.API_BASE_URL || '';
    const token = localStorage.getItem(env.TOKEN_STORAGE_KEY);
    const response = await fetch(`${baseUrl}/admin/tasks/subtasks/${subTaskId}/attachments`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } : { 'Accept': 'application/json' },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw error;
    }
    return response.json();
  }

  static async toggleSubTaskComplete(taskId: string, subTaskId: string, is_complete: boolean) {
    const response = await apiClient.post<any>(`/admin/tasks/subtasks/${subTaskId}/toggle`, { is_complete });
    return response.data;
  }

  /**
   * Educators Management
   */
  static async getEducators(params?: {
    page?: number;
    per_page?: number;
    status?: EducatorStatus;
    search?: string;
    discipline?: string;
  }): Promise<PaginatedResponse<Educator>> {
    const response = await apiClient.get<any>('/admin/educators', params);
    const raw = response.data as any;
    const rawList = Array.isArray(raw?.educators) ? raw.educators : Array.isArray(raw?.data?.educators) ? raw.data.educators : Array.isArray(raw?.data) ? raw.data : [];
    const list = rawList.map((item: any) => {
      try { return transformEducatorResponse(item); } catch { return item; }
    });
    return {
      status: true,
      message: null,
      data: list,
      pagination: raw?.pagination ?? null
    } as PaginatedResponse<Educator>;
  }

  static async getEducator(id: string): Promise<Educator> {
    const response = await apiClient.get<any>(`/admin/educators/${id}`);
    return transformEducatorResponse(response.data);
  }

  static async updateEducatorStatus(id: string, status: EducatorStatus, reason?: string): Promise<Educator> {
    const response = await apiClient.patch<any>(`/admin/educators/${id}/status`, { status, reason });
    const raw = response.data as any;
    return (raw?.educator ?? raw) as Educator;
  }

  static async deleteEducator(id: string): Promise<void> {
    await apiClient.delete<null>(`/admin/educators/${id}`);
  }

  static async inviteEducator(email: string): Promise<void> {
    await apiClient.post<null>('/admin/educators/invite', { email });
  }

  static async completeRegistration(data: { token: string; name: string; phone: string; password: string; password_confirmation: string }): Promise<void> {
    await apiClient.post<null>('/admin/educators/invite/complete', data);
  }

  static async updateEducatorDocumentStatus(educatorId: string, params: { type: 'identity' | 'academic' | 'experience' | 'certification'; docId: string; status: 'VERIFIED' | 'REJECTED' | 'PENDING'; reason?: string; }) {
    const { type, docId, status, reason } = params;
    const response = await apiClient.patch<any>(`/admin/educators/${educatorId}/documents/${type}/${docId}/status`, { status, reason: reason ?? null });
    const raw = response.data as any;
    return (raw?.educator ?? raw) as Educator;
  }

  // Account approval/rejection
  static async acceptEducatorAccount(id: string) {
    const response = await apiClient.post<any>(`/admin/educators/${id}/accept`);
    return response.data;
  }

  static async rejectEducatorAccount(id: string, rejection_reason: string) {
    const response = await apiClient.post<any>(`/admin/educators/${id}/reject`, { rejection_reason });
    return response.data;
  }

  // Identity verification
  static async approveEducatorIdentity(id: string) {
    const response = await apiClient.post<any>(`/admin/educators/${id}/approve-identity`);
    return response.data;
  }

  static async rejectEducatorIdentity(id: string, rejection_reason: string) {
    const response = await apiClient.post<any>(`/admin/educators/${id}/reject-identity`, { rejection_reason });
    return response.data;
  }

  // Account suspension
  static async suspendEducator(id: string, suspension_reason: string) {
    const response = await apiClient.post<any>(`/admin/educators/${id}/suspend`, { suspension_reason });
    return response.data;
  }

  static async unsuspendEducator(id: string) {
    const response = await apiClient.post<any>(`/admin/educators/${id}/unsuspend`);
    return response.data;
  }

  // Academic major verification
  static async approveAcademicMajor(educatorId: string, majorId: string) {
    const response = await apiClient.post<any>(`/admin/educators/${educatorId}/academic-majors/${majorId}/approve`);
    return response.data;
  }

  static async rejectAcademicMajor(educatorId: string, majorId: string, rejection_reason: string) {
    const response = await apiClient.post<any>(`/admin/educators/${educatorId}/academic-majors/${majorId}/reject`, { rejection_reason });
    return response.data;
  }

  /**
   * Educator Applications
   */
  static async getEducatorApplications(params?: {
    page?: number;
    per_page?: number;
    status?: EducatorStatus;
  }): Promise<PaginatedResponse<EducatorApplication>> {
    const response = await apiClient.get<PaginatedResponse<EducatorApplication>>('/admin/educators', params);
    return response.data;
  }

  static async getEducatorApplication(id: string): Promise<EducatorApplication> {
    const response = await apiClient.get<EducatorApplication>(`/admin/educators/${id}`);
    return response.data;
  }

  static async approveEducatorApplication(id: string, message?: string): Promise<EducatorApplication> {
    const response = await apiClient.post<EducatorApplication>(`/admin/educators/${id}/approve`, {
      message
    });
    return response.data;
  }

  static async rejectEducatorApplication(id: string, reason: string): Promise<EducatorApplication> {
    const response = await apiClient.post<EducatorApplication>(`/admin/educators/${id}/reject`, {
      reason
    });
    return response.data;
  }

  /**
   * Users Management
   */
  static async getUsers(params?: {
    page?: number;
    per_page?: number;
    status?: UserStatus;
    search?: string;
  }): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<any>('/admin/users', params);
    const raw = response.data;
    // API returns: { status, data: { users: { data: [...], current_page, ... } } }
    // Normalize to the shape usePaginatedQuery expects: { data: User[], pagination: ... }
    const usersPage = raw?.data?.users ?? raw?.data ?? raw;
    const rawList = Array.isArray(usersPage?.data) ? usersPage.data : (Array.isArray(usersPage) ? usersPage : []);
    return {
      ...raw,
      data: rawList.map((u: any) => ({
        id: String(u.id ?? u.uuid ?? ''),
        name: u.name ?? '',
        email: u.email ?? '',
        phone: u.phone ?? '',
        city: u.city ?? '',
        address: u.address ?? '',
        avatarUrl: u.avatarUrl ?? u.avatar_url ?? '',
        registrationDate: u.registrationDate ?? u.registration_date ?? u.created_at ?? '',
        status: (u.status ?? '').toUpperCase() as UserStatus,
      })),
    } as PaginatedResponse<User>;
  }

  static async getUser(id: string): Promise<User> {
    const response = await apiClient.get<any>(`/admin/users/${id}`);
    const raw = response.data;
    const u = raw?.data?.user ?? raw?.data ?? raw;
    return {
      ...raw,
      data: {
        id: String(u.id ?? u.uuid ?? ''),
        name: u.name ?? '',
        email: u.email ?? '',
        phone: u.phone ?? '',
        city: u.city ?? '',
        address: u.address ?? '',
        avatarUrl: u.avatarUrl ?? u.avatar_url ?? '',
        registrationDate: u.registrationDate ?? u.registration_date ?? u.created_at ?? '',
        status: (u.status ?? '').toUpperCase() as UserStatus,
      },
    } as User;
  }

  static async updateUserStatus(id: string, status: UserStatus, reason?: string): Promise<User> {
    const response = await apiClient.patch<User>(`/admin/users/${id}/status`, {
      status,
      reason
    });
    return response.data;
  }

  static async createUser(data: { name: string; email: string; phone?: string; password: string; city?: string; address?: string; }): Promise<User> {
    const response = await apiClient.post<User>('/admin/users', data);
    return response.data;
  }

  static async updateUser(id: string, data: { name?: string; email?: string; phone?: string; city?: string; address?: string }): Promise<User> {
    const response = await apiClient.put<User>(`/admin/users/${id}`, data);
    return response.data;
  }

  static async deleteUser(id: string) {
    const response = await apiClient.delete<null>(`/admin/users/${id}`);
    return response.data;
  }

  /**
   * Educational Requests Management
   */
  static async getEducationalRequests(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<EducationalRequest>> {
    const response = await apiClient.get<PaginatedResponse<EducationalRequest>>('/admin/educational-requests', params);
    return response.data;
  }

  static async getEducationalRequest(id: string): Promise<EducationalRequest> {
    const response = await apiClient.get<EducationalRequest>(`/admin/educational-requests/${id}`);
    return response.data;
  }

  static async updateEducationalRequest(id: string, data: Partial<EducationalRequest>): Promise<any> {
    const response = await apiClient.put<any>(`/admin/educational-requests/${id}`, data);
    return response.data;
  }

  static async changeEducationalRequestStatus(
    id: string,
    type: 'request' | 'payment' | 'fulfillment',
    status: string,
    reason?: string
  ): Promise<any> {
    const response = await apiClient.post<any>(`/admin/educational-requests/${id}/change-status`, {
      type,
      status,
      reason: reason || null,
    });
    return response.data;
  }

  /**
   * Support Tickets Management
   */
  static async getSupportTickets(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    category?: string;
  }): Promise<PaginatedResponse<SupportTicket>> {
    const response = await apiClient.get<PaginatedResponse<SupportTicket>>('/admin/support-tickets', params);
    return response.data;
  }

  static async getSupportTicket(id: string): Promise<SupportTicket> {
    const response = await apiClient.get<SupportTicket>(`/admin/support-tickets/${id}`);
    return response.data;
  }

  /**
   * Settings Management
   */
  static async getManagedItems(type: 'skills' | 'services' | 'specializations'): Promise<ManagedItem[]> {
    const response = await apiClient.get<ManagedItem[]>(`/admin/managed-items/${type}`);
    return response.data;
  }

  static async createManagedItem(type: 'skills' | 'services' | 'specializations', data: Partial<ManagedItem>): Promise<ManagedItem> {
    const response = await apiClient.post<ManagedItem>(`/admin/managed-items/${type}`, data);
    return response.data;
  }

  static async updateManagedItem(type: 'skills' | 'services' | 'specializations', id: string, data: Partial<ManagedItem>): Promise<ManagedItem> {
    const response = await apiClient.patch<ManagedItem>(`/admin/managed-items/${type}/${id}`, data);
    return response.data;
  }

  static async deleteManagedItem(type: 'skills' | 'services' | 'specializations', id: string): Promise<void> {
    await apiClient.delete<null>(`/admin/managed-items/${type}/${id}`);
  }

  /**
   * Activity Feed
   */
  static async getActivityFeed(params?: {
    page?: number;
    per_page?: number;
    type?: string;
  }): Promise<PaginatedResponse<AdminActivity>> {
    const response = await apiClient.get<PaginatedResponse<AdminActivity>>('/admin/activity-feed', params);
    return response.data;
  }

  /**
   * Bid Tasks (Admin)
   */
  static async acceptBidTask(bidTaskId: string, approval_message?: string) {
    const response = await apiClient.post<any>(`/admin/tasks/bids/${bidTaskId}/accept`, { approval_message: approval_message ?? null });
    return response.data;
  }

  static async rejectBidTask(bidTaskId: string, rejection_reason?: string) {
    const response = await apiClient.post<any>(`/admin/tasks/bids/${bidTaskId}/reject`, { rejection_reason: rejection_reason ?? null });
    return response.data;
  }

  static async assignBidTask(bidTaskId: string, educator_id: string, agreement_notes?: string) {
    const response = await apiClient.post<any>(`/admin/tasks/bids/${bidTaskId}/assign`, {
      educator_id,
      agreement_notes: agreement_notes ?? null
    });
    return response.data;
  }
}
