import React from 'react';

// Component để hiển thị hình ảnh với bóng đổ
function ImageWithShadow({ src, alt }) {
    return (
        <img
            loading="lazy"
            src={src}
            alt={alt}
            className="object-contain shrink-0 bg-none w-[3.75rem]"
        />
    );
}

function PopupImage({ onClose, content }) {
    const [isOpen, setIsOpen] = React.useState(true); // Trạng thái popup

    // Hàm đóng popup
    const handleClose = (e) => {
        // Kiểm tra nếu người dùng click vào nền đen hoặc icon đóng
        if (e.target === e.currentTarget) {
            setIsOpen(false);
            onClose && onClose(); // Đảm bảo gọi onClose từ cha nếu có
        }
    };
    if (!isOpen) return null;

    return (
        <div
            className="fixed top-0 object-contain inset-0 z-50 bg-none h-screen w-screen"
            onClick={handleClose}
        >
            <div className="flex flex-col justify-center max-w-full h-full bg-black bg-opacity-50 backdrop-blur-[60px]  p-[20px] ">
                <div className="">
                    <button className="w-full h-[20px]">
                        
                        <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/8bbfb14016c67d4716e0a6366eed76fac938e5a78f6cba88c3ed041abcc52d72?placeholderIfAbsent=true&apiKey=e677dfd035d54dfb9bce1976069f6b0e"
                            className="absolute top-[20px] right-[40px] w-[20px] h-[20px] object-contain z-50"
                            alt="Close icon"
                            onClick={handleClose} // Gọi hàm handleClose khi click vào icon
                        />
                    </button>
                </div>

                {/* Nội dung chính của popup chỉ hiển thị ảnh */}
                <div className="justify-center self-center items-center  max-h-screen">
                    <img
                        loading="lazy"
                        src={content || ""}
                        alt="Image"
                        className="self-center items-center object-cover"
                        style={{
                            objectFit: 'contain', // Dùng 'contain' để giữ tỷ lệ
                            width: '100%', // Đặt chiều rộng là 100% của container
                            height: '100%', // Tự động tính chiều cao theo tỷ lệ
                            boxShadow: '2px 2px 100px rgba(255, 255, 255, 0.3)',
                        }}
                    />
                </div>
        
            </div>
        </div>
    );
}

export default PopupImage;
