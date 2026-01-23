import React, { useEffect, useState } from "react";
import axios from "axios";
import ThankYouPage from "./ThankYouPage";

export default function HandlePayment() {
  const [popupContent, setPopupContent] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resultCode = params.get("resultCode"); // MoMo
    const status = params.get("status");         // ZaloPay
    const orderId = params.get("orderId") || params.get("apptransid");
    const amount = params.get("amount");

    const isSuccessMoMo = resultCode === "0";
    const isSuccessZalo = status === "1";

    if ((isSuccessMoMo || isSuccessZalo) && orderId && amount) {
      axios
        .post(
          `${process.env.REACT_APP_API_BASE_URL}/payment/confirm`,
          { orderId, amount },
          { withCredentials: true }
        )
        .then((res) => {
          setPopupContent("Thanh toán thành công! Khóa học đã được kích hoạt.");
        })
        .catch((err) => {
          setPopupContent(err?.response?.data?.message || "Lỗi xác nhận thanh toán.");
        })
        .finally(() => setShowPopup(true));
    } else {
      setPopupContent("Thanh toán thất bại hoặc bị hủy!");
      setShowPopup(true);
    }
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
    window.location.href = "/courses";
  };

  return (
    <>
      {showPopup && (
        <ThankYouPage onClose={handleClosePopup} content={popupContent} />
      )}
      {!showPopup && (
        <div className="flex items-center justify-center h-screen text-lg">
          ⏳ Đang xử lý thanh toán, vui lòng đợi...
        </div>
      )}
    </>
  );
}
