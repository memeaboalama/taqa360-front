import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions
} from '@tanstack/react-query';
import { FileService, UploadResponse, UploadProgress, FileCategory } from '../services/FileService';
import { Attachment } from '../types'; // Import Attachment type

// تعريف مفاتيح الاستعلام (Query Keys) لـ React Query
export const fileQueryKeys = {
  all: ['files'] as const,
  file: (id: string) => [...fileQueryKeys.all, id] as const,
};

// Hooks لتعديل البيانات (Mutations)

export const useUploadFile = (
  options?: UseMutationOptions<UploadResponse, Error, { file: File; category?: FileCategory; onProgress?: (progress: UploadProgress) => void }>
) => {
  const queryClient = useQueryClient();
  return useMutation<UploadResponse, Error, { file: File; category?: FileCategory; onProgress?: (progress: UploadProgress) => void }>({
    mutationFn: ({ file, category, onProgress }) => FileService.uploadFile(file, category, onProgress),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: fileQueryKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUploadMultipleFiles = (
  options?: UseMutationOptions<UploadResponse[], Error, { files: File[]; category?: FileCategory; onProgress?: (progress: UploadProgress, fileIndex: number) => void }>
) => {
  const queryClient = useQueryClient();
  return useMutation<UploadResponse[], Error, { files: File[]; category?: FileCategory; onProgress?: (progress: UploadProgress, fileIndex: number) => void }>({
    mutationFn: ({ files, category, onProgress }) => FileService.uploadMultipleFiles(files, category, onProgress),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: fileQueryKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteFile = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: FileService.deleteFile,
    onSuccess: (data, fileId, context) => {
      queryClient.invalidateQueries({ queryKey: fileQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: fileQueryKeys.file(fileId) });
      options?.onSuccess?.(data, fileId, context);
    },
    ...options,
  });
};

export const useGetFileInfo = (
  id: string,
  options?: Omit<UseQueryOptions<UploadResponse, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<UploadResponse, Error>({
    queryKey: fileQueryKeys.file(id),
    queryFn: () => FileService.getFileInfo(id),
    enabled: !!id,
    ...options,
  });
};

export const useUploadAvatar = (
  options?: UseMutationOptions<UploadResponse, Error, { file: File; onProgress?: (progress: UploadProgress) => void }>
) => {
  const queryClient = useQueryClient();
  return useMutation<UploadResponse, Error, { file: File; onProgress?: (progress: UploadProgress) => void }>({
    mutationFn: ({ file, onProgress }) => FileService.uploadAvatar(file, onProgress),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: fileQueryKeys.all });
      // Invalidate user profile query if applicable
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUploadVerificationDocument = (
  options?: UseMutationOptions<UploadResponse, Error, { file: File; documentType: 'id_document' | 'certificate' | 'work_document'; onProgress?: (progress: UploadProgress) => void }>
) => {
  const queryClient = useQueryClient();
  return useMutation<UploadResponse, Error, { file: File; documentType: 'id_document' | 'certificate' | 'work_document'; onProgress?: (progress: UploadProgress) => void }>({
    mutationFn: ({ file, documentType, onProgress }) => FileService.uploadVerificationDocument(file, documentType, onProgress),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: fileQueryKeys.all });
      // Invalidate relevant user documents query if applicable
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUploadProjectAttachment = (
  options?: UseMutationOptions<UploadResponse, Error, { projectId: string; file: File; title?: string; onProgress?: (progress: UploadProgress) => void }>
) => {
  const queryClient = useQueryClient();
  return useMutation<UploadResponse, Error, { projectId: string; file: File; title?: string; onProgress?: (progress: UploadProgress) => void }>({
    mutationFn: ({ projectId, file, title, onProgress }) => FileService.uploadProjectAttachment(projectId, file, title, onProgress),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'attachments'] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUploadTaskDeliverable = (
  options?: UseMutationOptions<UploadResponse, Error, { taskId: string; file: File; title?: string; onProgress?: (progress: UploadProgress) => void }>
) => {
  const queryClient = useQueryClient();
  return useMutation<UploadResponse, Error, { taskId: string; file: File; title?: string; onProgress?: (progress: UploadProgress) => void }>({
    mutationFn: ({ taskId, file, title, onProgress }) => FileService.uploadTaskDeliverable(taskId, file, title, onProgress),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId, 'deliverables'] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

