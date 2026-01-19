import React, { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";

const LivestreamReactionBar = ({
  myReaction,
  onReact,
  totalReactions,
  reactions,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);

  const userReaction = reactions.find((r) => r.type === myReaction);

  const handleReaction = (type) => {
    if (type === myReaction) {
      onReact(null);
    } else {
      onReact(type);
    }
    setShowReactions(false);
    setIsChoosing(false);
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
        type="button"
        className={`flex items-center gap-2 py-3 justify-center transition max-md:text-[14px] md:text-[1.125rem]
          ${userReaction ? "font-semibold" : "hover:opacity-80"}`}
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
              className="w-8 h-8 max-lg:w-[16px] max-lg:h-[16px] object-contain"
              alt={userReaction.label}
            />
            {totalReactions}
          </>
        ) : (
          <>
            <ThumbsUp size={20} />
            {totalReactions}
          </>
        )}
      </button>

      {/* Thanh chọn cảm xúc */}
      {(showReactions || isChoosing) && (
        <div
          className="absolute w-[200px] bottom-full mb-2 bg-[#2a2a2a] rounded-full flex gap-3 shadow-lg z-50 px-2.5 py-2.5 border border-gray-600 items-center justify-center whitespace-nowrap"
          onMouseEnter={() => setIsChoosing(true)}
          onMouseLeave={() =>
            setTimeout(() => {
              setIsChoosing(false);
              setShowReactions(false);
            }, 200)
          }
        >
          {reactions && reactions.length > 0 ? (
            reactions.map((r) => (
              <motion.button
                key={r.type}
                type="button"
                whileHover={{ scale: 1.2, y: -8 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                onClick={() => handleReaction(r.type)}
                className="flex items-center justify-center flex-shrink-0 transition-all"
                title={r.label}
              >
                <img
                  src={r.gif}
                  alt={r.label}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    console.error(`Không tải được ảnh: ${r.gif}`, e);
                    e.target.src = r.png;
                  }}
                />
              </motion.button>
            ))
          ) : (
            <div className="text-gray-400 text-sm">Không có reaction nào</div>
          )}
        </div>
      )}
    </div>
  );
};

export default LivestreamReactionBar;
