const BACKEND_URL = (typeof __BACKEND_URL__ !== 'undefined' && __BACKEND_URL__) 
  ? __BACKEND_URL__ 
  : (import.meta.env.VITE_API_URL || 'https://sharehub-c57o.onrender.com');

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${cleanUrl}`;
};
