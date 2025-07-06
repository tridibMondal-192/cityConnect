// Mock ImageKit implementation for development
// In production, you would have a backend server that generates signatures

export const mockImageKitSignature = {
  signature: 'mock_signature',
  expire: Date.now() + 3600000, // 1 hour from now
  token: 'mock_token',
};

// Mock upload function that returns a placeholder image URL
export const mockUploadImage = async (file: File, fileName: string): Promise<string> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a placeholder image URL
  // In production, this would be the actual ImageKit URL
  return `https://via.placeholder.com/400x400/6366f1/ffffff?text=${encodeURIComponent(fileName)}`;
};

// Mock optimized URL function
export const mockGetOptimizedImageUrl = (originalUrl: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
} = {}): string => {
  const { width = 400, height = 400 } = options;
  
  if (originalUrl.includes('placeholder.com')) {
    return originalUrl.replace(/\/\d+x\d+/, `/${width}x${height}`);
  }
  
  return originalUrl;
}; 