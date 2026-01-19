// src/pages/Forum.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Send, X } from "lucide-react";
import SearchBar from "../../PublishUser/Course/SearchBar";
import Subject from "./Subject";
import ForumPost from "./ForumPost";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getUserAvatar } from "../../../utils/getUser";

import {
  getNewestPostsController,
  getDetailPostController,
  getMyPostsController,
  reactToPostController,
  addCommentController,
  addReplyController,
  createPostController,
} from "../../../controllers/forum.controller";
import LoadingPopup from "../../../components/LoadingPopup";

const reactions = [
  {
    type: "like",
    label: "Thích",
    gif: "/Icon/like.gif",
    png: "/Icon/like.png",
    color: "#0866ff",
  },
  {
    type: "love",
    label: "Yêu thích",
    gif: "/Icon/love.gif",
    png: "/Icon/love.png",
    color: "#f91880",
  },
  {
    type: "haha",
    label: "Haha",
    gif: "/Icon/haha.gif",
    png: "/Icon/haha.png",
    color: "#f7b125",
  },
  {
    type: "wow",
    label: "Wow",
    gif: "/Icon/wow.gif",
    png: "/Icon/wow.png",
    color: "#f7b125",
  },
  {
    type: "sad",
    label: "Buồn",
    gif: "/Icon/sad.gif",
    png: "/Icon/sad.png",
    color: "#f7b125",
  },
  {
    type: "angry",
    label: "Phẫn nộ",
    gif: "/Icon/angry.gif",
    png: "/Icon/angry.png",
    color: "#e4602f",
  },
];

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [activeTab, setActiveTab] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [previewImages, setPreviewImages] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const selectedPost = posts.find(
    (p) => p.id === selectedPostId || p._id === selectedPostId
  );

  // Fetch posts theo tab
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === "newest") {
        await getNewestPostsController(
          (data) => {
            console.log("Newest posts:", data);
            // Normalize data: convert _id to id nếu cần
            const normalized = Array.isArray(data) ? data : [];
            setPosts(normalized);
          },
          (err) => {
            console.error("Error fetching posts:", err);
            setError(err || "Không tải được bài viết mới nhất");
          },
          setLoading
        );
      } else if (activeTab === "your-posts") {
        await getMyPostsController(
          (data) => {
            console.log("My posts:", data);
            const normalized = Array.isArray(data) ? data : [];
            setPosts(normalized);
          },
          (err) => {
            console.error("Error fetching my posts:", err);
            setError(err || "Không tải được bài viết của bạn");
          },
          setLoading
        );
      }
    } catch (err) {
      console.error("Catch error:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Load posts khi mount + khi đổi tab
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Load chi tiết khi mở modal
  useEffect(() => {
    if (selectedPostId) {
      getDetailPostController(
        selectedPostId,
        (data) => {
          // Tìm và cập nhật post trong list
          setPosts((prev) =>
            prev.map((p) =>
              p.id === selectedPostId || p._id === selectedPostId ? data : p
            )
          );
        },
        (err) => {
          console.error("Error fetching post detail:", err);
          setError(err || "Không tải được chi tiết bài viết");
        },
        () => {}
      );
    }
  }, [selectedPostId]);

  // Ngăn scroll
  useEffect(() => {
    if (selectedPost || showCreateModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPost, showCreateModal]);

  // Xử lý upload ảnh (nhiều ảnh)
  const handleImageUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Giới hạn 10 ảnh
    if (selectedFiles.length + imageFiles.length > 10) {
      alert("Tối đa 10 ảnh!");
      return;
    }

    // Preview
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews]);

    // Lưu file thật
    setImageFiles((prev) => [...prev, ...selectedFiles]);
  };

  // Xử lý upload file
  const handleFileUpload = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length + attachedFiles.length > 5) {
      alert("Tối đa 5 file!");
      return;
    }
    setAttachedFiles((prev) => [...prev, ...selected]);
  };

  // Xóa ảnh
  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Xóa file
  const removeFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Gửi bài viết mới
  const handleCreatePost = async () => {
    if (
      !newPostTitle.trim() &&
      !newPostContent.trim() &&
      imageFiles.length === 0 &&
      attachedFiles.length === 0
    ) {
      return;
    }

    setLoadingCreate(true);

    try {
      const formData = new FormData();
      formData.append("Title", newPostTitle);
      formData.append("Content", newPostContent);

      // Gửi nhiều ảnh
      imageFiles.forEach((file) => {
        formData.append("Images", file);
      });

      // Gửi nhiều file
      attachedFiles.forEach((file) => {
        formData.append("Files", file);
      });

      await createPostController(
        formData,
        () => {
          // Reset
          setShowCreateModal(false);
          setNewPostTitle("");
          setNewPostContent("");
          setImageFiles([]);
          setPreviewImages([]);
          setAttachedFiles([]);
          fetchPosts();
          alert("Đăng bài thành công!");
        },
        (err) => alert(err || "Không thể tạo bài viết")
      );
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    } finally {
      setLoadingCreate(false);
    }
  };

  // Escape đóng modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedPostId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Xử lý reaction
  const handleReact = (postId, type) => {
    reactToPostController(
      postId,
      type,
      (updatedPost) => {
        console.log("Reaction updated:", updatedPost);
        // Cập nhật list
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId || p._id === postId
              ? { ...p, myReaction: type, Reactions: updatedPost.Reactions }
              : p
          )
        );
      },
      (err) => {
        console.error("Error reacting:", err);
        setError(err || "Không thể thực hiện reaction");
      }
    );
  };

  // Thêm comment
  const handleAddComment = (postId) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    addCommentController(
      postId,
      content,
      (post) => {
        console.log("Comment added:", post);

        // Reload post detail để lấy comments đầy đủ
        getDetailPostController(
          postId,
          (detailedPost) => {
            console.log("Reloaded post with full comments:", detailedPost);
            // Cập nhật list với post đầy đủ thông tin
            setPosts((prev) =>
              prev.map((p) =>
                p._id === postId
                  ? {
                      ...p,
                      Comments: detailedPost.Comments,
                      commentsCount: detailedPost.Comments?.length || 0,
                    }
                  : p
              )
            );
          },
          (err) => console.error("Error reloading post:", err),
          () => {}
        );

        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      },
      (err) => {
        console.error("Error adding comment:", err);
        setError(err || "Không thể gửi bình luận");
      }
    );
  };

  // Thêm reply
  const handleAddReply = (postId, commentId) => {
    const content = replyInputs[commentId]?.trim();
    if (!content) return;

    addReplyController(
      postId,
      commentId,
      content,
      (updatedPost) => {
        // updatedPost là post sau khi add reply
        console.log("Reply added:", updatedPost);

        // Reload chi tiết để lấy đầy đủ
        getDetailPostController(
          postId,
          (detailedPost) => {
            console.log("Reloaded post with full data:", detailedPost);

            // THAY THẾ TOÀN BỘ POST trong list bằng detailedPost mới nhất
            setPosts((prev) =>
              prev.map((p) =>
                p._id === postId || p.id === postId ? detailedPost : p
              )
            );
          },
          (err) => console.error("Error reloading post:", err),
          () => {}
        );

        setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
      },
      (err) => {
        console.error("Error adding reply:", err);
        setError(err || "Không thể gửi trả lời");
      }
    );
  };

  const formatDate = (date) => {
    if (!date) return "";

    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    }
    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} tuần trước`;
    }
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} tháng trước`;
    }

    return postDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const myAvatar = getUserAvatar();

  return (
    <div className="flex overflow-hidden relative flex-wrap grow gap-4 justify-center w-full bg-opacity-10 backdrop-blur-[10px] max-md:mt-1.5">
      <div className="flex overflow-hidden relative flex-wrap grow justify-center w-full bg-white bg-opacity-10 max-md:mt-1.5">
        <div className="flex-1 shrink pt-12 pr-14 pb-2.5 pl-14 basis-0 min-w-60 max-md:px-5 max-md:max-w-full">
          <SearchBar placeholder="Tìm kiếm bài viết" />
          <header className="flex flex-wrap gap-8 justify-center items-center mt-3 pl-4 w-full text-[1.25rem] max-lg:text-[14px] max-md:max-w-full mb-10">
            <div className="flex flex-wrap flex-1 shrink gap-4 items-center self-stretch my-auto text-white basis-6 min-w-60 max-md:max-w-full">
              <button
                onClick={() => {
                  setActiveTab("newest");
                  setSelectedPostId(null);
                }}
                className={`flex gap-2.5 justify-center items-center self-stretch p-2.5 my-auto ${
                  activeTab === "newest"
                    ? "font-semibold border-b-2 border-white"
                    : "font-light"
                }`}
                aria-current={activeTab === "newest" ? "page" : undefined}
              >
                <span className="self-stretch my-auto">Mới nhất</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("your-posts");
                  setSelectedPostId(null);
                }}
                className={`flex gap-2.5 justify-center items-center self-stretch p-2.5 my-auto ${
                  activeTab === "your-posts"
                    ? "font-semibold border-b-2 border-white"
                    : "font-light"
                }`}
                aria-current={activeTab === "your-posts" ? "page" : undefined}
              >
                <span className="self-stretch my-auto">Bài đăng của bạn</span>
              </button>
            </div>
            <button
              className="flex gap-10 justify-center items-center px-3 py-3 mt-0 text-[1.25rem] max-lg:text-[14px] font-medium  text-[#131313] bg-[#CFF500]"
              onClick={() => setShowCreateModal(true)}
            >
              <div className="flex gap-2.5 justify-center items-center self-stretch my-auto">
                <span className="self-stretch my-auto">Thêm bài đăng</span>
              </div>
            </button>
          </header>

          {loading && createPortal(<LoadingPopup />, document.body)}

          {error && !loading && (
            <div className="text-center py-12 text-red-400 text-lg">
              {error}
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-[1.25rem] max-lg:text-[14px]">
              Chưa có bài viết nào{activeTab === "your-posts" ? " của bạn" : ""}
              .
            </div>
          )}

          {/* Danh sách bài viết - không hiển thị comment */}
          {!loading &&
            posts.map((post) => (
              <ForumPost
                key={post._id || post.id}
                post={post}
                reactions={reactions}
                variant="list"
                onClick={() => setSelectedPostId(post._id || post.id)}
                onCommentClick={(e) => {
                  e.stopPropagation();
                  setSelectedPostId(post._id || post.id);
                }}
                onReact={(type) => handleReact(post._id, type)}
              />
            ))}
        </div>
        <div className="max-w-full flex h-full top-0 self-start max-md:hidden">
          <Subject />
        </div>
        {/* Modal bình luận */}

        {selectedPost &&
          createPortal(
            <AnimatePresence>
              <motion.div
                className="fixed rounded-2xl inset-0 z-50 flex justify-center items-center pt-2 bg-black/50 backdrop-blur-[1px]"
                onClick={() => setSelectedPostId(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="bg-[#1e1e1e] rounded-2xl w-[65%] max-lg:w-[90%] max-h-[90vh] flex flex-col mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Nút đóng */}
                  <button
                    className="absolute top-4 right-5 z-10 bg-black/20 p-2 rounded-full text-white/50 hover:text-white"
                    onClick={() => setSelectedPostId(null)}
                  >
                    <X size={24} />
                  </button>

                  <div className="flex-1 overflow-y-auto rounded-t-2xl">
                    {/* Nội dung bài viết */}
                    <ForumPost
                      post={selectedPost}
                      reactions={reactions}
                      variant="modal"
                      onReact={(type) =>
                        handleReact(selectedPost._id || selectedPost.id, type)
                      }
                    />

                    {/* Phần bình luận */}
                    <div className="mt-8 border-t border-white/10 pt-6 px-4">
                      {(selectedPost.Comments || []).map((comment) => (
                        <div key={comment._id || comment.id} className="mb-6">
                          <div className="flex gap-3">
                            <img
                              src={
                                comment.Author?.avatar ||
                                "https://cdn.builder.io/api/v1/image/assets/TEMP/bbae0514e8058efa2ff3c88f32951fbd7beba3099187677c6ba1c2f96547ea3f?placeholderIfAbsent=true&apiKey=e677dfd035d54dfb9bce1976069f6b0e"
                              }
                              alt=""
                              className="w-10 h-10 max-lg:w-20 max-lg:h-20 rounded-full"
                              onError={(e) => {
                                e.target.src =
                                  "https://cdn.builder.io/api/v1/image/assets/TEMP/bbae0514e8058efa2ff3c88f32951fbd7beba3099187677c6ba1c2f96547ea3f?placeholderIfAbsent=true&apiKey=e677dfd035d54dfb9bce1976069f6b0e";
                              }}
                            />
                            <div className="flex-1">
                              <div className="bg-[#2a2a2a] rounded-2xl px-4 py-3">
                                <span className="font-medium text-white block text-[1.125rem] max-lg:text-[16px] mb-3">
                                  {comment.Author?.name || "Ẩn danh"}
                                </span>
                                <p className="text-gray-200 text-base max-lg:text-[14px] leading-snug">
                                  {comment.Content}
                                </p>
                              </div>
                              <div className="text-[0.875rem] max-lg:text-[11px] text-gray-500 mt-1 flex gap-4">
                                <span>{formatDate(comment.createdAt)}</span>
                                <button className="hover:underline">
                                  Thích
                                </button>
                                <button className="hover:underline">
                                  Trả lời
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Replies */}
                          {(comment.Replies || []).map((reply) => (
                            <div
                              key={reply._id || reply.id}
                              className="flex gap-3 mt-4 ml-12"
                            >
                              <img
                                src={
                                  reply.Author?.UserAvatar ||
                                  "https://cdn.builder.io/api/v1/image/assets/TEMP/bbae0514e8058efa2ff3c88f32951fbd7beba3099187677c6ba1c2f96547ea3f?placeholderIfAbsent=true&apiKey=e677dfd035d54dfb9bce1976069f6b0e"
                                }
                                alt=""
                                className="w-8 h-8 max-lg:w-16 max-lg:h-16 rounded-full"
                                onError={(e) => {
                                  e.target.src =
                                    "https://cdn.builder.io/api/v1/image/assets/TEMP/bbae0514e8058efa2ff3c88f32951fbd7beba3099187677c6ba1c2f96547ea3f?placeholderIfAbsent=true&apiKey=e677dfd035d54dfb9bce1976069f6b0e";
                                }}
                              />
                              <div className="flex-1 bg-[#2a2a2a] rounded-2xl px-4 py-2">
                                <span className="flex font-medium text-white text-[1.125rem] max-lg:text-[16px] mb-3">
                                  {reply.Author?.UserFullName || "Ẩn danh"}
                                </span>
                                <p className="text-gray-200 text-base max-lg:text-[14px] leading-snug">
                                  {reply.Content}
                                </p>
                                <div className="text-[0.875rem] max-lg:text-[11px] text-gray-500 mt-1">
                                  {formatDate(reply.createdAt)}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Input reply */}
                          <div className="flex gap-3 mt-3 ml-12">
                            <img
                              src={myAvatar}
                              alt="avatar"
                              className="w-8 h-8 max-lg:w-16 max-lg:h-16 rounded-full"
                            />
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                placeholder="Trả lời bình luận..."
                                className="w-full bg-[#2a2a2a] text-[1.125rem] max-lg:text-[14px] leading-snug rounded-full px-4 py-2 pr-12 text-gray-200 placeholder-gray-500 outline-none border-none"
                                value={
                                  replyInputs[comment._id || comment.id] || ""
                                }
                                onChange={(e) =>
                                  setReplyInputs((prev) => ({
                                    ...prev,
                                    [comment._id || comment.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddReply(
                                      selectedPost._id || selectedPost.id,
                                      comment._id || comment.id
                                    );
                                  }
                                }}
                              />
                              <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                                onClick={() =>
                                  handleAddReply(
                                    selectedPost._id || selectedPost.id,
                                    comment._id || comment.id
                                  )
                                }
                              >
                                <Send size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Input comment chính */}
                  <div className="flex gap-3 border-t border-white/10 px-4 py-4 text-[1.125rem] max-lg:text-[14px] leading-snug">
                    <img
                      src={myAvatar}
                      alt="avatar"
                      className="w-10 h-10 max-lg:w-20 max-lg:h-20 rounded-full"
                    />
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Viết bình luận công khai..."
                        className="w-full bg-[#2a2a2a] rounded-full px-5 py-3 pr-14 text-gray-200 placeholder-gray-500 outline-none border-none"
                        value={commentInputs[selectedPost._id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [selectedPost._id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(selectedPost._id);
                          }
                        }}
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
                        onClick={() => handleAddComment(selectedPost._id)}
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>,
            document.body
          )}
        {/* Modal tạo bài viết mới */}
        {showCreateModal &&
          createPortal(
            <AnimatePresence>
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateModal(false)}
              >
                <motion.div
                  className="bg-[#1e1e1e] w-[65%] max-lg:w-[90%] max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl mx-4 flex flex-col"
                  initial={{ scale: 0.9, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 50 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#2a2a2a]">
                    <h2 className="text-2xl font-bold text-white">
                      Tạo bài viết
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-white/70 hover:text-white transition"
                    >
                      <X size={28} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 overflow-y-auto flex-1">
                    {/* Avatar + Tên user */}
                    <div className="flex items-center gap-3 mb-6">
                      <img
                        src={myAvatar}
                        alt="Avatar"
                        className="w-20 h-20 max-lg:w-24 max-lg:h-24 rounded-full object-cover border-2 border-white/20"
                      />
                      <div className="flex flex-col gap-2">
                        <p className="font-medium text-white text-[1.5rem] max-lg:text-[16px]">
                          Vy Đỗ
                        </p>
                        <div className="flex items-center gap-1 text-sm text-white/80 bg-white/20 px-3 py-2 rounded-md">
                          <span className="text-[1.125rem] max-lg:text-[12rem]">
                            Công khai
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tiêu đề */}
                    <input
                      type="text"
                      placeholder="Tiêu đề bài viết..."
                      className="w-full bg-transparent text-white text-2xl font-bold outline-none placeholder-gray-500 mb-4 border-b border-white/20 pb-2"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                    />

                    {/* Nội dung */}
                    <textarea
                      placeholder="Vy ơi, bạn đang nghĩ gì thế?"
                      className="w-full bg-transparent text-gray-200 text-lg outline-none resize-none min-h-[120px] mb-6 placeholder-gray-500"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    />

                    {/* Preview ảnh */}
                    {previewImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                        {previewImages.map((url, index) => (
                          <div
                            key={index}
                            className="relative rounded-lg overflow-hidden group"
                          >
                            <img
                              src={url}
                              alt="Preview"
                              className="w-full h-40 object-cover"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-black/20 text-white p-1 rounded-full hover:bg-black/70 transition"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Preview file */}
                    {previewFiles.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-400 mb-2">
                          File đính kèm:
                        </p>
                        <ul className="space-y-2">
                          {previewFiles.map((file, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between bg-white/10 p-3 rounded-lg"
                            >
                              <span className="text-gray-300 truncate flex-1">
                                {file.name}
                              </span>
                              <button
                                onClick={() => removeFile(index)}
                                className="text-red-400 hover:text-red-300 ml-2"
                              >
                                <X size={18} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-white/10 bg-[#2a2a2a] flex justify-between items-center">
                    {/* Upload buttons */}
                    <div className="flex gap-6">
                      <label className="cursor-pointer flex items-center gap-2 text-gray-300 hover:text-white transition">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={handleImageUpload}
                        />
                        <span className="text-lg">Ảnh</span>
                      </label>

                      <label className="cursor-pointer flex items-center gap-2 text-gray-300 hover:text-white transition">
                        <input type="file" hidden onChange={handleFileUpload} />
                        <span className="text-lg">File</span>
                      </label>
                    </div>

                    {/* Nút đăng */}
                    <button
                      onClick={handleCreatePost}
                      disabled={
                        loadingCreate ||
                        (!newPostTitle.trim() &&
                          !newPostContent.trim() &&
                          previewImages.length === 0 &&
                          previewFiles.length === 0)
                      }
                      className="px-8 py-3 bg-[#CFF500] text-black text-[1.25rem] max-lg:text-[14px] font-semibold  disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d4ff00] transition"
                    >
                      {loadingCreate ? "Đang đăng..." : "Đăng"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>,
            document.body
          )}
      </div>
    </div>
  );
};

export default Forum;
