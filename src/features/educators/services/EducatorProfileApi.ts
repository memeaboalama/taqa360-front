import { apiClient } from '../../../core/api/baseClient';
import { Achievement } from '../../../shared/types';

export type AchievementType = 'work_experience' | 'certificate' | 'course' | 'workshop';
export const ACHIEVEMENT_TYPES: AchievementType[] = ['work_experience', 'certificate', 'course', 'workshop'];

export interface AchievementPayload {
  title: string;
  type: AchievementType;
  description?: string | null;
  organization?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  issue_date?: string | null;
  attachment?: File | null;
}

interface AchievementApiResponsePayload {
  achievement?: unknown;
  achievements?: unknown[];
  items?: unknown[];
  data?: unknown;
}

const ensureAchievementType = (value: string | null | undefined): AchievementType => {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'work_experience') return 'work_experience';
  if (normalized === 'certificate') return 'certificate';
  if (normalized === 'course') return 'course';
  if (normalized === 'workshop') return 'workshop';
  return 'certificate';
};

const mapAchievement = (raw: any): Achievement => ({
  id: String(raw?.id ?? ''),
  title: raw?.title ?? '',
  type: ensureAchievementType(raw?.type ?? raw?.achievement_type ?? 'certificate'),
  description: raw?.description ?? null,
  organization: raw?.organization ?? raw?.issuingAuthority ?? raw?.issuer ?? null,
  documentUrl: raw?.documentUrl ?? raw?.document_url ?? raw?.attachment_url ?? null,
  startDate: raw?.startDate ?? raw?.start_date ?? null,
  endDate: raw?.endDate ?? raw?.end_date ?? null,
  date: raw?.date ?? raw?.issueDate ?? raw?.issue_date ?? null,
  verificationStatus: raw?.verificationStatus ?? raw?.verification_status ?? null,
  rejectionReason: raw?.rejectionReason ?? raw?.rejection_reason ?? null,
});

const toCollection = (payload: AchievementApiResponsePayload | unknown): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray((payload as AchievementApiResponsePayload).achievements)) {
    return (payload as AchievementApiResponsePayload).achievements ?? [];
  }
  if (Array.isArray((payload as AchievementApiResponsePayload).items)) {
    return (payload as AchievementApiResponsePayload).items ?? [];
  }
  if ((payload as AchievementApiResponsePayload).achievement) {
    return [(payload as AchievementApiResponsePayload).achievement];
  }
  if ((payload as AchievementApiResponsePayload).data) {
    return toCollection((payload as AchievementApiResponsePayload).data);
  }
  return [];
};

const extractAchievement = (payload: AchievementApiResponsePayload | unknown): Achievement | null => {
  const collection = toCollection(payload);
  if (!collection.length) {
    return null;
  }
  return mapAchievement(collection[0]);
};

const buildFormData = (payload: AchievementPayload): FormData => {
  const form = new FormData();

  const appendOptional = (key: string, value: string | null | undefined) => {
    if (value === undefined) return;
    form.append(key, value ?? '');
  };

  form.append('title', payload.title);
  form.append('type', payload.type);
  appendOptional('description', payload.description);
  appendOptional('organization', payload.organization);
  appendOptional('start_date', payload.start_date);
  appendOptional('end_date', payload.end_date);
  appendOptional('issue_date', payload.issue_date);

  if (payload.attachment instanceof File) {
    form.append('attachment', payload.attachment);
  }

  return form;
};

export async function fetchAchievements(): Promise<Achievement[]> {
  const response = await apiClient.get<AchievementApiResponsePayload | AchievementApiResponsePayload[]>('/educator/profile/achievements');

  if (response.status === false) {
    throw new Error(response.message || 'تعذر تحميل الإنجازات');
  }

  const collection = toCollection(response.data);
  return collection.map(mapAchievement);
}

export async function createAchievement(payload: AchievementPayload): Promise<Achievement> {
  let response;
  if (payload.attachment instanceof File) {
    const formData = buildFormData(payload);
    response = await apiClient.post<AchievementApiResponsePayload>('/educator/profile/achievements', formData);
  } else {
    const jsonPayload: any = {
      title: payload.title,
      type: payload.type,
      description: payload.description ?? null,
      organization: payload.organization ?? null,
      start_date: payload.start_date ?? null,
      end_date: payload.end_date ?? null,
      issue_date: payload.issue_date ?? null,
    };
    response = await apiClient.post<AchievementApiResponsePayload>('/educator/profile/achievements', jsonPayload);
  }

  if (response.status === false) {
    throw new Error(response.message || 'فشل إنشاء الإنجاز');
  }

  const achievement = extractAchievement(response.data);
  if (!achievement) {
    throw new Error(response.message || 'فشل تحديد بيانات الإنجاز بعد الإنشاء');
  }

  return achievement;
}

export async function updateAchievement(id: string, payload: AchievementPayload): Promise<Achievement> {
  let response;
  if (payload.attachment instanceof File) {
    const formData = buildFormData(payload);
    formData.append('_method', 'PUT');
    response = await apiClient.post<AchievementApiResponsePayload>(`/educator/profile/achievements/${id}`, formData);
  } else {
    const jsonPayload: any = {
      title: payload.title,
      type: payload.type,
      description: payload.description ?? null,
      organization: payload.organization ?? null,
      start_date: payload.start_date ?? null,
      end_date: payload.end_date ?? null,
      issue_date: payload.issue_date ?? null,
    };
    response = await apiClient.put<AchievementApiResponsePayload>(`/educator/profile/achievements/${id}`, jsonPayload);
  }

  if (response.status === false) {
    throw new Error(response.message || 'فشل تحديث الإنجاز');
  }

  const achievement = extractAchievement(response.data) ?? mapAchievement({ ...payload, id });
  return achievement;
}

export async function deleteAchievement(id: string): Promise<void> {
  const response = await apiClient.delete<AchievementApiResponsePayload>(`/educator/profile/achievements/${id}`);

  if (response.status === false) {
    throw new Error(response.message || 'فشل حذف الإنجاز');
  }
}
