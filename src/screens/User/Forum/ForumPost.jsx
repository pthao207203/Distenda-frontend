// src/components/ForumPost.jsx
import React from "react";
import {
  MessageCircle,
  Share2,
  FileText,
  Download,
  Edit2,
  SquarePen,
  Trash2,
} from "lucide-react";
import ReactionBar from "./ReactionBar";
import { getCurrentUser } from "../../../utils/getUser";
const formatDate = (date) => {
  if (!date) return "";

  const now = new Date();
  const postDate = new Date(date);
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 604800)} tuần trước`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;

  return postDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const ForumPost = ({
  post,
  onClick,
  onCommentClick,
  onReact,
  reactions,
  onEdit,
  onDelete,
  variant = "list",
}) => {
  const normalizeText = (v) =>
    typeof v === "string" && v !== "undefined" ? v : "";
  const postId = post._id || post.id;
  const postTitle = normalizeText(post.Title || post.title);
  const postContent = normalizeText(post.Content);
  const postImages = post.Images || post.images || []; // mảng nhiều ảnh
  const postFiles = post.Files || post.files || []; // mảng file đính kèm
  const postAuthor = post.Author || {};
  const authorName = postAuthor.name || "Ẩn danh";
  const authorAvatar = postAuthor.avatar || "https://i.pravatar.cc/150?img=68";
  const authorMember = postAuthor.member || postAuthor.role || "Thành viên";
  const postCreatedAt = post.createdAt || new Date().toISOString();

  const myReactionType = post.myReaction;
  const totalReactions = post.Reactions?.length || post.totalReactions || 0;
  const commentsCount = post.Comments?.length || post.commentsCount || 0;

  const reactionCounts = {};
  if (post.Reactions && Array.isArray(post.Reactions)) {
    post.Reactions.forEach((r) => {
      const type = r.Type || r.type;
      reactionCounts[type] = (reactionCounts[type] || 0) + 1;
    });
  }

  const isModal = variant === "modal";
  const currentUser = getCurrentUser();
  const isOwner = currentUser && postAuthor._id === currentUser.id;

  return (
    <article
      className={`p-4 w-full text-white bg-white/20 bg-opacity-10 backdrop-blur-[60px] max-md:max-w-full mb-8 ${
        isModal ? "rounded-t-2xl" : ""
      }`}
    >
      <div className="flex justify-end px-4 gap-2">
        {/* Chỉ hiển thị nút Sửa và Xóa nếu là chủ bài viết */}
        {isOwner && (
          <>
            <button
              onClick={() => onEdit(post)}
              className="text-white/80 hover:text-white flex items-center gap-1 mt-2 text-[1.125rem] max-lg:text-[13px] transition-colors"
            >
              <SquarePen size={16} />
              Sửa
            </button>
            <button
              onClick={() => onDelete(post)}
              className="text-white/80 hover:text-red-400 flex items-center gap-1 mt-2 text-[1.125rem] max-lg:text-[13px] transition-colors"
            >
              <Trash2 size={16} />
              Xóa
            </button>
          </>
        )}
      </div>
      {/* Header */}
      <div className="p-4 pb-2 flex justify-between">
        <div className="flex gap-3 text-white">
          <img
            src={authorAvatar}
            alt={authorName}
            className="object-cover shrink-0 my-auto w-20 h-20 max-lg:w-16 max-lg:h-16 rounded-full"
            onError={(e) => (e.target.src = "https://i.pravatar.cc/150?img=68")}
          />
          <div className="flex flex-col justify-center gap-1 items-start w-full text-xl">
            <h3 className="font-semibold text-white text-[1.25rem] max-lg:text-[16px]">
              {authorName}
            </h3>
            <div className="flex items-center">
              <p className="flex self-stretch my-auto text-[1rem] max-lg:text-[12px] mr-2">
                {authorMember}
              </p>
              <div className="rounded-full w-1 h-1 bg-white mr-1"></div>
              <p className="flex self-stretch my-auto text-[1rem] max-lg:text-[12px]">
                {formatDate(postCreatedAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 shrink items-end self-start justify-center text-[1.25rem] max-lg:text-[14px] font-semibold max-md:max-w-full">
          <span>#{postId?.slice(-6).toUpperCase() || "0000"}</span>
          <h2>{postTitle}</h2>
        </div>
      </div>

      {/* Nội dung + Media */}
      <div className="flex flex-col w-full text-[1.25rem] max-lg:text-[14px] px-4 pb-3 gap-4 max-md:max-w-full">
        <div className="text-gray-200 whitespace-pre-line">{postContent}</div>

        {/* Hiển thị nhiều ảnh */}
        {postImages?.length > 0 && (
          <div
            className={`grid gap-2 ${
              postImages.length === 1
                ? "grid-cols-1"
                : postImages.length <= 4
                  ? "grid-cols-2"
                  : "grid-cols-2 sm:grid-cols-3"
            }`}
          >
            {postImages.map((img, index) => (
              <div
                key={index}
                className="relative overflow-hidden bg-black/30 aspect-video cursor-pointer"
                onClick={!isModal ? onClick : undefined}
              >
                <img
                  src={img.url || img}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-contain hover:opacity-90 transition-opacity"
                  onError={(e) => (e.target.style.display = "none")}
                />
                {postImages.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
                    +{postImages.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Hiển thị file đính kèm */}
        {postFiles?.length > 0 && (
          <div className="mt-2">
            <p className="text-gray-300 text-[1.1rem] mb-2 font-medium">
              Đính kèm ({postFiles.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {postFiles.map((file, index) => (
                <a
                  key={index}
                  href={file.url || file} // link tải file
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/15 rounded-lg transition-colors group"
                  download
                >
                  <div className="p-3 bg-white/10 rounded-lg">
                    <FileText size={24} className="text-[#CFF500]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white truncate font-medium">
                      {file.name || `File ${index + 1}`}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {file.size
                        ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                        : ""}
                    </p>
                  </div>
                  <Download
                    size={20}
                    className="text-gray-400 group-hover:text-[#CFF500] transition-colors"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary - Reactions & Comments */}
      <div className="px-4 pb-2 text-[1.25rem] max-lg:text-[13px] text-white/80 font-medium flex justify-between items-center mt-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center -space-x-2">
            {reactions
              .map((reaction) => ({
                ...reaction,
                count: reactionCounts[reaction.type] || 0,
              }))
              .filter((r) => r.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((reaction) => (
                <img
                  key={reaction.type}
                  src={reaction.png}
                  alt={reaction.label}
                  className="w-10 h-10 max-lg:w-5 max-lg:h-5 rounded-full border-2 border-white/20 bg-opacity-10"
                  title={`${reaction.label}: ${reaction.count}`}
                />
              ))}
          </div>
          {totalReactions > 0 && (
            <span className="text-white/80">{totalReactions}</span>
          )}
        </div>
        <span>{commentsCount} bình luận</span>
      </div>

      {/* Action bar */}
      <div className="grid grid-cols-3 border-t border-gray-800 text-center text-gray-300 text-[1.125rem] max-lg:text-[13px]">
        <ReactionBar
          postId={postId}
          myReaction={myReactionType}
          totalReactions={totalReactions}
          onReact={onReact}
          reactions={reactions}
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
