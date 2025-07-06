import { v2 as cloudinary } from '@cloudinary/url-gen';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

class CloudinaryService {
  private uploadEndpoint: string;

  constructor() {
    this.uploadEndpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
  }

  async uploadFile(file: File, folder: string = 'general'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    try {
      const response = await fetch(this.uploadEndpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(files: File[], folder: string = 'general'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}): string {
    const { width, height, quality = 'auto', format = 'auto' } = options;
    
    let transformation = 'q_auto,f_auto';
    if (width) transformation += `,w_${width}`;
    if (height) transformation += `,h_${height}`;
    if (quality !== 'auto') transformation += `,q_${quality}`;
    if (format !== 'auto') transformation += `,f_${format}`;

    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
  }

  async deleteFile(publicId: string): Promise<void> {
    // Note: Deletion should be handled through your backend for security
    console.warn('File deletion should be handled through backend');
  }
}

export const cloudinaryService = new CloudinaryService();