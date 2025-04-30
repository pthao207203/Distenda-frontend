import React from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import UserForm from "./UserForm";
import './Scroll.css';

export default function CheckoutPage({ onClose, ...course }) {
  const productDetails = {
    title: `${course.CourseName}`,
    duration: `${course.CourseDuration} tháng`,
    price:
      course.CoursePrice === 0
        ? "Miễn phí"
        : (
            (course.CoursePrice * (100 - course.CourseDiscount)) /
            100
          ).toLocaleString("vi-VN"),
    imageUrl: `${course.CoursePicture}`,
  };

  const userDetails = {
    fullName: `${course?.user?.UserFullName || "Không có"}`,
    email: `${course?.user?.UserEmail || ""}`,
    phone: `${course?.user?.UserPhone || ""}`,
  };

  const handlePayment = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3001/pay/${course.CourseSlug}/momo`,
        {},
        {
          withCredentials: true,
        } // Cho phép gửi cookie kèm theo request
      );

      if (response.data.code === 200) {
        window.location.href = response.data.payUrl;
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi thanh toán MoMo:", error);
      alert("Thanh toán MoMo thất bại, vui lòng thử lại!");
    }
  };

  return (
    <main className="flex overflow-hidden overflow-hidden-scroll flex-col pb-10 bg-white w-[560px] max-lg:max-w-[420px]  p-4 shadow-lg w-full max-h-[90vh] overflow-y-auto">
      <button className="justify-end self-end " onClick={onClose}>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/1914b3001bed44e2a53adf842ab19f47/18ce7f5d3a0e8a95408a91d7f810fd4a3daa1c23a4824327ff1f5f9f74b720b0?apiKey=1914b3001bed44e2a53adf842ab19f47&"
          alt="Close"
          className="object-contain w-[20px] max-lg:max-w[12px] self-end aspect-[1] hover:brightness-110 hover:scale-105 transition duration-200"
        />
      </button>
      <div className="flex flex-col px-10 mt-2 w-full max-lg:px-5 max-lg:max-w-full">
        <div className="flex flex-col w-full gap-[16px] max-lg:max-w-full">
          <ProductCard {...productDetails} />
          {/* <p className=" text-xl max-lg:text-[14px] font-medium leading-none text-black">
            Tổng giá trị: {productDetails.price}
          </p> */}
          <div className="flex flex-row items-center w-full gap-[24px] text-[1.35rem] max-lg:text-[14px] font-medium text-neutral-900">
            <label htmlFor="discountCode">Mã giảm giá</label>
            <input
              type="text"
              id="discountCode"
              className="flex gap-2.5 px-2 py-2 mt-2 bg-[#EBF1F9] min-h-[32px] w-1/2"
            />
          </div>
          <p className="text-[1.5rem] max-lg:text-[14px] font-medium leading-none text-black">
            Thành tiền: {productDetails.price}
          </p>
          <UserForm userDetails={userDetails} />
        </div>
        <button
          onClick={handlePayment}
          className="flex gap-3 justify-center items-center self-center px-2 py-[16px] mt-10 text-xl max-lg:text-[14px] font-medium text-white bg-neutral-900 w-[240px] max-lg:max-w-[200px]"
        >
          <span>Đăng ký</span>
        </button>

      </div>
    </main>
  );
}
