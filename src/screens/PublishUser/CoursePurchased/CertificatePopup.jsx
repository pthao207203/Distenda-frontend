import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
// import "./certificate-template/globals.css";
import "./certificate-template/style.css";

export default function CertificatePopup({
  userName,
  courseName,
  instructorName,
  onClose,
}) {
  const certificateRef = useRef();

  const downloadPNG = async () => {
    const canvas = await html2canvas(certificateRef.current, {
      useCORS: true,
      allowTaint: false,
    });
    const link = document.createElement("a");
    link.download = "certificate.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const downloadPDF = async () => {
    const canvas = await html2canvas(certificateRef.current, {
      useCORS: true,
      allowTaint: false,
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "pt", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    const imgScaledWidth = imgWidth * ratio;
    const imgScaledHeight = imgHeight * ratio;

    const marginX = (pdfWidth - imgScaledWidth) / 2;
    const marginY = (pdfHeight - imgScaledHeight) / 2;

    pdf.addImage(
      imgData,
      "PNG",
      marginX,
      marginY,
      imgScaledWidth,
      imgScaledHeight
    );
    pdf.save("certificate.pdf");
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      {/* Popup chỉ chứa chứng chỉ, không chứa nút */}
      <div className="relative max-w-[90%] max-h-[90%] overflow-auto rounded-lg p-4 bg-white flex justify-center items-center">
        <div className="transform scale-[0.7] origin-center">
          <div ref={certificateRef}>
            <div className="frame">
              <div className="div">
                <div className="text-wrapper">{userName}</div>
                <p className="p">“{courseName}”</p>
                <div className="text-wrapper-2">{instructorName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Các nút nằm ngoài popup */}
      <div className="absolute bottom-8 flex gap-4 justify-center">
        <button
          onClick={downloadPNG}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Tải PNG
        </button>
        <button
          onClick={downloadPDF}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Tải PDF
        </button>
        <button
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
