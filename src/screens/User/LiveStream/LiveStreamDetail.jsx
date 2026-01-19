import { useState, useEffect } from "react";
import LiveHeader from "./LiveHeader";
import LiveNow from "./LiveNow";
import LiveList from "./LiveList";
import LiveDone from "./LiveDone";
import LiveComment from "./LiveComment";
import "./LiveStream.css";

const LiveStream = () => {
  const [livestreamId, setLivestreamId] = useState(null);

  // Lấy livestreamId từ URL params hoặc pathname
  useEffect(() => {
    console.log("Current URL:", window.location.href);
    console.log("Current pathname:", window.location.pathname);

    // Cách 1: Từ query params
    const params = new URLSearchParams(window.location.search);
    let id = params.get("id");

    // Cách 2: Từ pathname (e.g., /livestream/123)
    if (!id) {
      const pathParts = window.location.pathname.split("/");
      id = pathParts[pathParts.length - 1];
    }

    console.log("Extracted livestreamId:", id);
    setLivestreamId(id);
  }, []);

  return (
    <div className="flex overflow-hidden-scroll bg-white bg-opacity-10 backdrop-blur-[10px] max-md:flex-col">
      {/* LEFT */}
      <div className="p-6 space-y-6 flex-1 min-w-0 min-h-[400px]">
        {/* <LiveHeader tab={tab} setTab={setTab} /> */}

        <LiveNow />

        {/* 👉 LiveComment MOBILE (dưới LiveNow – trên LiveList) */}
        <div className="block md:hidden mt-5">
          {livestreamId ? (
            <LiveComment livestreamId={livestreamId} trackViewers={false} />
          ) : (
            <div className="text-white text-center py-4">
              Đang tải livestream...
            </div>
          )}
        </div>
      </div>

      {/* RIGHT – LiveComment DESKTOP */}
      <aside className="hidden md:flex bg-black min-w-[320px] max-w-[400px] px-[1.5rem] py-[1.5rem]">
        {livestreamId ? (
          <LiveComment livestreamId={livestreamId} trackViewers={false} />
        ) : (
          <div className="text-white text-center py-4">
            Đang tải livestream...
          </div>
        )}
      </aside>
    </div>
  );
};

export default LiveStream;
