import ImageKit from 'imagekit';
import { mockUploadImage, mockGetOptimizedImageUrl } from './mock';

// ImageKit configuration
export const imagekitConfig = {
  publicKey: 'public_YourImageKitPublicKey', // Replace with your actual public key
  privateKey: 'private_YourImageKitPrivateKey', // Replace with your actual private key
  urlEndpoint: 'https://ik.imagekit.io/your_endpoint', // Replace with your actual endpoint
  folder: '/cityconnect/profiles', // Folder where profile images will be stored
  transformation: {
    quality: 80,
    format: 'webp',
    width: 400,
    height: 400,
  },
};

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Get ImageKit upload signature
export const getImageKitSignature = async () => {
  if (isDevelopment) {
    // Use mock signature in development
    return {
      signature: 'mock_signature',
      expire: Date.now() + 3600000,
      token: 'mock_token',
    };
  }

  try {
    const response = await fetch('/api/imagekit/signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get signature');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting ImageKit signature:', error);
    throw error;
  }
};

// Upload image to ImageKit
export const uploadImageToImageKit = async (file: File, fileName: string) => {
  if (isDevelopment) {
    // Use mock upload in development
    return await mockUploadImage(file, fileName);
  }

  try {
    const signature = await getImageKitSignature();
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('signature', signature.signature);
    formData.append('expire', signature.expire);
    formData.append('token', signature.token);
    formData.append('publicKey', imagekitConfig.publicKey);
    formData.append('folder', imagekitConfig.folder);
    
    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Get optimized image URL
export const getOptimizedImageUrl = (originalUrl: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
} = {}) => {
  if (isDevelopment) {
    // Use mock optimized URL in development
    return mockGetOptimizedImageUrl(originalUrl, options);
  }

  const { width = 400, height = 400, quality = 80, format = 'webp' } = options;
  
  if (!originalUrl || !originalUrl.includes('imagekit.io')) {
    return originalUrl;
  }
  
  const transformation = `tr=w-${width},h-${height},q-${quality},f-${format}`;
  const separator = originalUrl.includes('?') ? '&' : '?';
  
  return `${originalUrl}${separator}${transformation}`;
}; 