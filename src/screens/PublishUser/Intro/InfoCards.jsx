import React from "react";

// Hàm rút gọn nội dung tự động
function truncateText(text, maxWords) {
  const words = text.split(" ");
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(" ") + "...";
  }
  return text;
}

// Dữ liệu thẻ thông tin
const infoCardsData = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/a090416236446ab673bd690fa7d01f0d960d8637a8d3283a03fb9ea3405a0bd7?placeholderIfAbsent=true&apiKey=e677dfd035d54dfb9bce1976069f6b0e",
    title: "Chuyên nghiệp",
    content: truncateText(
      "Chúng tôi xây dựng chương trình học bài bản, cập nhật công nghệ mới và kỹ năng thực tế giúp bạn sẵn sàng làm việc tại các công ty công nghệ hàng đầu."
      // 20
    ),
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/7dd99b103d1c6d1f37843a55b62a12eb53e88338eccfa590194d5a19e5b5c189?placeholderIfAbsent=true&apiKey=e677dfd035d54dfb9bce1976069f6b0e",
    title: "Uy tín",
    content: truncateText(
      "Được tin tưởng bởi hàng nghìn học viên và đối tác trong ngành IT, cam kết đào tạo chất lượng, hỗ trợ định hướng nghề nghiệp rõ ràng và minh bạch."
      // 20
    ),
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/34a9365c19398781429034df8caf6fc4fe68f1b9c3bc52a87dc16eb18cffc841?placeholderIfAbsent=true&apiKey=e677dfd035d54dfb9bce1976069f6b0e",
    title: "Sáng tạo",
    content: truncateText(
      "Chúng tôi khuyến khích tư duy sáng tạo trong học tập và lập trình, giúp học viên chủ động giải quyết vấn đề và xây dựng sản phẩm thực tế."
    ),
  },
];

// Component hiển thị từng thẻ thông tin
function InfoCard({ icon, title, content }) {
  return (
    <div className="p-[1.5rem] border-0 bg-white bg-opacity-10 backdrop-blur-[10px]">
      <div className="card-body m-[0.5rem]">
        <img
          src={icon}
          alt={title}
          className="mb-[20px]"
          style={{ width: "30px", height: "30px" }}
        />
        <h5 className="card-title fw-bold text-white text-[2rem] ">{title}</h5>
        <p className="text-white mt-[10px] text-[1.25rem] ">{content}</p>
      </div>
    </div>
  );
}

// Component InfoCards chính
function InfoCards() {
  return (
    <div className="mt-[80px] flex flex-wrap text-white ">
      {/* Container không có khoảng cách bên trái */}
      <div className="relative flex flex-wrap rounded-lg w-full mx-0">
        <div className="grid grid-cols-3 gap-5 w-full justify-center">
          {infoCardsData.map((card, index) => (
            <div key={index} className="flex-1 w-full">
              <InfoCard {...card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InfoCards;
