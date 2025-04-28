import * as React from "react";
import MoonLoader from "react-spinners/MoonLoader";

// Component để hiển thị hình ảnh với bóng đổ
function ImageWithShadow({ src, alt }) {
  return (
    <img
      loading="lazy"
      src={src}
      alt={alt}
      className="object-contain shrink-0 bg-none w-[60px] max-lg:w-[30px]"
    />
  );
}

function LoadingPopup() {
  // Dữ liệu hình ảnh trang trí ở các góc
  const cornerImages = [
    {
      src: "https://cdn.builder.io/api/v1/image/assets/TEMP/59b9819b2f8bcba5a532bac25a2a11282419b6aabd38e3a3bd70b97c7bbec430?placeholderIfAbsent=true&apiKey=e677dfd035d54dfb9bce1976069f6b0e",
      alt: "Top left decorative element",
    },
    {
      src: "https://cdn.builder.io/api/v1/image/assets/TEMP/631194690e0d3936d5085113c8d86eb3414e79c243145ce47d95df9316e6e37e?placeholderIfAbsent=true&apiKey=e677dfd035d54dfb9bce1976069f6b0e",
      alt: "Top right decorative element",
    },
    {
      src: "https://cdn.builder.io/api/v1/image/assets/TEMP/29ca412ec35dc720602a949c8cfc32eb796543795e2d5aa33c030019556c26ae?placeholderIfAbsent=true&apiKey=e677dfd035d54dfb9ce1976069f6b0e",
      alt: "Bottom left decorative element",
    },
    {
      src: "https://cdn.builder.io/api/v1/image/assets/TEMP/37fc4790a46aa078c69f7f7e2592a3795899a59503c0ea27bb49607794680bdf?placeholderIfAbsent=true&apiKey=e677dfd035d54dfb9bce1976069f6b0e",
      alt: "Bottom right decorative element",
    },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="flex flex-col bg-neutral-900 max-w-[607px] w-full max-h-[347px] max-lg:max-w-[320px]">
        {/* Hình ảnh góc trên bên trái và bên phải */}
        <div className="relative flex flex-wrap gap-5 justify-between w-full bg-none">
          {/* Hình ảnh góc trên bên trái */}
          <ImageWithShadow
            src={cornerImages[0].src}
            alt={cornerImages[0].alt}
          />

          {/* Hình ảnh góc trên bên phải và ảnh icon đóng */}
          <button className="relative">
            <ImageWithShadow
              src={cornerImages[1].src}
              alt={cornerImages[1].alt}
            />
          </button>
        </div>

        {/* Nội dung chính của popup */}
        <div className="flex flex-col self-center px-[43px] max-lg:px-[20px] w-full text-[1.5rem] max-lg:text-[14px] font-medium leading-tight text-center text-white items-center">
          {/* <MoonLoader color="#CFF500" size={80} className="hidden lg:block" /> */}
          <MoonLoader
            color="#CFF500"
            size={60}
            className="hidden max-lg:block"
          />
          <p className="mt-4 text-[#CFF500]">Đang tải...</p>
        </div>

        {/* Hình ảnh góc dưới bên trái và phải */}
        <div className="flex flex-wrap gap-5 justify-between w-full">
          <ImageWithShadow
            src={cornerImages[2].src}
            alt={cornerImages[2].alt}
          />
          <ImageWithShadow
            src={cornerImages[3].src}
            alt={cornerImages[3].alt}
          />
        </div>
      </div>
    </div>
  );
}

export default LoadingPopup;
