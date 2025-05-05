import React, { useState, useMemo } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import UserForm from "./UserForm";
import "./Scroll.css";

export default function CheckoutPage({ onClose, ...course }) {
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  const originalPrice = useMemo(() => {
    return course.CoursePrice === 0
      ? 0
      : Math.round((course.CoursePrice * (100 - course.CourseDiscount)) / 100);
  }, [course]);

  const finalPrice = useMemo(() => {
    if (course.CoursePrice === 0) return "Miễn phí";
    return Math.max(originalPrice - discountAmount, 0).toLocaleString("vi-VN");
  }, [originalPrice, discountAmount]);

  const productDetails = {
    title: course.CourseName,
    duration: `${course.CourseDuration} tháng`,
    price: finalPrice,
    imageUrl: course.CoursePicture,
  };

  const userDetails = {
    fullName: course?.user?.UserFullName || "Không có",
    email: course?.user?.UserEmail || "",
    phone: course?.user?.UserPhone || "",
  };

  function applyVoucher(coursePrice, courseDiscount, voucher) {
    const originalPrice = Math.round(coursePrice * (100 - courseDiscount) / 100);

    if (originalPrice < voucher.minAmount) {
      return {
        finalPrice: originalPrice,
        discountApplied: 0,
        message: "Không đủ điều kiện để áp dụng voucher.",
      };
    }

    const percentDiscount = Math.round(originalPrice * voucher.discountPercentage / 100);
    const actualDiscount = Math.min(percentDiscount, voucher.discountAmount);
    const finalPrice = Math.max(originalPrice - actualDiscount, 0);

    return {
      finalPrice,
      discountApplied: actualDiscount,
      message: `Giảm giá thành công ${actualDiscount.toLocaleString("vi-VN")}đ`,
    };
  }

  const handleApplyVoucher = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/pay/check-voucher`,
        {
          voucherCode: discountCode,
          courseSlug: course.CourseSlug,
        },
        { withCredentials: true }
      );

      if (response.data.success && response.data.voucher) {
        const result = applyVoucher(course.CoursePrice, course.CourseDiscount, response.data.voucher);
        setDiscountAmount(result.discountApplied);
        setAppliedCode(discountCode);
        alert(result.message);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi áp dụng mã giảm giá:", error);
      alert("Không thể áp dụng mã giảm giá. Vui lòng thử lại!");
    }
  };

  const handlePayment = async (paymentMethod) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/pay/${course.CourseSlug}/${paymentMethod}`,
        {
          discountAmount,
          voucherCode: appliedCode,
        },
        { withCredentials: true }
      );

      if (response.data.code === 200) {
        if (response.data.payUrl) {
          window.location.href = response.data.payUrl;
        } else if (response.data.redirectUrl) {
          window.location.href = response.data.redirectUrl;
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error);
      alert("Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.");
    }
  };

  return (
    <main className="flex flex-col pb-10 bg-white w-[560px] max-lg:max-w-[420px] p-4 shadow-lg max-h-[90vh] overflow-y-auto">
      <button className="justify-end self-end" onClick={onClose}>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/1914b3001bed44e2a53adf842ab19f47/18ce7f5d3a0e8a95408a91d7f810fd4a3daa1c23a4824327ff1f5f9f74b720b0"
          alt="Close"
          className="object-contain w-[20px] max-lg:w-[16px] aspect-[1] hover:brightness-110 hover:scale-105 transition duration-200"
        />
      </button>

      <div className="flex flex-col px-10 mt-2 w-full max-lg:px-5 max-lg:max-w-full">
        <div className="flex flex-col w-full gap-[16px]">
          <ProductCard {...productDetails} />

          <div className="flex flex-row items-center gap-[24px] text-[1.35rem] max-lg:text-[14px] font-medium text-neutral-900">
            <label htmlFor="discountCode">Mã giảm giá</label>
            <input
              type="text"
              id="discountCode"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#EBF1F9] rounded min-w-0"
              placeholder="Nhập mã..."
            />
            <button
              onClick={handleApplyVoucher}
              className="px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-700"
            >
              OK
            </button>
          </div>

          <p className="text-[1.5rem] max-lg:text-[14px] font-medium leading-none text-black">
            Thành tiền: {finalPrice}đ
          </p>

          <UserForm userDetails={userDetails} />
        </div>

        <div className="flex flex-col items-center gap-4 mt-6">
          <button
            onClick={() => handlePayment("momo")}
            className="w-[240px] py-3 bg-neutral-900 text-white text-lg font-semibold rounded hover:bg-neutral-700"
          >
            Thanh toán MoMo
          </button>
          <button
            onClick={() => handlePayment("zalopay")}
            className="w-[240px] py-3 bg-neutral-900 text-white text-lg font-semibold rounded hover:bg-neutral-700"
          >
            Thanh toán ZaloPay
          </button>
        </div>
      </div>
    </main>
  );
}
