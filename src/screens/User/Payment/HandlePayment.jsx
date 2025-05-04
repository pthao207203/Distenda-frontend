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
    const orderId =
      params.get("orderId") || params.get("apptransid"); // dùng cho cả 2
    const amount = params.get("amount");

    // Thanh toán thành công
    if (resultCode === "0" || status === "1") {
      axios
        .post(
          "http://localhost:3001/payment/confirm",
          { orderId, amount },
          { withCredentials: true }
        )
        .then((res) => {
          setPopupContent("Thanh toán thành công! Khóa học đã được kích hoạt.");
          setShowPopup(true);
        })
        .catch((err) => {
          if (err.response) {
            setPopupContent(`${err.response.data.message}`);
          } else {
            setPopupContent("Lỗi kết nối server!");
          }
          setShowPopup(true);
        });
    } else {
      // Thanh toán thất bại
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
      {showPopup && <ThankYouPage onClose={handleClosePopup} content={popupContent} />}
      <div className="flex items-center justify-center h-screen">
        Đang xử lý thanh toán, vui lòng đợi...
      </div>
    </>
  );
}
