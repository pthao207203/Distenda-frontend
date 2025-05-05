import React from "react";
import SyncLoader from "react-spinners/SyncLoader";

const Loading = () => {
  return (
    <div className="flex flex-col self-center px-[30px] py-[20px] max-lg:px-[20px] max-lg:py-[15px] w-fit max-w-[90%] rounded-[8px] bg-neutral-900 text-white text-[1rem] max-lg:text-[14px] font-medium leading-tight text-center items-center shadow-md">
      {/* <MoonLoader color="#CFF500" size={80} className="hidden lg:block" /> */}
      <SyncLoader color="#CFF500" size={8} speedMultiplier={0.7} />
    </div>

    // <div className="flex items-center justify-center min-h-screen max-w-full bg-white bg-opacity-10 backdrop-blur-[10px] pb-8">
    //   <div className="flex flex-col items-center">
    //     <SyncLoader color="#CFF500" size={80} />
    //     {/* <p className="mt-4 text-xl text-[#CFF500]">Đang tải...</p> */}
    //   </div>
    // </div>
  );
};

export default Loading;
