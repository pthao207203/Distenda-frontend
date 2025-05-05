import React from "react";

const ChatSuggestion = ({ text }) => {
  return (
    <button className="inline-flex px-5 max-lg:mt-[8px] py-3 text-xl max-lg:text-[14px] leading-snug text-white rounded-[8px] border border-solid bg-black/50 border-white/30 hover:bg-white/10">
      {text}
    </button>
  );
};

export default ChatSuggestion;
