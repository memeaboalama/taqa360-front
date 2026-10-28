// Using the enterprise base client across the app
import { apiClient } from '../../../core/api/baseClient';
import { env } from '../../../core/config/env';
import {
  Educator,
  EducatorProfile,
  AcademicMajor,
  WorkExperience,
  Certification,
  Service,
  Skill,
  Language,
  PaymentInfo,
  SocialLink,
  WithdrawalRequest,
  Transaction,
  PaginatedResponse,
  Attachment,
  AppNotification,
  SupportTicket,
  Bid,
  Achievement
} from '../../../shared/types';

export interface EducatorDashboardData {
  stats: {
    active_projects: number;
    active_tasks: number;
    overdue_tasks: number;
    completed_tasks: number;
    pending_invitations: number;
    total_earnings: number;
    success_rate: number;
    average_rating: number;
  };
  recent_projects: {
    id: string;
    title: string;
    description: string;
    deadline: string;
    is_published: boolean;
    status: string;
    tasks_count: number;
    created_at: string;
  }[];
  pending_opportunities: {
    id: string;
    title: string;
    description: string;
    budget: string;
    deadline: string;
    open_tasks_count: number;
  }[];
  recent_earnings: {
    id?: string;
    amount: string;
    source?: string;
    received_at?: string;
  }[];
  active_tasks_list: {
    id?: string;
    task_title: string;
    project_title: string;
    status?: string;
    deadline?: string;
    progress?: number;
  }[];
  overdue_tasks_list: {
    id?: string;
    task_title: string;
    project_title: string;
    status?: string;
    deadline?: string;
    progress?: number;
  }[];
  recent_assignments: {
    id: string;
    task_title: string;
    project_title: string;
    status: 'pending' | 'accepted' | 'rejected' | string;
    amount: string | null;
    assigned_at: string;
    accepted_at: string | null;
    assigned_type: 'direct' | 'from_bid' | 'invitation' | string;
  }[];
  upcoming_deadlines: {
    task_title?: string;
    project_title?: string;
    deadline?: string;
  }[];
  notifications: {
    type: 'info' | 'warning' | 'success' | 'error' | string;
    title: string;
    message: string;
    action?: string;
    icon?: string;
    timestamp: string;
  }[];
}

export class EducatorService {
  // Assignments (invitations)
  static async acceptAssignment(assignmentId: string, note?: string): Promise<any> {
    const response = await apiClient.post<any>(`/educator/assignments/${assignmentId}/accept`, { note: note ?? null });
    return response.data;
  }

  // Keep method name for compatibility, but call the correct decline endpoint and payload per contract
  static async rejectAssignment(assignmentId: string, reason?: string, note?: string): Promise<any> {
    const response = await apiClient.post<any>(`/educator/assignments/${assignmentId}/decline`, {
      rejection_reason: reason ?? note ?? null,
      note: note ?? reason ?? null,
    });
    return response.data;
  }

  // Profile Management
  static async getProfile(): Promise<Educator> {
    try {
      const response = await apiClient.get<any>('/educator/profile');
      const educatorRaw = EducatorService.extractEducatorPayload(response?.data);
      return EducatorService.mapEducator(educatorRaw);
    } catch (error) {
      const err = error as any;
      if (!err?.response || err.response.status !== 404) {
        throw error;
      }
      const fallbackResponse = await apiClient.get<any>('/educator/profileResponse');
      const educatorRaw = EducatorService.extractEducatorPayload(fallbackResponse?.data);
      return EducatorService.mapEducator(educatorRaw);
    }
  }

  static async updateProfile(profileData: Partial<Educator>): Promise<Educator> {
    const response = await apiClient.put<any>('/educator/profile', profileData);
    const educatorRaw = EducatorService.extractEducatorPayload(response?.data);
    return EducatorService.mapEducator(educatorRaw);
  }

  static async uploadAvatar(file: File): Promise<Attachment> {
    const response = await apiClient.uploadFile<Attachment>('/educator/avatar', file);
    return response.data;
  }

  static async updateAvailabilityStatus(status: 'available' | 'busy' | 'unavailable'): Promise<Educator> {
    const response = await apiClient.put<Educator>('/educator/availability', { status });
    return response.data;
  }

  // New: Update Basic Info per latest API contract
  static async updateBasicInfo(data: {
    name: string;
    email: string;
    phone: string;
    nationality_id: string;
    gender: 'male' | 'female';
    country_id: string;
    city_id: string;
    identity_type: 'national_id' | 'passport';
    identity_id: string;
    experience_years?: number;
    identityImageFront?: File | null;
    identityImageBack?: File | null;
    delete_identity_front?: '1' | '0' | boolean;
    delete_identity_back?: '1' | '0' | boolean;
  }): Promise<Educator> {
    // Build JSON payload for all non-file fields
    const jsonPayload: any = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      nationality_id: data.nationality_id,
      gender: data.gender,
      country_id: data.country_id,
      city_id: data.city_id,
      identity_type: data.identity_type,
      identity_id: data.identity_id,
    };
    if (typeof data.experience_years === 'number') jsonPayload.experience_years = Number(data.experience_years);
    if (typeof data.delete_identity_front !== 'undefined') jsonPayload.delete_identity_front = (data.delete_identity_front === true || data.delete_identity_front === '1') ? '1' : '0';
    if (typeof data.delete_identity_back !== 'undefined') jsonPayload.delete_identity_back = (data.delete_identity_back === true || data.delete_identity_back === '1') ? '1' : '0';

    const hasFiles = (data.identityImageFront instanceof File) || (data.identityImageBack instanceof File);

    let response;
    if (hasFiles) {
      // Use multipart only when files are present
      const form = new FormData();
      Object.entries(jsonPayload).forEach(([k, v]) => form.append(k, String(v)));
      if (data.identityImageFront instanceof File) form.append('identityImageFront', data.identityImageFront);
      if (data.identityImageBack instanceof File) form.append('identityImageBack', data.identityImageBack);
      response = await apiClient.post<any>('/educator/profile/basic-info', form);
    } else {
      // Send clean JSON payload
      response = await apiClient.post<any>('/educator/profile/basic-info', jsonPayload);
    }

    const api = response?.data as any;
    if (api && typeof api.status === 'boolean' && api.status === false) {
      const err: any = new Error(String(api.message || 'تعذر حفظ البيانات الأساسية'));
      err.errors = api.errors || api.data;
      throw err;
    }
    const educatorRaw = EducatorService.extractEducatorPayload(api);
    return EducatorService.mapEducator(educatorRaw);
  }

  // New: Update Biography per latest API contract
  static async updateBiography(data: { bio: { title: string; description: string }; social_links: { platform: string; url: string }[] }): Promise<Educator> {
    const response = await apiClient.post<any>('/educator/profile/biography', data);
    const api = response?.data as any;
    if (api && typeof api.status === 'boolean' && api.status === false) {
      const err: any = new Error(String(api.message || 'تعذر حفظ النبذة التعريفية'));
      err.errors = api.errors || api.data;
      throw err;
    }
    const educatorRaw = EducatorService.extractEducatorPayload(api);
    return EducatorService.mapEducator(educatorRaw);
  }

  // New: Nationalities / Countries / Cities
  static async getNationalities(): Promise<{ id: string; title: string }[]> {
    const response = await apiClient.get<any>('/nationalities');
    const d: any = response?.data ?? {};
    return (d?.data?.nationalities || d?.nationalities || []).map((n: any) => ({ id: String(n.id), title: String(n.title) }));
  }
  static async getCountries(): Promise<{ id: string; title: string }[]> {
    const response = await apiClient.get<any>('/countries');
    const d: any = response?.data ?? {};
    return (d?.data?.countries || d?.countries || []).map((c: any) => ({ id: String(c.id), title: String(c.title) }));
  }
  static async getCountryCities(countryId: string): Promise<{ id: string; title: string }[]> {
    const response = await apiClient.get<any>(`/country-cities/${countryId}`);
    const d: any = response?.data ?? {};
    return (d?.data?.cities || d?.cities || []).map((c: any) => ({ id: String(c.id), title: String(c.title) }));
  }

  private static mapEducator(e: any): Educator {
    const basic = e?.basicInfo ?? e?.profile ?? {};
    const isCompleteField = typeof basic?.is_complete === 'boolean'
      ? basic.is_complete
      : (typeof basic?.isComplete === 'boolean' ? basic.isComplete : undefined);
    const profile: EducatorProfile = {
      identityStatus: basic?.identityStatus ?? basic?.verificationStatus ?? null,
      verificationStatus: basic?.verificationStatus ?? basic?.identityStatus ?? null,
      gender: basic?.gender ?? null,
      birthDate: basic?.birthDate ?? null,
      nationality: basic?.nationality ?? null,
      country: basic?.country ?? e?.country ?? null,
      city: basic?.city ?? e?.city ?? null,
      educationLevel: basic?.educationLevel ?? null,
      experienceYears: Number(basic?.experienceYears ?? basic?.experience_years ?? 0),
      employmentStatus: basic?.employmentStatus ?? null,
      profileCompletion: Number(basic?.profileCompletion ?? basic?.profile_completion ?? 0),
      experienceLevel: basic?.experienceLevel ?? null,
      idType: basic?.idType ?? basic?.identity_type ?? null,
      idNumber: basic?.idNumber ?? basic?.identity_id ?? '',
      idDocumentUrl: EducatorService.resolveUrl(basic?.idDocumentUrl ?? basic?.idDocumentFrontUrl ?? basic?.identityImageFront ?? basic?.id_document_url ?? null),
      idDocumentBackUrl: EducatorService.resolveUrl(basic?.idDocumentBackUrl ?? basic?.idDocumentBack ?? basic?.identityImageBack ?? basic?.id_document_back_url ?? null),
      rejectionReason: basic?.rejectionReason ?? null,
      isComplete: isCompleteField,
    };

    const academicMajors = EducatorService.normalizeAcademicMajors(e?.academicMajors);
    const languages = EducatorService.normalizeLanguages(e?.languages);
    const skills = EducatorService.normalizeSkills(e?.skills);
    const services = EducatorService.normalizeServices(e?.services);
    const socialLinks = EducatorService.normalizeSocialLinks(e?.socialLinks);
    const { achievements, workExperience, certifications } = EducatorService.normalizeAchievements(e?.achievements);
    const fallbackWorkExperience = workExperience.length ? workExperience : EducatorService.mapFallbackWorkExperience(e?.workExperience);
    const fallbackCertifications = certifications.length ? certifications : EducatorService.mapFallbackCertifications(e?.certifications);
    const paymentInfo = EducatorService.mapPaymentInfo(e?.bankInfo);

    return {
      id: String(e?.id ?? ''),
      name: e?.name ?? '',
      email: e?.email ?? '',
      phone: e?.phone ?? '',
      discipline: e?.discipline ?? null,
      schoolName: e?.schoolName ?? null,
      country: profile.country ?? null,
      city: profile.city ?? null,
      status: e?.status ?? 'pending',
      avatarUrl: EducatorService.resolveUrl(e?.avatarUrl ?? ''),
      rating: Number(e?.rating ?? 0),
      availabilityStatus: EducatorService.normalizeAvailability(e?.availabilityStatus ?? e?.availability_status),
      bio: ((): string => {
        const b = e?.bio;
        if (b && typeof b === 'object') {
          return String(b?.description ?? b?.desc ?? b?.text ?? '').trim();
        }
        return String(b ?? '').trim();
      })(),
      bioTitle: ((): string | null => {
        const b = e?.bio;
        if (b && typeof b === 'object') {
          const t = String(b?.title ?? '').trim();
          return t || null;
        }
        return null;
      })(),
      profile,
      basicInfo: profile,
      academicMajors,
      languages,
      services,
      skills,
      achievements,
      workExperience: fallbackWorkExperience,
      certifications: fallbackCertifications,
      socialLinks,
      paymentInfo,
      bankInfo: paymentInfo,
    } as Educator;
  }

  private static extractEducatorPayload(payload: any): any {
    if (!payload) return {};
    const data = payload?.data ?? payload;
    if (data?.educator) return data.educator;
    if (data?.user) return data.user;
    return data;
  }

  private static normalizeAvailability(status: any): Educator['availabilityStatus'] {
    const value = String(status ?? '').toLowerCase();
    if (!value) return 'UNAVAILABLE';
    if (value === 'active' || value === 'available') return 'AVAILABLE';
    if (value === 'unavailable') return 'UNAVAILABLE';
    return value.toUpperCase() as Educator['availabilityStatus'];
  }

  private static resolveUrl(u: any): string | null {
    if (!u && u !== 0) return null;
    const url = String(u || '').trim();
    if (!url) return null;
    // allow data:, blob:, http(s):
    if (/^(data:|blob:|https?:)\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
    // If already absolute path
    if (url.startsWith('/')) return `${env.API_BASE_URL}${url}`;
    // Otherwise append to API base
    return `${env.API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\/+/, '')}`;
  }

  private static normalizeAcademicMajors(items: any[]): AcademicMajor[] {
    if (!Array.isArray(items)) return [];
    return items
      .filter(Boolean)
      .map((item: any, index: number) => ({
        id: String(item?.id ?? item?.majorId ?? item?.major_id ?? item?.academic_major_id ?? `major-${index}`),
        majorName: item?.majorName ?? item?.major_name ?? item?.name ?? item?.name?.ar ?? item?.name?.en ?? null,
        isCustom: Boolean(item?.isCustom ?? item?.is_custom ?? false),
        institution: item?.institution ?? item?.graduation_institution ?? null,
        graduationYear: item?.graduationYear ?? item?.graduation_year ?? null,
        degree: item?.degree ?? null,
        documentUrl: EducatorService.resolveUrl(item?.documentUrl ?? item?.document_url ?? null),
        verificationStatus: item?.verificationStatus ?? item?.verification_status ?? 'PENDING',
        rejectionReason: item?.rejectionReason ?? item?.rejection_reason ?? null,
      }));
  }

  private static normalizeLanguages(items: any[]): Language[] {
    if (!Array.isArray(items)) return [];
    const mapLvl = (raw: any) => {
      const v = String(raw ?? '').toLowerCase();
      if (v === 'beginner' || v === 'basic') return 'BASIC';
      if (v === 'intermediate') return 'INTERMEDIATE';
      if (v === 'advanced') return 'ADVANCED';
      if (v === 'native') return 'NATIVE';
      return String(raw ?? 'BASIC').toString().toUpperCase();
    };
    return items
      .filter(Boolean)
      .map((item: any, index: number) => ({
        id: String(item?.id ?? item?.languageId ?? item?.language_id ?? `language-${index}`),
        name: item?.name ?? item?.language ?? item?.title ?? '',
        level: mapLvl(item?.level ?? item?.proficiency ?? item?.language_level ?? item?.fluency ?? 'BASIC'),
        isPrimary: Boolean(item?.isPrimary ?? item?.is_primary ?? false),
      }));
  }

  private static normalizeSkills(items: any[]): Skill[] {
    if (!Array.isArray(items)) return [];
    return items
      .filter(Boolean)
      .map((item: any, index: number) => ({
        id: String(item?.id ?? item?.skillId ?? item?.skill_id ?? `skill-${index}`),
        name: item?.name ?? item?.custom_name ?? '',
        level: typeof item?.level === 'number'
          ? item.level
          : (Number(item?.level ?? item?.proficiency) || item?.level || item?.proficiency || 0),
        isCustom: Boolean(item?.isCustom ?? item?.is_custom ?? !item?.skillId),
        skillId: item?.skillId ?? item?.skill_id ?? null,
      }));
  }

  private static normalizeServices(items: any[]): Service[] {
    if (!Array.isArray(items)) return [];
    return items
      .filter(Boolean)
      .map((item: any, index: number) => ({
        id: String(item?.id ?? item?.serviceId ?? item?.service_id ?? `service-${index}`),
        name: item?.name ?? item?.custom_name ?? '',
        description: item?.description ?? item?.custom_description ?? null,
        isCustom: Boolean(item?.isCustom ?? item?.is_custom ?? !item?.serviceId),
        serviceId: item?.serviceId ?? item?.service_id ?? null,
        customDescription: item?.custom_description ?? item?.description ?? null,
      }));
  }

  private static normalizeSocialLinks(items: any[]): SocialLink[] {
    if (!Array.isArray(items)) return [];
    return items
      .filter((item) => item && item.url)
      .map((item: any, index: number) => ({
        id: String(item?.id ?? `${item?.platform ?? 'social'}-${index}`),
        platform: item?.platform ?? 'website',
        url: item?.url ?? '',
      }));
  }

  private static normalizeAchievements(items: any[]): {
    achievements: Achievement[];
    workExperience: WorkExperience[];
    certifications: Certification[];
  } {
    if (!Array.isArray(items)) {
      return { achievements: [], workExperience: [], certifications: [] };
    }

    const achievements = items.filter(Boolean).map((item: any, index: number) => ({
      id: String(item?.id ?? `achievement-${index}`),
      title: item?.title ?? '',
      type: item?.type ?? '',
      description: item?.description ?? null,
      organization: item?.organization ?? item?.issuingAuthority ?? null,
      documentUrl: EducatorService.resolveUrl(item?.documentUrl ?? item?.document_url ?? null),
      startDate: item?.startDate ?? null,
      endDate: item?.endDate ?? null,
      date: item?.date ?? item?.issueDate ?? null,
      verificationStatus: item?.verificationStatus ?? item?.verification_status ?? null,
      rejectionReason: item?.rejectionReason ?? item?.rejection_reason ?? null,
    }));

    const workExperience = achievements
      .filter((a) => (a.type ?? '').toLowerCase() === 'work_experience')
      .map((a) => ({
        id: a.id,
        title: a.title,
        organization: a.organization ?? null,
        startDate: a.startDate ?? null,
        endDate: a.endDate ?? null,
        description: a.description ?? null,
        documentUrl: EducatorService.resolveUrl(a.documentUrl ?? null),
        verificationStatus: a.verificationStatus ?? 'PENDING',
        rejectionReason: a.rejectionReason ?? null,
      }));

    const certifications = achievements
      .filter((a) => (a.type ?? '').toLowerCase() !== 'work_experience')
      .map((a) => ({
        id: a.id,
        title: a.title,
        issuingAuthority: a.organization ?? null,
        organization: a.organization ?? null,
        type: a.type ?? null,
        issueDate: a.date ?? null,
        startDate: a.startDate ?? null,
        endDate: a.endDate ?? null,
        description: a.description ?? null,
        documentUrl: EducatorService.resolveUrl(a.documentUrl ?? null),
        verificationStatus: a.verificationStatus ?? 'PENDING',
        rejectionReason: a.rejectionReason ?? null,
      }));

    return { achievements, workExperience, certifications };
  }

  private static mapFallbackWorkExperience(items: any[]): WorkExperience[] {
    if (!Array.isArray(items)) return [];
    return items.filter(Boolean).map((item: any, index: number) => ({
      id: String(item?.id ?? `experience-${index}`),
      title: item?.title ?? '',
      organization: item?.organization ?? null,
      startDate: item?.startDate ?? null,
      endDate: item?.endDate ?? null,
      description: item?.description ?? null,
      documentUrl: EducatorService.resolveUrl(item?.documentUrl ?? null),
      verificationStatus: item?.verificationStatus ?? item?.verification_status ?? 'PENDING',
      rejectionReason: item?.rejectionReason ?? item?.rejection_reason ?? null,
    }));
  }

  private static mapFallbackCertifications(items: any[]): Certification[] {
    if (!Array.isArray(items)) return [];
    return items.filter(Boolean).map((item: any, index: number) => ({
      id: String(item?.id ?? `certification-${index}`),
      title: item?.title ?? '',
      issuingAuthority: item?.issuingAuthority ?? item?.organization ?? null,
      organization: item?.organization ?? null,
      type: item?.type ?? null,
      issueDate: item?.issueDate ?? item?.date ?? null,
      startDate: item?.startDate ?? null,
      endDate: item?.endDate ?? null,
      description: item?.description ?? null,
      documentUrl: EducatorService.resolveUrl(item?.documentUrl ?? null),
      verificationStatus: item?.verificationStatus ?? item?.verification_status ?? 'PENDING',
      rejectionReason: item?.rejectionReason ?? item?.rejection_reason ?? null,
    }));
  }

  private static mapPaymentInfo(payment: any): PaymentInfo {
    if (!payment || typeof payment !== 'object') {
      return {
        bankName: '',
        iban: '',
      };
    }

    return {
      id: payment?.id ? String(payment.id) : undefined,
      bankName: payment?.bankName ?? payment?.bank_name ?? '',
      accountHolderName: payment?.accountHolderName ?? payment?.name ?? undefined,
      iban: payment?.iban ?? '',
      name: payment?.name ?? undefined,
      address: payment?.address ?? undefined,
      bankCountry: payment?.bankCountry ?? payment?.bank_country ?? undefined,
      bankCode: payment?.bankCode ?? payment?.bank_code ?? undefined,
      isApproved: typeof payment?.isApproved === 'boolean' ? payment.isApproved : payment?.is_approved ?? undefined,
    };
  }

  // Dashboard
  static async getDashboard(): Promise<EducatorDashboardData> {
    const response = await apiClient.get<EducatorDashboardData>('/educator/dashboard/stats');
    return response.data;
  }

  // Academic Information
  static async getAcademicMajors(): Promise<AcademicMajor[]> {
    const response = await apiClient.get<any>('/educator/profile/academic-majors');
    const raw = (response.data as any)?.items
      ?? (response.data as any)?.data?.items
      ?? (response.data as any)?.academicMajors
      ?? (response.data as any)?.academic_majors
      ?? response.data
      ?? [];
    const collection = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return EducatorService.normalizeAcademicMajors(collection);
  }

  static async createAcademicMajor(data: any): Promise<AcademicMajor> {
    const degree = data?.degree ?? data?.Degree ?? '';
    const institution = data?.institution ?? data?.graduation_institution ?? '';
    const graduationYear = String(data?.graduationYear ?? data?.graduation_year ?? '');
    const isCustom = Boolean(data?.isCustom ?? data?.is_custom ?? (!data?.academicMajorId && !data?.academic_major_id));
    const customName = data?.customName ?? data?.custom_name ?? data?.majorName ?? '';
    const academicMajorId = data?.academicMajorId ?? data?.academic_major_id ?? null;
    const certificate: File | undefined = (data?.certificate as File) || (data?.attachment as File) || (data?.file as File) || undefined;

    let response: any;
    if (certificate instanceof File) {
      const form = new FormData();
      form.append('degree', String(degree));
      form.append('is_custom', isCustom ? '1' : '0');
      if (isCustom) {
        form.append('custom_name', String(customName || ''));
      } else if (academicMajorId) {
        form.append('academic_major_id', String(academicMajorId));
      }
      form.append('graduation_institution', String(institution || ''));
      if (graduationYear) form.append('graduation_year', graduationYear);
      form.append('certificate', certificate);
      response = await apiClient.post<any>('/educator/profile/academic-majors', form);
    } else {
      const payload: any = {
        degree: String(degree),
        is_custom: isCustom ? 1 : 0,
        graduation_institution: String(institution || ''),
      };
      if (graduationYear) payload.graduation_year = graduationYear;
      if (isCustom) payload.custom_name = String(customName || '');
      else if (academicMajorId) payload.academic_major_id = String(academicMajorId);
      response = await apiClient.post<any>('/educator/profile/academic-majors', payload);
    }

    const items = (response.data as any)?.items
      ?? (response.data as any)?.data?.items
      ?? (response.data as any)?.academicMajors
      ?? (response.data as any)?.academic_majors
      ?? response.data
      ?? [];
    const normalized = EducatorService.normalizeAcademicMajors(Array.isArray(items) ? items : items ? [items] : []);
    if (!normalized.length) {
      throw new Error('لم يتم استلام بيانات المؤهل بعد الإضافة');
    }
    return normalized[0];
  }

  static async updateAcademicMajor(id: string, data: any): Promise<AcademicMajor> {
    const degree = data?.degree ?? data?.Degree ?? '';
    const institution = data?.institution ?? data?.graduation_institution ?? '';
    const graduationYear = String(data?.graduationYear ?? data?.graduation_year ?? '');
    const isCustom = Boolean(data?.isCustom ?? data?.is_custom ?? (!data?.academicMajorId && !data?.academic_major_id));
    const customName = data?.customName ?? data?.custom_name ?? data?.majorName ?? '';
    const academicMajorId = data?.academicMajorId ?? data?.academic_major_id ?? null;
    const certificate: File | undefined = (data?.certificate as File) || (data?.attachment as File) || (data?.file as File) || undefined;

    let response: any;
    if (certificate instanceof File) {
      const form = new FormData();
      if (degree) form.append('degree', String(degree));
      form.append('is_custom', isCustom ? '1' : '0');
      if (isCustom) {
        form.append('custom_name', String(customName || ''));
      } else if (academicMajorId) {
        form.append('academic_major_id', String(academicMajorId));
      }
      if (institution) form.append('graduation_institution', String(institution));
      if (graduationYear) form.append('graduation_year', graduationYear);
      form.append('certificate', certificate);
      form.append('_method', 'PUT');
      response = await apiClient.post<any>(`/educator/profile/academic-majors/${id}`, form);
    } else {
      const payload: any = {};
      if (degree) payload.degree = String(degree);
      payload.is_custom = isCustom ? 1 : 0;
      if (isCustom) payload.custom_name = String(customName || '');
      else if (academicMajorId) payload.academic_major_id = String(academicMajorId);
      if (institution) payload.graduation_institution = String(institution);
      if (graduationYear) payload.graduation_year = graduationYear;
      response = await apiClient.put<any>(`/educator/profile/academic-majors/${id}`, payload);
    }

    const items = (response.data as any)?.items
      ?? (response.data as any)?.data?.items
      ?? (response.data as any)?.academicMajors
      ?? (response.data as any)?.academic_majors
      ?? response.data
      ?? [];
    const normalized = EducatorService.normalizeAcademicMajors(Array.isArray(items) ? items : items ? [items] : []);
    if (!normalized.length) {
      throw new Error('لم يتم استلام بيانات المؤهل بعد التعديل');
    }
    return normalized[0];
  }

  static async deleteAcademicMajor(id: string): Promise<void> {
    await apiClient.delete<null>(`/educator/profile/academic-majors/${id}`);
  }

  static async getOfficialAcademicMajors(): Promise<{ id: string; name: string }[]> {
    const response = await apiClient.get<any>('/admin/edu/academic-majors');
    const items = (response.data as any)?.academic_majors ?? (response.data as any)?.data?.academic_majors ?? response.data ?? [];
    return Array.isArray(items)
      ? items
          .filter((it: any) => it && (it.status ? String(it.status).toLowerCase() === 'active' : true))
          .map((it: any, idx: number) => ({
            id: String(it?.id ?? `major-${idx}`),
            name: [it?.name?.ar, it?.name?.en].filter(Boolean).join(' | ') || String(it?.name ?? '')
          }))
      : [];
  }

  // Work Experience
  static async getWorkExperience(): Promise<WorkExperience[]> {
    const response = await apiClient.get<WorkExperience[]>('/educator/work-experience');
    return response.data;
  }

  static async createWorkExperience(data: Omit<WorkExperience, 'id' | 'verificationStatus'>): Promise<WorkExperience> {
    const response = await apiClient.post<WorkExperience>('/educator/work-experience', data);
    return response.data;
  }

  static async updateWorkExperience(id: string, data: Partial<WorkExperience>): Promise<WorkExperience> {
    const response = await apiClient.put<WorkExperience>(`/educator/work-experience/${id}`, data);
    return response.data;
  }

  static async deleteWorkExperience(id: string): Promise<void> {
    await apiClient.delete<null>(`/educator/work-experience/${id}`);
  }

  // Certifications
  static async getCertifications(): Promise<Certification[]> {
    const response = await apiClient.get<Certification[]>('/educator/certifications');
    return response.data;
  }

  static async createCertification(data: Omit<Certification, 'id' | 'verificationStatus'>): Promise<Certification> {
    const response = await apiClient.post<Certification>('/educator/certifications', data);
    return response.data;
  }

  static async updateCertification(id: string, data: Partial<Certification>): Promise<Certification> {
    const response = await apiClient.put<Certification>(`/educator/certifications/${id}`, data);
    return response.data;
  }

  static async deleteCertification(id: string): Promise<void> {
    await apiClient.delete<null>(`/educator/certifications/${id}`);
  }

  // Skills, Languages, Services
  static async getSkills(): Promise<Skill[]> {
    const response = await apiClient.get<any>('/educator/profile/skills');
    const payload: any = (response as any).data ?? response.data;
    const list: any[] = Array.isArray(payload?.skills) ? payload.skills : Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
    return EducatorService.normalizeSkills(list);
  }

  static async createSkill(data: Partial<Skill> & { skill_id?: number; custom_name?: string; is_custom?: boolean; level?: number | string }): Promise<Skill> {
    const mapLevel = (lvl: any) => {
      if (typeof lvl === 'number') return lvl;
      const v = String(lvl || '').toUpperCase();
      if (v.includes('BEGINNER')) return 1;
      if (v.includes('EXPERT')) return 5;
      return 3; // default INTERMEDIATE
    };
    const payload: any = {
      skill_id: (data as any).skill_id ?? null,
      custom_name: (data as any).custom_name ?? data.name ?? '',
      is_custom: (data as any).is_custom ?? (data as any).isCustom ?? !(data as any).skill_id,
      level: mapLevel((data as any).level)
    };
    const response = await apiClient.post<Skill>('/educator/profile/skills', payload);
    return response.data;
  }

  static async updateSkill(id: string, data: Partial<Skill> & { skill_id?: number; custom_name?: string; is_custom?: boolean; level?: number | string }): Promise<Skill> {
    const mapLevel = (lvl: any) => {
      if (typeof lvl === 'number') return lvl;
      const v = String(lvl || '').toUpperCase();
      if (v.includes('BEGINNER')) return 1;
      if (v.includes('EXPERT')) return 5;
      return 3;
    };
    const payload: any = {
      skill_id: (data as any).skill_id ?? null,
      custom_name: (data as any).custom_name ?? data.name ?? '',
      is_custom: (data as any).is_custom ?? (data as any).isCustom ?? !(data as any).skill_id,
      level: mapLevel((data as any).level)
    };
    const response = await apiClient.put<Skill>(`/educator/profile/skills/${id}`, payload);
    return response.data;
  }

  static async deleteSkill(id: string): Promise<void> {
    await apiClient.delete<null>(`/educator/profile/skills/${id}`);
  }

  // Keep bulk update for backward compatibility
  static async updateSkills(skills: Skill[]): Promise<Skill[]> {
    const response = await apiClient.put<any>('/educator/profile/skills', { skills });
    const payload: any = (response as any).data ?? response.data;
    const list: any[] = Array.isArray(payload?.skills) ? payload.skills : Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
    return EducatorService.normalizeSkills(list);
  }

  static async getLanguages(): Promise<Language[]> {
    const response = await apiClient.get<any>('/educator/profile/languages');
    const payload: any = (response as any).data ?? response.data;
    const collection: any[] = Array.isArray(payload?.languages) ? payload.languages : Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
    return EducatorService.normalizeLanguages(collection);
  }

  static async updateLanguages(languages: Language[]): Promise<Language[]> {
    const response = await apiClient.put<any>('/educator/profile/languages', { languages });
    const payload: any = (response as any).data ?? response.data;
    const collection: any[] = Array.isArray(payload?.languages) ? payload.languages : Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
    return EducatorService.normalizeLanguages(collection);
  }

  static async getServices(): Promise<Service[]> {
    const response = await apiClient.get<any>('/educator/profile/services');
    const payload: any = (response as any).data ?? response.data;
    const list: any[] = Array.isArray(payload?.services) ? payload.services : Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
    return list.map((s: any, i: number) => ({
      id: String(s?.id ?? s?.serviceId ?? s?.service_id ?? `service-${i}`),
      name: s?.name ?? s?.title ?? '',
      description: s?.description ?? s?.custom_description ?? null,
      isCustom: Boolean(s?.isCustom ?? s?.is_custom ?? !s?.serviceId),
      serviceId: s?.serviceId ?? s?.service_id ?? null,
      customDescription: s?.custom_description ?? s?.description ?? null,
    } as Service));
  }

  static async createService(data: Partial<Service> & { service_id?: number; custom_name?: string; custom_description?: string; is_custom?: boolean }): Promise<Service> {
    const isCustom = (data as any).is_custom ?? (data as any).isCustom ?? !(data as any).service_id;
    const payload: any = {
      service_id: (data as any).service_id ?? null,
      custom_name: (data as any).custom_name ?? data.name ?? '',
      custom_description: (data as any).custom_description ?? data.description ?? '',
      is_custom: isCustom
    };
    const response = await apiClient.post<Service>('/educator/profile/services', payload);
    return response.data;
  }

  static async updateService(id: string, data: Partial<Service> & { service_id?: number; custom_name?: string; custom_description?: string; is_custom?: boolean }): Promise<Service> {
    const isCustom = (data as any).is_custom ?? (data as any).isCustom ?? !(data as any).service_id;
    const payload: any = {
      service_id: (data as any).service_id ?? null,
      custom_name: (data as any).custom_name ?? data.name ?? '',
      custom_description: (data as any).custom_description ?? data.description ?? '',
      is_custom: isCustom
    };
    const response = await apiClient.put<Service>(`/educator/profile/services/${id}`, payload);
    return response.data;
  }

  static async deleteService(id: string): Promise<void> {
    await apiClient.delete<null>(`/educator/profile/services/${id}`);
  }

  // Keep bulk update for backward compatibility
  static async updateServices(services: Service[]): Promise<Service[]> {
    const response = await apiClient.put<Service[]>('/educator/profile/services', { services });
    return response.data;
  }

  // Social Links and Payment Info
  static async getSocialLinks(): Promise<SocialLink[]> {
    const response = await apiClient.get<SocialLink[]>('/educator/profile/social-links');
    return response.data;
  }

  static async updateSocialLinks(links: SocialLink[]): Promise<SocialLink[]> {
    const response = await apiClient.put<SocialLink[]>('/educator/profile/social-links', { social_links: links });
    return response.data;
  }

  static async getPaymentInfo(): Promise<PaymentInfo> {
    const response = await apiClient.get<any>('/educator/profile/bank-info');
    const d: any = (response as any).data ?? response.data;
    const mapped: PaymentInfo = {
      bankName: d?.bank_name || d?.bankName || '',
      accountHolderName: d?.name || d?.accountHolderName || d?.name_on_card || '',
      iban: d?.iban || ''
    } as any;
    return mapped;
  }

  static async updatePaymentInfo(info: PaymentInfo): Promise<PaymentInfo> {
    const payload: any = {
      iban: (info as any).iban,
      name: (info as any).accountHolderName,
      bank_name: (info as any).bankName,
      address: (info as any).address || '',
      bank_country: (info as any).bank_country || '',
      bank_code: (info as any).bank_code || '',
      is_approved: (info as any).is_approved ?? false
    };
    const response = await apiClient.post<any>('/educator/profile/bank-info', payload);
    const d: any = (response as any).data ?? response.data;
    const mapped: PaymentInfo = {
      bankName: d?.bank_name || d?.bankName || payload.bank_name,
      accountHolderName: d?.name || d?.accountHolderName || payload.name,
      iban: d?.iban || payload.iban
    } as any;
    return mapped;
  }

  static async deletePaymentInfo(): Promise<void> {
    await apiClient.delete<null>('/educator/profile/bank-info');
  }

  // Projects and Tasks
  static async getMyProjects(params?: { page?: number; per_page?: number; status?: string; search?: string; }): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get<PaginatedResponse<any>>('/educator/my-projects', params);
    return response.data;
  }

  static async getMyTasks(params?: { page?: number; per_page?: number; status?: string; search?: string; }): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get<PaginatedResponse<any>>('/educator/my-tasks', params);
    return response.data;
  }

  // New: Assignments & Tasks per latest contract
  static async getAssignments(params?: Record<string, any>): Promise<any> {
    const response = await apiClient.get<any>('/educator/assignments', params);
    return response;
  }

  static async getTasks(filters?: Record<string, any>): Promise<any> {
    // API expects GET with body; use POST override with sendParamsInBody
    const response = await apiClient.get<any>('/educator/tasks', filters, { sendParamsInBody: true });
    return response.data;
  }

  static async getTaskDetail(taskId: string): Promise<any> {
    const response = await apiClient.get<any>(`/educator/tasks/${taskId}`);
    return response.data;
  }

  static async createSubTask(taskId: string, title: string): Promise<any> {
    const response = await apiClient.post<any>(`/educator/tasks/${taskId}/subtasks`, { title });
    return response.data;
  }

  static async toggleSubTask(taskId: string, subTaskId: string): Promise<any> {
    const response = await apiClient.post<any>(`/educator/tasks/subtasks/${subTaskId}/toggle`);
    return response.data;
  }

  static async uploadTaskAttachment(taskId: string, file: File, title?: string): Promise<Attachment> {
    const response = await apiClient.uploadFile<Attachment>(`/educator/tasks/attachments`, file, { title: title || file.name }, undefined, 'attachment');
    return response.data;
  }

  static async uploadSubTaskAttachment(taskId: string, subTaskId: string, file: File, title?: string): Promise<Attachment> {
    const response = await apiClient.uploadFile<Attachment>(`/educator/tasks/subtasks/${subTaskId}/attachments`, file, { title: title || file.name }, undefined, 'attachment');
    return response.data;
  }

  static async updateSubTask(taskId: string, subTaskId: string, data: { title?: string }): Promise<any> {
    const response = await apiClient.put<any>(`/educator/tasks/subtasks/${subTaskId}`, data);
    return response.data;
  }

  static async deleteSubTask(taskId: string, subTaskId: string): Promise<any> {
    const response = await apiClient.delete<any>(`/educator/tasks/subtasks/${subTaskId}`);
    return response.data;
  }

  static async uploadDeliverable(taskId: string, file: File, title?: string): Promise<Attachment> {
    const response = await apiClient.uploadFile<Attachment>(`/educator/tasks/${taskId}/upload-attachment`, file, { title: title || file.name }, undefined, 'attachment');
    return response.data;
  }

  static async deleteDeliverable(taskId: string, deliverableId: string): Promise<any> {
    const response = await apiClient.delete<any>(`/educator/tasks/${taskId}/deliverables/${deliverableId}`);
    return response.data;
  }

  static async updateTaskStatus(taskId: string, status: 'PENDING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED'): Promise<any> {
    const response = await apiClient.post<any>(`/educator/tasks/${taskId}/status`, { status });
    return response.data;
  }

  static async completeTask(taskId: string): Promise<any> {
    const response = await apiClient.post<any>(`/educator/tasks/${taskId}/complete`);
    return response.data;
  }

  // Earnings and Transactions
  static async getEarnings(params?: { page?: number; per_page?: number; }): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.get<PaginatedResponse<Transaction>>('/educator/earnings', params);
    return response.data;
  }

  static async getTransactions(params?: { page?: number; per_page?: number; }): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.get<PaginatedResponse<Transaction>>('/educator/transactions', params);
    return response.data;
  }

  static async requestWithdrawal(amount: number, notes?: string): Promise<WithdrawalRequest> {
    const response = await apiClient.post<WithdrawalRequest>('/educator/withdrawal-request', {
      amount,
      notes
    });
    return response.data;
  }

  static async getWithdrawalRequests(params?: { page?: number; per_page?: number; status?: string; }): Promise<PaginatedResponse<WithdrawalRequest>> {
    const response = await apiClient.get<PaginatedResponse<WithdrawalRequest>>('/educator/withdrawal-requests', params);
    return response.data;
  }

  static async getBids(params?: { page?: number; per_page?: number; status?: string; search?: string; sort_by?: string; }): Promise<PaginatedResponse<Bid>> {
    const response = await apiClient.get<PaginatedResponse<Bid>>('/educator/bids', params, { sendParamsInBody: true });
    return response;
  }

  static async getBid(id: string): Promise<any> {
    const response = await apiClient.get<Bid>(`/educator/bids/${id}`);
    return response;
  }

  static async createBid(bidData: any): Promise<Bid> {
    const form = EducatorService.buildBidFormData(bidData, false);
    const response = await apiClient.post<Bid>('/educator/bids', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  }

  static async updateBid(id: string, bidData: any): Promise<Bid> {
    const form = EducatorService.buildBidFormData(bidData, true);
    form.append('_method', 'PUT');
    const response = await apiClient.post<Bid>(`/educator/bids/${id}`, form);
    return response.data;
  }

  static async deleteBid(id: string): Promise<void> {
    await apiClient.delete<null>(`/educator/bids/${id}`);
  }

  // Bid Tasks
  static async getBidTasks(bidId: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/educator/bids/${bidId}/tasks`);
    return response.data;
  }

  static async updateBidTask(bidId: string, taskId: string, data: any): Promise<any> {
    const response = await apiClient.put<any>(`/educator/bids/${bidId}/tasks/${taskId}`, data);
    return response.data;
  }

  // Support and Communication
  static async getSupportTickets(params?: { page?: number; per_page?: number; status?: string; category?: string; }): Promise<PaginatedResponse<SupportTicket>> {
    const response = await apiClient.get<PaginatedResponse<SupportTicket>>('/educator/support-tickets', params);
    return response.data;
  }

  static async createSupportTicket(ticketData: {
    category: string;
    subject: string;
    message: string;
    priority?: 'low' | 'medium' | 'high';
    attachments?: File[];
  }): Promise<SupportTicket> {
    const formData = new FormData();
    formData.append('category', ticketData.category);
    formData.append('subject', ticketData.subject);
    formData.append('message', ticketData.message);
    if (ticketData.priority) formData.append('priority', ticketData.priority);
    ticketData.attachments?.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });
    const response = await apiClient.post<SupportTicket>('/educator/support-tickets', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  }

  static async getInboxMessages(params?: { page?: number; per_page?: number; }): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get<PaginatedResponse<any>>('/educator/inbox', params);
    return response.data;
  }

  static async markMessageAsRead(id: string): Promise<void> {
    await apiClient.put<null>(`/educator/inbox/${id}/read`);
  }

  // Notifications (stored educator notifications from notification_news)
  static async getNotifications(params?: { page?: number; per_page?: number; unread_only?: boolean; }): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get<any>('/educator/notifications', params);
    const envelope: any = response as any;
    const inner: any = envelope?.data ?? {};
    const rawList = inner?.notifications ?? inner?.data?.notifications ?? inner;
    const items = Array.isArray(rawList?.data) ? rawList.data : (Array.isArray(rawList) ? rawList : []);
    const mapped = items.map((n: any) => ({
      id: String(n?.id ?? ''),
      title: n?.title ?? '',
      message: n?.message ?? n?.body ?? '',
      body: n?.body ?? n?.message ?? '',
      channel: n?.channel ?? '',
      is_read: Boolean(n?.is_read ?? n?.isRead ?? false),
      isRead: Boolean(n?.isRead ?? n?.is_read ?? false),
      timestamp: n?.timestamp ?? n?.created_at ?? '',
      created_at: n?.created_at ?? n?.timestamp ?? '',
      admin_name: n?.admin_name ?? n?.admin?.name ?? '',
    })).filter((n: any) => n.id);
    return {
      ...(envelope as any),
      data: mapped,
    } as PaginatedResponse<any>;
  }

  static async markNotificationAsRead(id: string): Promise<void> {
    await apiClient.put<null>(`/educator/notifications/${id}/read`);
  }

  static async markAllNotificationsAsRead(): Promise<void> {
    await apiClient.post<null>('/educator/notifications/mark-all-read');
  }

  // Application Management
  static async submitApplication(): Promise<any> {
    const response = await apiClient.post<any>('/educator/submit-application');
    return response.data;
  }

  static async getApplicationStatus(): Promise<any> {
    const response = await apiClient.get<any>('/educator/application-status');
    return response.data;
  }

  // Document Upload
  static async uploadDocument(type: string, file: File, metadata?: any): Promise<Attachment> {
    const response = await apiClient.uploadFile<Attachment>(`/educator/documents/${type}`, file, metadata);
    return response.data;
  }

  private static buildBidFormData(bidData: any, isUpdate: boolean = false) {
    const form = new FormData();
    const projectId = bidData.projectId || bidData.project_id;
    if (projectId) form.append('project_id', String(projectId));
    if (bidData.proposal !== undefined && bidData.proposal !== null) form.append('proposal', String(bidData.proposal));
    const delivery = bidData.deliveryDays ?? bidData.delivery_days;
    if (delivery !== undefined && delivery !== null && delivery !== '') form.append('delivery_days', String(delivery));

    const links = Array.isArray(bidData.links) ? bidData.links : [];
    links.forEach((l: any, i: number) => {
      if (l?.id && isUpdate) form.append(`links[${i}][id]`, String(l.id));
      if (l?.title !== undefined) form.append(`links[${i}][title]`, String(l.title || ''));
      if (l?.url !== undefined) form.append(`links[${i}][url]`, String(l.url || ''));
    });

    const deletedLinks = Array.isArray(bidData.deleted_links) ? bidData.deleted_links : (Array.isArray(bidData.deletedLinks) ? bidData.deletedLinks : []);
    deletedLinks.forEach((id: any, i: number) => form.append(`deleted_links[${i}]`, String(id)));

    const bidTasks = Array.isArray(bidData.bid_tasks) ? bidData.bid_tasks : (Array.isArray(bidData.bidTasks) ? bidData.bidTasks : []);
    bidTasks.forEach((bt: any, i: number) => {
      const taskId = bt.task_id ?? bt.taskId;
      if (taskId !== undefined) form.append(`bid_tasks[${i}][task_id]`, String(taskId));
      if (bt.amount !== undefined) form.append(`bid_tasks[${i}][amount]`, String(bt.amount));
      if (bt.id && isUpdate) form.append(`bid_tasks[${i}][id]`, String(bt.id));
    });

    const attachments = Array.isArray(bidData.attachments) ? bidData.attachments : [];
    attachments.forEach((att: any, i: number) => {
      if (att?.id && isUpdate && !att.file) {
        form.append(`attachments[${i}][id]`, String(att.id));
        if (att.title !== undefined) form.append(`attachments[${i}][title]`, String(att.title || ''));
      } else {
        if (att.title !== undefined) form.append(`attachments[${i}][title]`, String(att.title || ''));
        if (att.file instanceof File) form.append(`attachments[${i}][file]`, att.file);
      }
    });

    const deletedAttachments = Array.isArray(bidData.deleted_attachments) ? bidData.deleted_attachments : (Array.isArray(bidData.deletedAttachments) ? bidData.deletedAttachments : []);
    deletedAttachments.forEach((id: any, i: number) => form.append(`deleted_attachments[${i}]`, String(id)));
    return form;
  }

  // New: Languages CRUD and lookups
  static async getSupportedLanguages(): Promise<{ id: string; title: string }[]> {
    const response = await apiClient.get<any>('/languages');
    const payload: any = (response as any).data ?? response.data;
    const list: any[] = Array.isArray(payload?.languages) ? payload.languages : Array.isArray(payload?.data?.languages) ? payload.data.languages : Array.isArray(payload?.data) ? payload.data : [];
    return list.filter(Boolean).map((l: any, i: number) => ({ id: String(l?.id ?? `lang-${i}`), title: String(l?.title ?? l?.name ?? '') }));
  }

  static async createLanguage(data: { language_id: string; level: string; is_primary: boolean }): Promise<Language> {
    const payload = {
      language_id: data.language_id,
      level: String(data.level).toLowerCase(),
      is_primary: Boolean(data.is_primary),
    };
    const response = await apiClient.post<any>('/educator/profile/languages', payload);
    const d: any = (response as any).data ?? response.data;
    const langRaw = d?.language ?? d?.data?.language ?? d;
    return EducatorService.normalizeLanguages([langRaw])[0];
  }

  static async updateLanguage(id: string, data: { language_id: string; level: string; is_primary: boolean }): Promise<Language> {
    const payload = {
      language_id: data.language_id,
      level: String(data.level).toLowerCase(),
      is_primary: Boolean(data.is_primary),
    };
    const response = await apiClient.put<any>(`/educator/profile/languages/${id}`, payload);
    const d: any = (response as any).data ?? response.data;
    const langRaw = d?.language ?? d?.data?.language ?? d;
    return EducatorService.normalizeLanguages([langRaw])[0];
  }

  static async deleteLanguage(id: string): Promise<void> {
    await apiClient.delete<any>(`/educator/profile/languages/${id}`);
  }

  static async getAdminSkills(): Promise<{ id: string; name: { en?: string; ar?: string }; status?: string }[]> {
    const response = await apiClient.get<any>('/admin/edu/skills');
    const payload: any = (response as any).data ?? response.data;
    const list: any[] = Array.isArray(payload?.skills) ? payload.skills : Array.isArray(payload?.data?.skills) ? payload.data.skills : Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    return list.filter(Boolean).map((s: any) => ({ id: String(s?.id ?? ''), name: { en: s?.name?.en, ar: s?.name?.ar }, status: s?.status }));
  }

  static async getAdminServices(): Promise<{ id: string; name: string; description?: string }[]> {
    const response = await apiClient.get<any>('/admin/edu/services');
    const payload: any = (response as any).data ?? response.data;
    const list: any[] = Array.isArray(payload?.services) ? payload.services : Array.isArray(payload?.data?.services) ? payload.data.services : Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    return list.filter(Boolean).map((s: any) => ({ id: String(s?.id ?? ''), name: String(s?.name ?? ''), description: s?.description }));
  }
}
