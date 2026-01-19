import { useState, useEffect } from "react";
import LiveHeader from "./LiveHeader";
import LiveNow from "./LiveNow";
import LiveList from "./LiveList";
import LiveDone from "./LiveDone";
import LiveComment from "./LiveComment";
import "./LiveStream.css";

const LiveStream = () => {
  const [tab, setTab] = useState("LiveNow");

  return (
    <div className="flex h-screen overflow-hidden-scroll bg-white bg-opacity-10 backdrop-blur-[10px] min-h-[calc(100vh-3.0125rem)] max-md:flex-col">
      {/* LEFT */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto overflow-hidden-scroll">
        <LiveHeader tab={tab} setTab={setTab} />

        {/* <LiveNow /> */}

        {/* 👉 LiveComment MOBILE (dưới LiveNow – trên LiveList) */}
        {/* <div className="block md:hidden mt-5">
          <LiveComment />
        </div> */}

        {tab === "LiveNow" ? <LiveList /> : <LiveDone />}
      </div>

      {/* RIGHT – LiveComment DESKTOP */}
      {/* <aside className="hidden md:flex bg-black min-w-[320px] px-[1.5rem] py-[1.5rem]">
        <LiveComment />
      </aside> */}
    </div>
  );
};

export default LiveStream;
