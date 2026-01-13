// src/components/ForumPost.jsx
import React from "react";
import { MessageCircle, Share2, MoreHorizontal, ThumbsUp } from "lucide-react";
import ReactionBar from "./ReactionBar";

const ForumPost = ({
  post,
  onClick,
  onCommentClick,
  onReact,
  reactions,
  variant = "list",
}) => {
  const userReaction = reactions.find((r) => r.type === post?.myReaction);
  const isModal = variant === "modal";
  return (
    <article className="p-4 w-full text-white bg-white/20 bg-opacity-10 backdrop-blur-[60px] max-md:max-w-full mb-8">
      {/* Header */}
      <div className="p-4 pb-2 flex justify-between">
        <div className="flex gap-3 text-white">
          <img
            src={post.author.avatar}
            alt=""
            className="object-contain shrink-0 my-auto w-20 max-lg:w-32 rounded-full"
          />
          <div className="flex flex-col justify-center gap-3 items-start w-full text-xl">
            <h3 className="font-semibold text-white text-[1.25rem] max-lg:text-[16px]">
              {post.author.name}
            </h3>
            <p className="flex self-stretch my-auto text-[1rem] max-lg:text-[12px]">
              {post.author.member} · {post.time}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 shrink items-end self-start justify-center text-[1.25rem] max-lg:text-[14px] font-semibold max-md:max-w-full">
          <span>#3578</span>
          <h2 className="">Tìm khóa học của cô Trần Thảo</h2>
        </div>
      </div>

      {/* Nội dung */}
      <div className="flex flex-col w-full text-[1.25rem] max-lg:text-[14px] px-4 pb-3 gap-3 max-md:max-w-full">
        <div className=" text-gray-200 whitespace-pre-line">{post.content}</div>
        <img
          src={post.image}
          alt="Post content"
          onClick={!isModal ? onClick : undefined}
          className={`object-contain flex-1 w-full aspect-[2.48] max-md:max-w-full ${
            isModal ? "" : "cursor-pointer"
          }`}
        />
      </div>

      {/* Summary */}
      <div className="px-4 pb-2 text-[1.125rem] max-lg:text-[13px] text-white flex justify-between mt-1">
        <div className="flex items-center gap-2">
          {post?.myReaction && (
            <img
              src={userReaction?.png}
              alt=""
              className="w-8 h-8 max-lg:w-[14px] max-lg:h-[14px]"
            />
          )}
          <span>{post.totalReactions.toLocaleString()}</span>
        </div>
        <span>{post.commentsCount} bình luận</span>
      </div>

      {/* Action bar */}
      <div className="grid grid-cols-3 border-t border-gray-800 text-center text-gray-300 text-[1.125rem] max-lg:text-[13px]">
        <ReactionBar
          postId={post.id}
          myReaction={post.myReaction}
          totalReactions={post.totalReactions}
          onReact={onReact}
          reactions={reactions} // Truyền reactions vào nếu ReactionBar cần
        />
        <button
          className="py-3 hover:bg-black flex items-center justify-center gap-2"
          onClick={onCommentClick}
        >
          <MessageCircle size={20} />
          Bình luận
        </button>
        <button className="py-3 hover:bg-black flex items-center justify-center gap-2">
          <Share2 size={20} />
          Chia sẻ
        </button>
      </div>
    </article>
  );
};

export default ForumPost;
