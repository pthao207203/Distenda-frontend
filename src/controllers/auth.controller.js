import {
  loginService,
  registerService,
  logoutService,
  loginResetService,
  loginOTPService,
  loginNewService,
} from "../services/auth.service";
import Cookies from "js-cookie";

const saveUserToLocalStorage = (user) => {
  if (!user) return;

  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      id: user._id || user.id,
      name: user.UserFullName || "User",
      email: user.UserEmail,
      avatar:
        user.UserAvatar ||
        "https://cdn.builder.io/api/v1/image/assets/TEMP/bbae0514e8058efa2ff3c88f32951fbd7beba3099187677c6ba1c2f96547ea3f?placeholderIfAbsent=true&apiKey=e677dfd035d54dfb9bce1976069f6b0e",
    })
  );
};

// [POST] /auth/login
export const loginController = async (data, setSuccess, setError, navigate) => {
  try {
    const result = await loginService(data); // Gọi service để xử lý API
    if (result.code === 400) {
      setError(result.message);
    } else {
      setSuccess(result.message || "Đăng nhập thành công!");
      Cookies.set("user_token", result.token, {
        expires: 7, // số ngày hết hạn (ở đây là 7 ngày)
        path: "/", // cookie có hiệu lực toàn site
        sameSite: "Lax", // tăng bảo mật, tránh CSRF
      });
      const user = result.user_info || result.data?.user_info;
      saveUserToLocalStorage(user);
      setTimeout(() => {
        navigate("/courses"); // Điều hướng tới trang chủ (trang khóa học)
      }, 3000);
    }
  } catch (err) {
    setError(err); // Cập nhật lỗi nếu xảy ra
  }
};

// [POST] /auth/register
export const registerController = async (
  data,
  setSuccess,
  setError,
  navigate
) => {
  try {
    const result = await registerService(data); // Gọi service để xử lý API
    if (result.code === 400) {
      setError(result.message);
    } else {
      setSuccess(result.message || "Đăng ký thành công!");
      Cookies.set("user_token", result.token, {
        expires: 7, // số ngày hết hạn (ở đây là 7 ngày)
        path: "/", // cookie có hiệu lực toàn site
        sameSite: "Lax", // tăng bảo mật, tránh CSRF
      });
      const user = result.user_info || result.data?.user_info;
      saveUserToLocalStorage(user);
      setTimeout(() => {
        navigate("/courses"); // Điều hướng tới trang chủ (trang khóa học)
      }, 3000);
    }
  } catch (err) {
    setError(err); // Cập nhật lỗi nếu xảy ra
  }
};

// [GET] /auth/logout
export const logoutController = async (navigate) => {
  try {
    await logoutService(); // Gọi service để xử lý API
    navigate("/login"); // Điều hướng tới trang đăng nhập
  } catch (err) {
    // setError(err); // Cập nhật lỗi nếu xảy ra
  }
};

// [POST] /user/password/forgot
export const loginResetController = async (data, setSuccess, setError) => {
  try {
    const result = await loginResetService(data); // Gọi service để xử lý API
    if (result.code === 400) {
      setError(result.message);
    } else {
      setSuccess(result.message || "Gửi mail thành công!");
    }
    return result;
  } catch (err) {
    setError(err); // Cập nhật lỗi nếu xảy ra
  }
};

// [POST] /user/password/forgot
export const loginOTPController = async (
  data,
  setSuccess,
  setError,
  navigate
) => {
  try {
    const result = await loginOTPService(data); // Gọi service để xử lý API
    if (result.code === 400) {
      setError(result.message);
    } else {
      Cookies.set("user_token", result.token, {
        expires: 7, // số ngày hết hạn (ở đây là 7 ngày)
        path: "/", // cookie có hiệu lực toàn site
        sameSite: "Lax", // tăng bảo mật, tránh CSRF
      });
      const user = result.user_info || result.data?.user_info;
      saveUserToLocalStorage(user);
      setSuccess(result.message || "Xác nhận thành công!");
    }
    return result;
  } catch (err) {
    setError(err); // Cập nhật lỗi nếu xảy ra
  }
};

// [POST] /user/password/forgot
export const loginNewController = async (data, setSuccess, setError) => {
  try {
    const result = await loginNewService(data); // Gọi service để xử lý API
    if (result.code === 400) {
      setError(result.message);
    } else {
      setSuccess(result.message || "Xác nhận thành công!");
    }
    return result;
  } catch (err) {
    setError(err); // Cập nhật lỗi nếu xảy ra
  }
};
