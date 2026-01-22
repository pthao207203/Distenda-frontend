// src/pages/Forum.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Send, X } from "lucide-react";
import SearchBar from "../../PublishUser/Course/SearchBar";
import Subject from "./Subject";
import ForumPost from "./ForumPost";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getUserAvatar } from "../../../utils/getUser";

import {
  getNewestPostsController,
  getDetailPostController,
  getMyPostsController,
  reactToPostController,
  addCommentController,
  addReplyController,
  createPostController,
  updatePostController,
  deletePostController,
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
  // Thêm state cho modal edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null); // Post đang edit

  // Thêm state cho filter status ở tab your-posts
  const [statusFilter, setStatusFilter] = useState("all"); // all, approved, pending, rejected
  const selectedPost = posts.find(
    (p) => p.id === selectedPostId || p._id === selectedPostId,
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
          setLoading,
        );
      } else if (activeTab === "your-posts") {
        await getMyPostsController(
          (data) => {
            const normalized = Array.isArray(data) ? data : [];
            setPosts(normalized);
          },
          (err) => {
            console.error("Error fetching my posts:", err);
            setError(err || "Không tải được bài viết của bạn");
          },
          setLoading,
          statusFilter === "all" ? null : statusFilter,
        );
      }
    } catch (err) {
      console.error("Catch error:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter]);

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
              p.id === selectedPostId || p._id === selectedPostId ? data : p,
            ),
          );
        },
        (err) => {
          console.error("Error fetching post detail:", err);
          setError(err || "Không tải được chi tiết bài viết");
        },
        () => {},
      );
    }
  }, [selectedPostId]);

  // Ngăn scroll
  useEffect(() => {
    if (selectedPost || showCreateModal || showEditModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPost, showCreateModal, showEditModal]);

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

    // Reset input value để có thể upload lại file cùng tên
    e.target.value = "";
  };

  // Xử lý upload file
  const handleFileUpload = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length + attachedFiles.length > 5) {
      alert("Tối đa 5 file!");
      return;
    }
    setAttachedFiles((prev) => [...prev, ...selected]);
    setPreviewFiles((prev) => [...prev, ...selected]);

    // Reset input value để có thể upload lại file cùng tên
    e.target.value = "";
  };
  // Xóa ảnh
  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Xóa file
  const removeFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewFiles((prev) => prev.filter((_, i) => i !== index)); // Thêm dòng này
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
          setPreviewFiles([]);
          fetchPosts();
          alert("Đăng bài thành công!");
        },
        (err) => alert(err || "Không thể tạo bài viết"),
      );
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    } finally {
      setLoadingCreate(false);
    }
  };

  const normalizeText = (v) => {
  if (v === undefined || v === null) return "";
  if (typeof v === "string" && v.trim() === "undefined") return "";
  return v;
};

  // Xử lý edit post
const handleEditPost = async () => {
  if (!editingPost) return;

  // ===== BƯỚC 1: Chuẩn hóa dữ liệu =====
  const finalTitle = newPostTitle.trim() || editingPost.Title || "";
  const finalContent = newPostContent.trim() || editingPost.Content || "";

  // Phải có ít nhất title hoặc content
  if (!finalTitle && !finalContent) {
    alert("Tiêu đề hoặc nội dung không được để trống!");
    return;
  }

  setLoadingCreate(true);

  try {
    // ===== BƯỚC 2: Build FormData =====
    const formData = new FormData();

    // ✅ LUÔN GỬI title và content (không skip dù không sửa)
    formData.append("Title", finalTitle);
    formData.append("Content", finalContent);

    // ===== GỬI ảnh cũ (dạng URL string) =====
    previewImages.forEach((url) => {
      if (typeof url === "string" && url.trim()) {
        formData.append("ExistingImages", url);
      }
    });

    // ===== GỬI ảnh mới (dạng File object) =====
    imageFiles.forEach((file) => {
      if (file instanceof File) {
        formData.append("Images", file);
      }
    });

    // ===== GỬI file cũ (dạng URL string) =====
    previewFiles.forEach((url) => {
      if (typeof url === "string" && url.trim()) {
        formData.append("ExistingFiles", url);
      }
    });

    // ===== GỬI file mới (dạng File object) =====
    attachedFiles.forEach((file) => {
      if (file instanceof File) {
        formData.append("Files", file);
      }
    });

    console.log("=== FormData Gửi ===");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File - ${value.name}`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // ===== BƯỚC 3: Gọi API update =====
    await updatePostController(
      editingPost._id,
      formData,
      (response) => {
        console.log("=== Response từ updatePostController ===", response);

        // ✅ FIX: Response có thể là object hoặc có data field
        const updatedPost = response?.data || response;

        if (updatedPost && updatedPost._id) {
          // Cập nhật list posts
          setPosts((prev) =>
            prev.map((p) =>
              p._id === editingPost._id ? updatedPost : p
            ),
          );

          // Optional: reload detail để chắc chắn có dữ liệu mới nhất
          getDetailPostController(
            editingPost._id,
            (detailedPost) => {
              console.log("=== Detailed Post sau reload ===", detailedPost);
              setPosts((prev) =>
                prev.map((p) =>
                  p._id === editingPost._id ? detailedPost : p
                ),
              );
            },
            (err) => {
              console.error("Error reload detail:", err);
            },
            () => {},
          );
        }

        // Reset form
        setShowEditModal(false);
        setEditingPost(null);
        setNewPostTitle("");
        setNewPostContent("");
        setImageFiles([]);
        setPreviewImages([]);
        setAttachedFiles([]);
        setPreviewFiles([]);

        alert("Cập nhật bài viết thành công!");
      },
      (err) => {
        console.error("=== Error updatePost ===", err);
        alert(err || "Lỗi cập nhật bài viết");
      },
    );
  } catch (error) {
    console.error("=== Catch Error ===", error);
    alert("Có lỗi xảy ra khi cập nhật");
  } finally {
    setLoadingCreate(false);
  }
};
  // Khi mở edit, preload data
 const openEditModal = (post) => {
  console.log("=== Opening edit modal for post ===", post);
  
  setEditingPost(post);

  // ===== Lấy Title & Content =====
  const title = post.Title || "";
  const content = post.Content || "";

  setNewPostTitle(title);
  setNewPostContent(content);

  // ===== Lấy ảnh cũ: có thể là string URL hoặc object {url: "..."} =====
  const oldImages = (post.Images || [])
    .map((img) => {
      if (typeof img === "string") return img;
      if (typeof img === "object" && img?.url) return img.url;
      return null;
    })
    .filter(Boolean);
  
  setPreviewImages(oldImages);

  // ===== Lấy file cũ: có thể là string URL hoặc object {url: "..."} =====
  const oldFiles = (post.Files || [])
    .map((f) => {
      if (typeof f === "string") return f;
      if (typeof f === "object" && f?.url) return f.url;
      return null;
    })
    .filter(Boolean);
  
  setPreviewFiles(oldFiles);

  // ===== Reset file mới =====
  setImageFiles([]);
  setAttachedFiles([]);
  setShowEditModal(true);
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
              : p,
          ),
        );
      },
      (err) => {
        console.error("Error reacting:", err);
        setError(err || "Không thể thực hiện reaction");
      },
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
                  : p,
              ),
            );
          },
          (err) => console.error("Error reloading post:", err),
          () => {},
        );

        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      },
      (err) => {
        console.error("Error adding comment:", err);
        setError(err || "Không thể gửi bình luận");
      },
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
                p._id === postId || p.id === postId ? detailedPost : p,
              ),
            );
          },
          (err) => console.error("Error reloading post:", err),
          () => {},
        );

        setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
      },
      (err) => {
        console.error("Error adding reply:", err);
        setError(err || "Không thể gửi trả lời");
      },
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

          {/* Thêm filter cho tab your-posts */}
          {activeTab === "your-posts" && (
            <div className="flex gap-4 mb-6 justify-center">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded ${statusFilter === "all" ? "bg-white/20" : "bg-transparent"} text-white`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`px-4 py-2 rounded ${statusFilter === "approved" ? "bg-white/20" : "bg-transparent"} text-white`}
              >
                Đã duyệt
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-4 py-2 rounded ${statusFilter === "pending" ? "bg-white/20" : "bg-transparent"} text-white`}
              >
                Chờ duyệt
              </button>
              <button
                onClick={() => setStatusFilter("rejected")}
                className={`px-4 py-2 rounded ${statusFilter === "rejected" ? "bg-white/20" : "bg-transparent"} text-white`}
              >
                Từ chối
              </button>
            </div>
          )}

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
                onEdit={openEditModal}
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
                      onReact={(type) => handleReact(selectedPost._id, type)}
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
                                      comment._id || comment.id,
                                    );
                                  }
                                }}
                              />
                              <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                                onClick={() =>
                                  handleAddReply(
                                    selectedPost._id || selectedPost.id,
                                    comment._id || comment.id,
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
            document.body,
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
                          {getCurrentUser().name || "Ẩn danh"}
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
                      placeholder="Nhập tiêu đề bài viết"
                      className="w-full bg-transparent text-white text-2xl font-bold outline-none placeholder-gray-500 mb-4 border-b border-white/20 pb-2"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                    />

                    {/* Nội dung */}
                    <textarea
                      placeholder="Bạn đang nghĩ gì thế?"
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
                                {file.name ||
                                  decodeURIComponent(
                                    file.url?.split("/").pop() ||
                                      `File ${index + 1}`,
                                  )}
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
                    <div className="flex items-start w-full">
                      <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                      <button
                        onClick={() =>
                          document.getElementById("imageUpload").click()
                        }
                        className="bg-white p-2 rounded-full border-b border-t border-l border-r border-black mr-[5px]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <mask
                            id="mask0_5128_19311"
                            style={{ maskType: "luminance" }}
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="14"
                            height="14"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M0.333496 0.333496H13.6355V13.6361H0.333496V0.333496Z"
                              fill="white"
                            />
                          </mask>
                          <g mask="url(#mask0_5128_19311)">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M4.10083 1.3335C2.42016 1.3335 1.3335 2.48616 1.3335 4.2695V9.70016C1.3335 11.4842 2.42016 12.6362 4.10083 12.6362H9.86483C11.5482 12.6362 12.6355 11.4842 12.6355 9.70016V4.2695C12.6368 3.36083 12.3595 2.60216 11.8342 2.07616C11.3488 1.59016 10.6695 1.3335 9.86816 1.3335H4.10083ZM9.86483 13.6362H4.10083C1.8475 13.6362 0.333496 12.0542 0.333496 9.70016V4.2695C0.333496 1.9155 1.8475 0.333496 4.10083 0.333496H9.86816C10.9402 0.333496 11.8648 0.691496 12.5415 1.3695C13.2488 2.0775 13.6368 3.1075 13.6355 4.27016V9.70016C13.6355 12.0542 12.1202 13.6362 9.86483 13.6362V13.6362Z"
                              fill="black"
                            />
                          </g>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.90407 4.12646C4.50141 4.12646 4.17407 4.4538 4.17407 4.85713C4.17407 5.2598 4.50141 5.58713 4.90474 5.58713C5.30741 5.58713 5.63541 5.2598 5.63541 4.8578C5.63474 4.45446 5.30674 4.12713 4.90407 4.12646M4.90474 6.58713C3.95007 6.58713 3.17407 5.81113 3.17407 4.85713C3.17407 3.90246 3.95007 3.12646 4.90474 3.12646C5.85874 3.12713 6.63474 3.90313 6.63541 4.85646V4.85713C6.63541 5.81113 5.85941 6.58713 4.90474 6.58713"
                            fill="black"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1.49929 12.4078C1.41662 12.4078 1.33262 12.3872 1.25529 12.3438C1.01396 12.2085 0.929289 11.9038 1.06396 11.6632C1.10396 11.5912 2.06062 9.89984 3.11329 9.03318C3.94796 8.34651 4.84662 8.72384 5.57062 9.02851C5.99662 9.20784 6.39929 9.37718 6.78596 9.37718C7.14062 9.37718 7.58529 8.75051 7.97862 8.19784C8.52462 7.42718 9.14462 6.55518 10.0526 6.55518C11.4993 6.55518 12.748 7.84584 13.4193 8.53918L13.4966 8.61918C13.6886 8.81718 13.684 9.13384 13.486 9.32651C13.2893 9.51918 12.9726 9.51451 12.7793 9.31584L12.7006 9.23451C12.1326 8.64718 11.0753 7.55518 10.0526 7.55518C9.66062 7.55518 9.20062 8.20384 8.79329 8.77651C8.23462 9.56318 7.65662 10.3772 6.78596 10.3772C6.19729 10.3772 5.65796 10.1505 5.18262 9.94984C4.42662 9.63118 4.08396 9.52918 3.74862 9.80518C2.83929 10.5545 1.94462 12.1372 1.93596 12.1525C1.84462 12.3158 1.67462 12.4078 1.49929 12.4078"
                            fill="black"
                          />
                        </svg>
                      </button>
                      <input
                        type="file"
                        id="fileUpload"
                        multiple
                        style={{ display: "none" }}
                        accept=".pdf,.doc,.docx,.zip"
                        onChange={handleFileUpload}
                      />
                      <button
                        onClick={() =>
                          document.getElementById("fileUpload").click()
                        }
                        className="bg-white p-2 rounded-full border-b border-t border-l border-r border-black"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 18 20"
                          fill="black"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.57266 1.51172C2.91466 1.51172 1.53966 2.85372 1.50066 4.50872V15.3397C1.47166 16.9867 2.77866 18.3387 4.41366 18.3667L4.56066 18.3657H12.5727C14.2147 18.3477 15.5537 16.9907 15.5517 15.3407V6.34172L10.9177 1.51172H4.58466H4.57266ZM4.39966 19.8667C1.92666 19.8237 -0.0413401 17.7867 0.000659935 15.3267V4.49072C0.0576599 2.00972 2.10666 0.0117188 4.56966 0.0117188H4.58766H11.2367C11.4407 0.0117188 11.6357 0.0947188 11.7777 0.241719L16.8437 5.52072C16.9767 5.65972 17.0517 5.84672 17.0517 6.03972V15.3397C17.0557 17.8087 15.0497 19.8397 12.5807 19.8657L4.39966 19.8667Z"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M16.2976 6.98449H13.5436C11.7126 6.97949 10.2246 5.48749 10.2246 3.65949V0.750488C10.2246 0.336488 10.5606 0.000488281 10.9746 0.000488281C11.3886 0.000488281 11.7246 0.336488 11.7246 0.750488V3.65949C11.7246 4.66349 12.5416 5.48149 13.5456 5.48449H16.2976C16.7116 5.48449 17.0476 5.82049 17.0476 6.23449C17.0476 6.64849 16.7116 6.98449 16.2976 6.98449Z"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M10.7935 11.6643H5.89453C5.48053 11.6643 5.14453 11.3283 5.14453 10.9143C5.14453 10.5003 5.48053 10.1643 5.89453 10.1643H10.7935C11.2075 10.1643 11.5435 10.5003 11.5435 10.9143C11.5435 11.3283 11.2075 11.6643 10.7935 11.6643Z"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M8.34375 14.1144C7.92975 14.1144 7.59375 13.7784 7.59375 13.3644V8.46436C7.59375 8.05036 7.92975 7.71436 8.34375 7.71436C8.75775 7.71436 9.09375 8.05036 9.09375 8.46436V13.3644C9.09375 13.7784 8.75775 14.1144 8.34375 14.1144Z"
                          />
                        </svg>
                      </button>
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
                      className="px-8 py-3 w-full bg-[#CFF500] text-black text-[1.25rem] max-lg:text-[14px] font-semibold  disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d4ff00] transition"
                    >
                      {loadingCreate ? "Đang đăng..." : "Đăng"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>,
            document.body,
          )}
        {showEditModal &&
          createPortal(
            <AnimatePresence>
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowEditModal(false)}
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
                      Sửa bài viết
                    </h2>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="text-white/70 hover:text-white transition"
                    >
                      <X size={28} />
                    </button>
                  </div>

                  {/* Body (giữ nguyên như create, nhưng value từ state preload) */}
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
                          {getCurrentUser().name || "Ẩn danh"}
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
                      placeholder="Nhập tiêu đề bài viết"
                      className="w-full bg-transparent text-white text-2xl font-bold outline-none placeholder-gray-500 mb-4 border-b border-white/20 pb-2"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                    />

                    {/* Nội dung */}
                    <textarea
                      placeholder="Bạn đang nghĩ gì thế?"
                      className="w-full bg-transparent text-gray-200 text-lg outline-none resize-none min-h-[120px] mb-6 placeholder-gray-500"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    />

                    {/* Preview ảnh (giữ nguyên) */}
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

                    {/* Preview file (giữ nguyên) */}
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
                                {file.name ||
                                  decodeURIComponent(
                                    file.url?.split("/").pop() ||
                                      `File ${index + 1}`,
                                  )}
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

                  {/* Footer (giữ nguyên như create, nhưng gọi handleEditPost) */}
                  <div className="p-4 border-t border-white/10 bg-[#2a2a2a] flex justify-between items-center w-full">
                    {/* Upload buttons */}
                    <div className="flex items-start">
                      <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                      <button
                        onClick={() =>
                          document.getElementById("imageUpload").click()
                        }
                        className="bg-white p-2 rounded-full border-b border-t border-l border-r border-black mr-[5px]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <mask
                            id="mask0_5128_19311"
                            style={{ maskType: "luminance" }}
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="14"
                            height="14"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M0.333496 0.333496H13.6355V13.6361H0.333496V0.333496Z"
                              fill="white"
                            />
                          </mask>
                          <g mask="url(#mask0_5128_19311)">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M4.10083 1.3335C2.42016 1.3335 1.3335 2.48616 1.3335 4.2695V9.70016C1.3335 11.4842 2.42016 12.6362 4.10083 12.6362H9.86483C11.5482 12.6362 12.6355 11.4842 12.6355 9.70016V4.2695C12.6368 3.36083 12.3595 2.60216 11.8342 2.07616C11.3488 1.59016 10.6695 1.3335 9.86816 1.3335H4.10083ZM9.86483 13.6362H4.10083C1.8475 13.6362 0.333496 12.0542 0.333496 9.70016V4.2695C0.333496 1.9155 1.8475 0.333496 4.10083 0.333496H9.86816C10.9402 0.333496 11.8648 0.691496 12.5415 1.3695C13.2488 2.0775 13.6368 3.1075 13.6355 4.27016V9.70016C13.6355 12.0542 12.1202 13.6362 9.86483 13.6362V13.6362Z"
                              fill="black"
                            />
                          </g>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.90407 4.12646C4.50141 4.12646 4.17407 4.4538 4.17407 4.85713C4.17407 5.2598 4.50141 5.58713 4.90474 5.58713C5.30741 5.58713 5.63541 5.2598 5.63541 4.8578C5.63474 4.45446 5.30674 4.12713 4.90407 4.12646M4.90474 6.58713C3.95007 6.58713 3.17407 5.81113 3.17407 4.85713C3.17407 3.90246 3.95007 3.12646 4.90474 3.12646C5.85874 3.12713 6.63474 3.90313 6.63541 4.85646V4.85713C6.63541 5.81113 5.85941 6.58713 4.90474 6.58713"
                            fill="black"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1.49929 12.4078C1.41662 12.4078 1.33262 12.3872 1.25529 12.3438C1.01396 12.2085 0.929289 11.9038 1.06396 11.6632C1.10396 11.5912 2.06062 9.89984 3.11329 9.03318C3.94796 8.34651 4.84662 8.72384 5.57062 9.02851C5.99662 9.20784 6.39929 9.37718 6.78596 9.37718C7.14062 9.37718 7.58529 8.75051 7.97862 8.19784C8.52462 7.42718 9.14462 6.55518 10.0526 6.55518C11.4993 6.55518 12.748 7.84584 13.4193 8.53918L13.4966 8.61918C13.6886 8.81718 13.684 9.13384 13.486 9.32651C13.2893 9.51918 12.9726 9.51451 12.7793 9.31584L12.7006 9.23451C12.1326 8.64718 11.0753 7.55518 10.0526 7.55518C9.66062 7.55518 9.20062 8.20384 8.79329 8.77651C8.23462 9.56318 7.65662 10.3772 6.78596 10.3772C6.19729 10.3772 5.65796 10.1505 5.18262 9.94984C4.42662 9.63118 4.08396 9.52918 3.74862 9.80518C2.83929 10.5545 1.94462 12.1372 1.93596 12.1525C1.84462 12.3158 1.67462 12.4078 1.49929 12.4078"
                            fill="black"
                          />
                        </svg>
                      </button>
                      <input
                        type="file"
                        id="fileUpload"
                        multiple
                        style={{ display: "none" }}
                        accept=".pdf,.doc,.docx,.zip"
                        onChange={handleFileUpload}
                      />
                      <button
                        onClick={() =>
                          document.getElementById("fileUpload").click()
                        }
                        className="bg-white p-2 rounded-full border-b border-t border-l border-r border-black"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 18 20"
                          fill="black"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.57266 1.51172C2.91466 1.51172 1.53966 2.85372 1.50066 4.50872V15.3397C1.47166 16.9867 2.77866 18.3387 4.41366 18.3667L4.56066 18.3657H12.5727C14.2147 18.3477 15.5537 16.9907 15.5517 15.3407V6.34172L10.9177 1.51172H4.58466H4.57266ZM4.39966 19.8667C1.92666 19.8237 -0.0413401 17.7867 0.000659935 15.3267V4.49072C0.0576599 2.00972 2.10666 0.0117188 4.56966 0.0117188H4.58766H11.2367C11.4407 0.0117188 11.6357 0.0947188 11.7777 0.241719L16.8437 5.52072C16.9767 5.65972 17.0517 5.84672 17.0517 6.03972V15.3397C17.0557 17.8087 15.0497 19.8397 12.5807 19.8657L4.39966 19.8667Z"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M16.2976 6.98449H13.5436C11.7126 6.97949 10.2246 5.48749 10.2246 3.65949V0.750488C10.2246 0.336488 10.5606 0.000488281 10.9746 0.000488281C11.3886 0.000488281 11.7246 0.336488 11.7246 0.750488V3.65949C11.7246 4.66349 12.5416 5.48149 13.5456 5.48449H16.2976C16.7116 5.48449 17.0476 5.82049 17.0476 6.23449C17.0476 6.64849 16.7116 6.98449 16.2976 6.98449Z"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M10.7935 11.6643H5.89453C5.48053 11.6643 5.14453 11.3283 5.14453 10.9143C5.14453 10.5003 5.48053 10.1643 5.89453 10.1643H10.7935C11.2075 10.1643 11.5435 10.5003 11.5435 10.9143C11.5435 11.3283 11.2075 11.6643 10.7935 11.6643Z"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M8.34375 14.1144C7.92975 14.1144 7.59375 13.7784 7.59375 13.3644V8.46436C7.59375 8.05036 7.92975 7.71436 8.34375 7.71436C8.75775 7.71436 9.09375 8.05036 9.09375 8.46436V13.3644C9.09375 13.7784 8.75775 14.1144 8.34375 14.1144Z"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Nút cập nhật */}
                    <button
                      onClick={handleEditPost}
                      disabled={
                        loadingCreate ||
                        (!newPostTitle.trim() &&
                          !newPostContent.trim() &&
                          imageFiles.length === 0 &&
                          attachedFiles.length === 0)
                      }
                      className="flex w-auto items-center justify-center px-8 py-3 bg-[#CFF500] text-black text-[1.25rem] max-lg:text-[14px] font-semibold  disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d4ff00] transition"
                    >
                      {loadingCreate ? "Đang cập nhật..." : "Cập nhật"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>,
            document.body,
          )}
      </div>
    </div>
  );
};

export default Forum;
