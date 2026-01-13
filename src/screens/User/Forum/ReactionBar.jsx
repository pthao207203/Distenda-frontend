import React, { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";

const ReactionBar = ({ myReaction, onReact, reactions }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const [hovered, setHovered] = useState(null);

  const userReaction = reactions.find((r) => r.type === myReaction);

  const handleReaction = (type) => {
    if (type === myReaction) {
      onReact(null);
    } else {
      onReact(type);
    }
    setShowReactions(false);
    setIsChoosing(false);
    setHovered(null);
  };

  return (
    <div
      className="relative flex justify-center"
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() =>
        setTimeout(() => {
          if (!isChoosing) setShowReactions(false);
        }, 200)
      }
    >
      {/* Nút Like */}
      <button
        className={`flex items-center gap-2 py-3 w-full justify-center transition text-[1.125rem] max-lg:text-[13px]
          ${userReaction ? " font-semibold" : "hover:bg-black"}`}
        style={userReaction ? { color: userReaction.color } : {}}
        onClick={() => {
          if (myReaction) {
            onReact(null);
          } else {
            onReact("like");
          }
        }}
      >
        {userReaction ? (
          <>
            <img
              src={userReaction.png}
              className="w-10 h-10 max-lg:w-[16px] max-lg:h-[16px]"
            />
            {userReaction.label} 
          </>
        ) : (
          <>
            <ThumbsUp size={20} />
            Thích
          </>
        )}
      </button>

      {/* Thanh chọn cảm xúc */}
      {(showReactions || isChoosing) && (
        <div
          className="absolute bottom-full mb-2 bg-[#2a2a2a] px-3 py-2 rounded-full flex flex-1 gap-3 shadow-xl z-50"
          onMouseEnter={() => setIsChoosing(true)}
          onMouseLeave={() =>
            setTimeout(() => {
              setIsChoosing(false);
              setShowReactions(false);
            }, 200)
          }
        >
          {reactions.map((r) => (
            <motion.button
              key={r.type}
              whileHover={{ scale: 1.2, y: -6 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => handleReaction(r.type)}
              onMouseEnter={() => setHovered(r.type)}
              onMouseLeave={() => setHovered(null)}
              className="flex flex-col items-center"
            >
              <img
                src={r.gif}
                className="w-12 h-12 max-lg:w-[24px] max-lg:h-[24px]"
              />
              {/* <span className="text-[10px] text-white opacity-80 w-full text-center">
                {r.label}
              </span> */}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReactionBar;
