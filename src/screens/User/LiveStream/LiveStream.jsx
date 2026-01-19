import { useState } from "react";
import LiveHeader from "./LiveHeader";
import LiveNow from "./LiveNow";
import LiveList from "./LiveList";
import LiveDone from "./LiveDone";
import LiveComment from "./LiveComment";
import "./LiveStream.css";



const liveNowList = [
  {
    id: 1,
    title: "Nhạc chill ngày",
    desc: "Thư giãn nhẹ nhàng",
    thumbnail: "https://i.imgur.com/LmK6Y8n.png",
  },
  {
    id: 2,
    title: "Học React cơ bản",
    desc: "Cho người mới bắt đầu",
    thumbnail: "https://i.imgur.com/LmK6Y8n.png",
  },
  {
    id: 3,
    title: "UI/UX Design",
    desc: "Thiết kế giao diện đẹp",
    thumbnail: "https://i.imgur.com/LmK6Y8n.png",
  },
  {
    id: 4,
    title: "Tailwind CSS",
    desc: "Tối ưu UI nhanh",
    thumbnail: "https://i.imgur.com/LmK6Y8n.png",
  },
  {
    id: 5,
    title: "JavaScript nâng cao",
    desc: "Hiểu sâu JS",
    thumbnail: "https://i.imgur.com/LmK6Y8n.png",
  },
  {
    id: 6,
    title: "Web animation",
    desc: "Hiệu ứng mượt",
    thumbnail: "https://i.imgur.com/LmK6Y8n.png",
  },
  {
    id: 7,
    title: "Thiết kế landing page",
    desc: "Chuyển đổi cao",
    thumbnail: "https://i.imgur.com/LmK6Y8n.png",
  },
  {
    id: 8,
    title: "Frontend roadmap",
    desc: "Lộ trình học FE",
    thumbnail: "https://i.imgur.com/LmK6Y8n.png",
  },
  {
    id: 9,
    title: "Next.js thực chiến",
    desc: "Build project thật",
    thumbnail: "https://i.imgur.com/LmK6Y8n.png",
  },
  {
    id: 10,
    title: "CSS Mastery",
    desc: "Nâng trình CSS",
    thumbnail: "https://i.imgur.com/LmK6Y8n.png",
  },
];

const liveDoneList = [
  {
    id: 101,
    title: "React cơ bản",
    desc: "Toàn bộ kiến thức nhập môn",
    thumbnail: "https://i.imgur.com/LmK6Y8n.png",
  },
  {
    id: 102,
    title: "Thiết kế UI với Tailwind",
    desc: "Xây dựng giao diện đẹp",
    thumbnail: "https://i.imgur.com/LmK6Y8n.png",
  },
];

const LiveStream = () => {
  const [tab, setTab] = useState("LiveNow");

  return (
    <div className="flex h-screen overflow-hidden-scroll bg-white bg-opacity-10 backdrop-blur-[10px] min-h-[calc(100vh-3.0125rem)] max-md:flex-col">
      
      {/* LEFT */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto overflow-hidden-scroll"> 
        <LiveHeader tab={tab} setTab={setTab} />

        <LiveNow />

        {/* 👉 LiveComment MOBILE (dưới LiveNow – trên LiveList) */}
        <div className="block md:hidden mt-5">
          <LiveComment />
        </div>

        {tab === "LiveNow" ? (
          <LiveList data={liveNowList} />
        ) : (
          <LiveDone data={liveDoneList} />
        )}
      </div>

      {/* RIGHT – LiveComment DESKTOP */}
      <aside className="hidden md:flex bg-black min-w-[320px] px-[1.5rem] py-[1.5rem]">
        <LiveComment />
      </aside>
    </div>
  );
};

export default LiveStream;
