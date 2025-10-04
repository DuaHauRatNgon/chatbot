import { NavigateFunction } from 'react-router-dom';

let navigate: NavigateFunction | null = null;

export const setNavigate = (navigateInstance: NavigateFunction) => {
  navigate = navigateInstance;
};

export const navigateTo = (path: string) => {
  if (navigate) {
    navigate(path);
  } else {
    console.warn('Navigation function not set. Cannot navigate.');
    // Fallback for cases where navigate is not set (e.g., initial load)
    window.location.href = path;
  }
};