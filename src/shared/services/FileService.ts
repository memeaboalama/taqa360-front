import { apiClient } from '../../core/api/client';
import { env } from '../../core/config/env';

export interface UploadResponse {
  id: string;
  fileName: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type FileCategory =
  | 'avatar'
  | 'document'
  | 'attachment'
  | 'deliverable'
  | 'certificate'
  | 'id_document'
  | 'work_document';

export class FileService {
  /**
   * رفع ملف واحد
   */
  static async uploadFile(
    file: File,
    category: FileCategory = 'attachment',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    // التحقق من نوع الملف والحجم
    this.validateFile(file, category);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const response = await apiClient.upload<UploadResponse>(
      '/files/upload',
      file,
      onProgress ? (percentage) => {
        onProgress({
          loaded: (percentage / 100) * file.size,
          total: file.size,
          percentage
        });
      } : undefined
    );

    return response.data;
  }

  /**
   * رفع ملفات متعددة
   */
  static async uploadMultipleFiles(
    files: File[],
    category: FileCategory = 'attachment',
    onProgress?: (progress: UploadProgress, fileIndex: number) => void
  ): Promise<UploadResponse[]> {
    const uploadPromises = files.map((file, index) =>
      this.uploadFile(
        file,
        category,
        onProgress ? (progress) => onProgress(progress, index) : undefined
      )
    );

    return Promise.all(uploadPromises);
  }

  /**
   * حذف ملف
   */
  static async deleteFile(fileId: string): Promise<void> {
    await apiClient.delete<null>(`/files/${fileId}`);
  }

  /**
   * الحصول على معلومات الملف
   */
  static async getFileInfo(fileId: string): Promise<UploadResponse> {
    const response = await apiClient.get<UploadResponse>(`/files/${fileId}`);
    return response.data;
  }

  /**
   * رفع صورة شخصية
   */
  static async uploadAvatar(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    // التحقق من أن الملف صورة
    if (!this.isImageFile(file)) {
      throw new Error('يجب أن يكون الملف صورة');
    }

    return this.uploadFile(file, 'avatar', onProgress);
  }

  /**
   * رفع مستند تحقق
   */
  static async uploadVerificationDocument(
    file: File,
    documentType: 'id_document' | 'certificate' | 'work_document',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    // التحقق من أن الملف مستند مقبول
    if (!this.isDocumentFile(file) && !this.isImageFile(file)) {
      throw new Error('يجب أن يكون الملف مستند أو صورة');
    }

    return this.uploadFile(file, documentType, onProgress);
  }

  /**
   * رفع مرفقات مشروع
   */
  static async uploadProjectAttachment(
    projectId: string,
    file: File,
    title?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    this.validateFile(file, 'attachment');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);
    if (title) formData.append('title', title);

    const response = await apiClient.upload<UploadResponse>(
      `/projects/${projectId}/attachments`,
      file,
      onProgress ? (percentage) => {
        onProgress({
          loaded: (percentage / 100) * file.size,
          total: file.size,
          percentage
        });
      } : undefined
    );

    return response.data;
  }

  /**
   * رفع مخرجات مهمة
   */
  static async uploadTaskDeliverable(
    taskId: string,
    file: File,
    title?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    this.validateFile(file, 'deliverable');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('task_id', taskId);
    if (title) formData.append('title', title);

    const response = await apiClient.upload<UploadResponse>(
      `/tasks/${taskId}/deliverables`,
      file,
      onProgress ? (percentage) => {
        onProgress({
          loaded: (percentage / 100) * file.size,
          total: file.size,
          percentage
        });
      } : undefined
    );

    return response.data;
  }

  /**
   * تحويل الملف إلى Base64 (للمعاينة)
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * إنشاء URL مؤقت للملف (للمعاينة)
   */
  static createObjectURL(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * إلغاء URL المؤقت
   */
  static revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * تنسيق حجم الملف
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * التحقق من صحة الملف
   */
  private static validateFile(file: File, category: FileCategory): void {
    // التحقق من الحجم
    if (file.size > env.MAX_FILE_SIZE) {
      throw new Error(`حجم الملف كبير جداً. الحد الأقصى هو ${this.formatFileSize(env.MAX_FILE_SIZE)}`);
    }

    // التحقق من النوع حسب الفئة
    switch (category) {
      case 'avatar':
        if (!this.isImageFile(file)) {
          throw new Error('يجب أن تكون الصورة الشخصية بصيغة JPG أو PNG');
        }
        break;
      case 'document':
      case 'certificate':
      case 'id_document':
      case 'work_document':
        if (!this.isDocumentFile(file) && !this.isImageFile(file)) {
          throw new Error('يجب أن يكون الملف مستند أو صورة');
        }
        break;
      case 'attachment':
      case 'deliverable':
        // معظم أنواع الملفات مقبولة للمرفقات
        break;
      default:
        break;
    }
  }

  /**
   * التحقق من أن الملف صورة
   */
  private static isImageFile(file: File): boolean {
    return env.ALLOWED_IMAGE_TYPES.includes(file.type);
  }

  /**
   * التحقق من أن الملف مستند
   */
  private static isDocumentFile(file: File): boolean {
    return env.ALLOWED_DOCUMENT_TYPES.includes(file.type);
  }

  /**
   * الحصول على أيقونة الملف حسب النوع
   */
  static getFileIcon(fileName: string | File): string {
    const extension = typeof fileName === 'string'
      ? fileName.split('.').pop()?.toLowerCase()
      : fileName.name.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎥';
      case 'mp3':
      case 'wav':
        return '🎵';
      case 'zip':
      case 'rar':
        return '🗜️';
      default:
        return '📎';
    }
  }

  /**
   * التحقق من إمكانية معاينة الملف
   */
  static canPreviewFile(fileName: string | File): boolean {
    const mimeType = typeof fileName === 'string'
      ? this.getMimeTypeFromExtension(fileName)
      : fileName.type;

    return (
      mimeType.startsWith('image/') ||
      mimeType === 'application/pdf' ||
      mimeType.startsWith('text/')
    );
  }

  /**
   * الحصول على MIME type من الامتداد
   */
  private static getMimeTypeFromExtension(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }
}

