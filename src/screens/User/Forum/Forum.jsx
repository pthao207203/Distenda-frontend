// src/pages/Forum.jsx
import React, { useState, useEffect } from "react";
import { Send, X } from "lucide-react";
import SearchBar from "../../PublishUser/Course/SearchBar";
import Subject from "./Subject";
import ForumPost from "./ForumPost";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
// Dữ liệu giả lập
const mockPosts = [
  {
    id: 1,
    author: {
      name: "Nguyễn Minh Anh",
      avatar: "https://i.pravatar.cc/150?img=32",
      member: "Thành viên đồng",
    },
    content:
      "Mọi người ơi, có ai đang học đến phần useContext + useReducer kết hợp chưa? Sao mình thấy nó hơi rối quá 😅 Có ví dụ thực tế nào hay ho không ạ?",
    image:
      "https://api.builder.io/api/v1/image/assets/7e6ace8706ad423985a91f95c2918220/b9a9052b278b0d7113e4f64a048962496ff39647?placeholderIfAbsent=true",
    time: "19:05, 27/12/2025",
    totalReactions: 28,
    commentsCount: 12,
    myReaction: null,
    comments: [
      {
        id: 101,
        author: {
          name: "Trần Văn Hùng",
          avatar: "https://i.pravatar.cc/150?img=45",
        },
        content:
          "Dùng cho state phức tạp thì rất ngon, nhưng phải cấu trúc tốt thì mới dễ maintain",
        time: "30 phút trước",
        replies: [
          {
            id: 1011,
            author: {
              name: "Nguyễn Minh Anh",
              avatar: "https://i.pravatar.cc/150?img=32",
            },
            content:
              "Cảm ơn anh Hùng ạ! Anh có thể chia sẻ cấu trúc state mẫu không ạ?",
            time: "28 phút trước",
          },
        ],
      },
      {
        id: 102,
        author: {
          name: "Lê Thị Mai",
          avatar: "https://i.pravatar.cc/150?img=28",
        },
        content:
          "Mình hay tách Context ra nhiều file nhỏ theo feature, mỗi feature 1 context + reducer riêng",
        time: "25 phút trước",
        replies: [],
      },
    ],
  },
  {
    id: 2,
    author: {
      name: "Phạm Quốc Bảo",
      avatar: "https://i.pravatar.cc/150?img=12",
      member: "Thành viên bạc",
    },
    content:
      "Mọi người cho mình hỏi nên dùng Zustand hay Redux Toolkit cho project React vừa và nhỏ? Mình ưu tiên code gọn và dễ maintain.",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159",
    time: "21:40, 26/12/2025",
    totalReactions: 15,
    commentsCount: 5,
    myReaction: "like",
    comments: [
      {
        id: 201,
        author: {
          name: "Lê Hoàng Long",
          avatar: "https://i.pravatar.cc/150?img=8",
        },
        content:
          "Zustand gọn nhẹ, học nhanh. Redux Toolkit phù hợp app lớn hơn.",
        time: "2 giờ trước",
        replies: [],
      },
      {
        id: 202,
        author: {
          name: "Nguyễn Minh Anh",
          avatar: "https://i.pravatar.cc/150?img=32",
        },
        content: "Nếu team nhỏ thì mình vote Zustand nhé 😄",
        time: "1 giờ trước",
        replies: [
          {
            id: 2021,
            author: {
              name: "Phạm Quốc Bảo",
              avatar: "https://i.pravatar.cc/150?img=12",
            },
            content: "Cảm ơn mọi người nhiều ạ!",
            time: "45 phút trước",
          },
        ],
      },
    ],
  },

  /* ===== BÀI VIẾT GIẢ 3 ===== */
  {
    id: 3,
    author: {
      name: "Võ Thuỳ Linh",
      avatar: "https://i.pravatar.cc/150?img=47",
      member: "Thành viên vàng",
    },
    content:
      "Có ai đã từng optimize performance cho list dài trong React chưa? Dùng memo + virtualization có thực sự hiệu quả không?",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    time: "08:15, 26/12/2025",
    totalReactions: 42,
    commentsCount: 9,
    myReaction: "love",
    comments: [
      {
        id: 301,
        author: {
          name: "Trần Văn Hùng",
          avatar: "https://i.pravatar.cc/150?img=45",
        },
        content:
          "Có nhé, dùng react-window hoặc react-virtualized giảm render rất rõ.",
        time: "4 giờ trước",
        replies: [],
      },
      {
        id: 302,
        author: {
          name: "Nguyễn Nhật Nam",
          avatar: "https://i.pravatar.cc/150?img=19",
        },
        content:
          "Memo chỉ hiệu quả khi props ổn định, còn list dài thì virtualization là bắt buộc.",
        time: "3 giờ trước",
        replies: [
          {
            id: 3021,
            author: {
              name: "Võ Thuỳ Linh",
              avatar: "https://i.pravatar.cc/150?img=47",
            },
            content: "Ok mình sẽ thử react-window, cảm ơn bạn nhé!",
            time: "2 giờ trước",
          },
        ],
      },
    ],
  },
];

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
];

const Forum = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [activeTab, setActiveTab] = useState("newest");
  const selectedPost = posts.find((p) => p.id === selectedPostId);

  const handleReact = (postId, type) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, myReaction: type } : p))
    );
  };

  const handleAddComment = (postId) => {
    if (!commentInputs[postId]?.trim()) return;
    const newComment = {
      id: Date.now(),
      author: { name: "Bạn", avatar: "https://i.pravatar.cc/150?img=68" },
      content: commentInputs[postId],
      time: "vừa xong",
      replies: [],
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [...p.comments, newComment],
              commentsCount: p.commentsCount + 1,
            }
          : p
      )
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleAddReply = (postId, commentId) => {
    if (!replyInputs[commentId]?.trim()) return;
    const newReply = {
      id: Date.now(),
      author: { name: "Bạn", avatar: "https://i.pravatar.cc/150?img=68" },
      content: replyInputs[commentId],
      time: "vừa xong",
    };
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: p.comments.map((c) =>
              c.id === commentId
                ? { ...c, replies: [...(c.replies || []), newReply] }
                : c
            ),
          };
        }
        return p;
      })
    );
    setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
  };
  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPost]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelectedPostId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex overflow-hidden relative flex-wrap grow gap-4 justify-center w-full bg-opacity-10 backdrop-blur-[10px] max-md:mt-1.5">
      {/* Phần tạo bài viết */}

      <div className="flex overflow-hidden relative flex-wrap grow justify-center w-full bg-white bg-opacity-10 max-md:mt-1.5">
        <div className="flex-1 shrink pt-12 pr-14 pb-2.5 pl-14 basis-0 min-w-60 max-md:px-5 max-md:max-w-full">
          <SearchBar placeholder="Tìm kiếm bài viết" />
          <header className="flex flex-wrap gap-8 justify-center items-center mt-3 pl-4 w-full text-[1.25rem] max-lg:text-[14px] max-md:max-w-full mb-10">
            <div className="flex flex-wrap flex-1 shrink gap-4 items-center self-stretch my-auto text-white basis-6 min-w-60 max-md:max-w-full">
              <button
                onClick={() => setActiveTab("newest")}
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
                onClick={() => setActiveTab("your-posts")}
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
            <button className="flex gap-10 justify-center items-center px-3 py-3 mt-0 text-[1.25rem] max-lg:text-[14px] font-medium  text-[#131313] bg-[#CFF500]">
              <div className="flex gap-2.5 justify-center items-center self-stretch my-auto">
                <span className="self-stretch my-auto">Thêm bài đăng</span>
              </div>
            </button>
          </header>
          {/* <div className="bg-[#1e1e1e] rounded-xl p-4 mb-6 shadow-lg border border-gray-800">
            <div className="flex gap-3">
              <img
                src="https://i.pravatar.cc/150?img=68"
                alt="avatar"
                className="w-10 h-10 rounded-full"
              />
              <input
                type="text"
                placeholder="Bạn đang nghĩ gì? Có gì hay ho trong khóa học muốn chia sẻ không? 😊"
                className="flex-1 bg-[#2a2a2a] rounded-full px-5 py-2.5 text-gray-300 placeholder-gray-500 border-none outline-none"
              />
            </div>
          </div> */}

          {/* Danh sách bài viết - không hiển thị comment */}
          {posts.map((post) => (
            <ForumPost
              key={post.id}
              post={post}
              reactions={reactions}
              variant="list"
              onClick={() => setSelectedPostId(post.id)}
              onCommentClick={(e) => {
                e.stopPropagation();
                setSelectedPostId(post.id);
              }}
              onReact={(type) => handleReact(post.id, type)}
            />
          ))}
        </div>
        <div className="max-w-full flex h-full top-0 self-start max-md:hidden">
          <Subject />
        </div>
        {/* Modal bình luận */}

          {selectedPost &&  createPortal(
                    <AnimatePresence>
            <motion.div
              className="fixed inset-0 z-50 flex justify-center items-center pt-2 bg-black/50 backdrop-blur-[1px]"
              onClick={() => setSelectedPostId(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="bg-[#1e1e1e] w-[65%] max-lg:w-[90%] max-h-[90vh] flex flex-col mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Nút đóng */}
                <button
                  className="absolute top-4 right-5 z-10 bg-black/20 p-2 rounded-full text-white/50 hover:text-white"
                  onClick={() => setSelectedPostId(null)}
                >
                  <X size={24} />
                </button>

                <div className="flex-1 overflow-y-auto ">
                  {/* Nội dung bài viết */}
                  <ForumPost
                    post={selectedPost}
                    reactions={reactions}
                    variant="modal"
                    onReact={(type) => handleReact(selectedPost.id, type)}
                  />

                  {/* Phần bình luận */}
                  <div className="mt-8 border-t border-white/10 pt-6 px-4">
                    {(selectedPost.comments || []).map((comment) => (
                      <div key={comment.id} className="mb-6">
                        <div className="flex gap-3">
                          <img
                            src={comment.author.avatar}
                            alt=""
                            className="w-10 h-10 max-lg:w-20 max-lg:h-20 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="bg-[#2a2a2a] rounded-2xl px-4 py-3">
                              <span className="font-medium text-white block text-[1.125rem] max-lg:text-[16px] mb-3">
                                {comment.author.name}
                              </span>
                              <p className="text-gray-200 text-base max-lg:text-[14px] leading-snug">
                                {comment.content}
                              </p>
                            </div>
                            <div className="text-[0.875rem] max-lg:text-[11px] text-gray-500 mt-1 flex gap-4">
                              <span>{comment.time}</span>
                              <button className="hover:underline">Thích</button>
                              <button className="hover:underline">
                                Trả lời
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Replies */}
                        {(comment.replies || []).map((reply) => (
                          <div key={reply.id} className="flex gap-3 mt-4 ml-12">
                            <img
                              src={reply.author.avatar}
                              alt=""
                              className="w-8 h-8 max-lg:w-16 max-lg:h-16 rounded-full"
                            />
                            <div className="flex-1 bg-[#2a2a2a] rounded-2xl px-4 py-2">
                              <span className="flex font-medium text-white text-[1.125rem] max-lg:text-[16px] mb-3">
                                {reply.author.name}
                              </span>
                              <p className="text-gray-200 text-base max-lg:text-[14px] leading-snug">
                                {reply.content}
                              </p>
                              <div className="text-[0.875rem] max-lg:text-[11px] text-gray-500 mt-1">
                                {reply.time}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Input reply */}
                        <div className="flex gap-3 mt-3 ml-12">
                          <img
                            src="https://i.pravatar.cc/150?img=68"
                            alt=""
                            className="w-8 h-8 max-lg:w-16 max-lg:h-16 rounded-full"
                          />
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              placeholder="Trả lời bình luận..."
                              className="w-full bg-[#2a2a2a] text-[1.125rem] max-lg:text-[14px] leading-snug rounded-full px-4 py-2 pr-12 text-gray-200 placeholder-gray-500 outline-none border-none"
                              value={replyInputs[comment.id] || ""}
                              onChange={(e) =>
                                setReplyInputs((prev) => ({
                                  ...prev,
                                  [comment.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddReply(selectedPost.id, comment.id);
                                }
                              }}
                            />
                            <button
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                              onClick={() =>
                                handleAddReply(selectedPost.id, comment.id)
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
                    src="https://i.pravatar.cc/150?img=68"
                    alt=""
                    className="w-10 h-10 max-lg:w-20 max-lg:h-20 rounded-full"
                  />
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Viết bình luận công khai..."
                      className="w-full bg-[#2a2a2a] rounded-full px-5 py-3 pr-14 text-gray-200 placeholder-gray-500 outline-none border-none"
                      value={commentInputs[selectedPost.id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [selectedPost.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment(selectedPost.id);
                        }
                      }}
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
                      onClick={() => handleAddComment(selectedPost.id)}
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
      </div>
    </div>
  );
};

export default Forum;
