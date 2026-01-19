import Cookies from "js-cookie";
export const getCurrentUser = () => {
  try {
    const stored = localStorage.getItem("currentUser");
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn("Không đọc được user từ localStorage", e);
  }
  return null;
};

export const getUserAvatar = () => {
  const user = getCurrentUser();
  return user?.avatar;
};

export const clearUserData = () => {
  localStorage.removeItem("currentUser");
  Cookies.remove("user_token");
};