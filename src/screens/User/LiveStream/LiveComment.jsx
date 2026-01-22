import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

/**
 * LiveComment Component
 *
 * Hệ thống bình luận realtime cho livestream
 * - Kết nối Socket.io để nhận updates realtime
 * - Fetch bình luận cũ từ API
 * - Gửi/xóa bình luận qua API + Socket.io
 * - Backend tự lấy user từ cookies
 *
 * Props:
 * - livestreamId: ID của livestream (string)
 *
 * Ví dụ:
 * <LiveComment livestreamId="62f3d1a9c5b0d200a1b2c3d4" />
 */
const LiveComment = ({ livestreamId, trackViewers = true }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const endRef = useRef(null);
  const socketRef = useRef(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

  // Debug: log props khi component mount
  useEffect(() => {
    console.log("LiveComment Props:", { livestreamId, API_BASE_URL });
  }, [livestreamId, API_BASE_URL]);

  /**
   * Socket.io Connection & Event Listeners
   * - Kết nối với server (cookies tự động gửi)
   * - Join room của livestream hiện tại
   * - Lắng nghe events từ Socket.io: bình luận, xóa, viewer count
   */
  useEffect(() => {
    if (!livestreamId) {
      console.warn("Missing livestreamId - Socket.io connection skipped");
      return;
    }

    console.log("Connecting Socket.io with:", { livestreamId, API_BASE_URL });

    // Kết nối Socket.io (cookies tự động gửi)
    socketRef.current = io(API_BASE_URL, {
      withCredentials: true, // Gửi cookies
    });

    // Join phòng bình luận của livestream
    socketRef.current.emit("joinLivestream", livestreamId);

    // Chỉ theo dõi viewer count khi được bật
    if (trackViewers) {
      socketRef.current.emit("watchLivestream", livestreamId);
    }

    console.log("Emitted joinLivestream and watchLivestream events");

    // Lắng nghe bình luận mới từ Socket.io
    socketRef.current.on("commentAdded", (comment) => {
      console.log("commentAdded received:", comment);
      setComments((prevComments) => {
        // Kiểm tra comment đã tồn tại chưa (avoid duplicates)
        const exists = prevComments.some((c) => c._id === comment._id);
        if (exists) {
          console.log("Comment already exists, skipping duplicate");
          return prevComments;
        }
        return [...prevComments, comment];
      });
    });

    // Lắng nghe sự kiện xóa bình luận
    socketRef.current.on("commentDeleted", (data) => {
      setComments((prevComments) =>
        prevComments.filter((c) => c._id !== data.commentId)
      );
    });

    // Lắng nghe cập nhật số lượng viewer
    if (trackViewers) {
      socketRef.current.on("viewerCountUpdated", (data) => {
        if (data.livestreamId === livestreamId) {
          setViewerCount(data.viewerCount || 0);
        }
      });
    }

    // Cleanup: Rời khỏi phòng khi component unmount
    return () => {
      socketRef.current?.emit("leaveLivestream", livestreamId);
      if (trackViewers) {
        socketRef.current?.emit("stopWatchingLivestream", livestreamId);
      }
      socketRef.current?.disconnect();
    };
  }, [livestreamId, API_BASE_URL, trackViewers]);

  /**
   * Fetch danh sách bình luận cũ từ API
   * Được gọi lần đầu khi component mount
   */
  useEffect(() => {
    if (!livestreamId) return;

    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/livestreams/${livestreamId}/comments`,
          {
            params: { limit: 100, skip: 0 },
            withCredentials: true, // Gửi cookies
          }
        );

        if (response.data.code === 200) {
          setComments(response.data.data);
          // Lấy userId từ comment đầu tiên (nếu có)
          const firstUserComment = response.data.data.find((c) => c.userId);
          if (firstUserComment) {
            setCurrentUserId(firstUserComment.userId);
          }
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [livestreamId, API_BASE_URL]);

  /**
   * Auto scroll đến bình luận mới nhất
   */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  /**
   * Gửi bình luận mới
   * - POST API tạo comment
   * - Emit Socket.io để phát sóng
   * - Update local state
   */
  const send = async () => {
    if (!text.trim() || !livestreamId) {
      console.warn("Cannot send comment - missing data:", {
        text: text.trim(),
        livestreamId,
      });
      return;
    }

    setLoading(true);
    try {
      const url = `${API_BASE_URL}/livestreams/${livestreamId}/comments`;
      console.log("Sending comment to:", url);

      // Gửi API request - chỉ gửi text, backend tự lấy user từ cookies
      const response = await axios.post(
        url,
        { text: text.trim() },
        { withCredentials: true }
      );

      console.log("Comment response:", response.data);

      if (response.data.code === 201) {
        const newComment = response.data.data;

        // Thêm vào state
        setComments((prevComments) => [...prevComments, newComment]);

        // Lưu userId từ comment đã tạo
        if (!currentUserId && newComment.userId) {
          setCurrentUserId(newComment.userId);
        }

        // Phát sóng qua Socket.io
        socketRef.current?.emit("newComment", {
          livestreamId,
          comment: newComment,
        });

        setText("");
      }
    } catch (error) {
      console.error("Error sending comment - Full error:", error);
      console.error("Error response:", error.response?.data);
      alert("Không thể gửi bình luận. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xóa bình luận
   * - Chỉ chủ bình luận có thể xóa (backend check qua cookies)
   * - Soft delete (mark isDeleted = true)
   */
  const handleDeleteComment = async (commentId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/livestreams/comments/${commentId}`,
        { withCredentials: true }
      );

      if (response.data.code === 200) {
        // Xóa từ state
        setComments((prevComments) =>
          prevComments.filter((c) => c._id !== commentId)
        );

        // Phát sóng qua Socket.io
        socketRef.current?.emit("deleteComment", {
          livestreamId,
          commentId,
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert(error.response?.data?.message || "Không thể xóa bình luận");
    }
  };

  /**
   * Format thời gian HH:MM
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <div className="h-full w-full max-md:mb-[24px] flex flex-col text-white">
      {/* Header với số lượng bình luận và viewer */}
      <div className="flex flex-col max-md:text-[16px] md:text-[1.25rem] font-medium mb-4 text-white gap-2">
        <div className="p-[0.625rem] bg-white bg-opacity-50 max-w-fit rounded-[0.5rem] sticky top-0">
          Bình luận ({comments.length})
        </div>
        {trackViewers && (
          <div className="p-[0.625rem] bg-blue-500 bg-opacity-70 max-w-fit rounded-[0.5rem] text-sm font-normal flex items-center gap-1">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/6d0691d3e7343fc6c0028f1faa5c59306b98586db03c35bcda1991ff364f4d53?placeholderIfAbsent=true&apiKey=e677dfd035d54dfb9bce1976069f6b0e"
              alt="eye icon"
              className="w-4 h-4 object-contain"
            />
            {viewerCount} người đang xem
          </div>
        )}
      </div>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto ">
        {comments.map((c) => (
          <div key={c._id} className="flex gap-2 mb-4 group">
            {/* Avatar */}
            {c.userAvatar ? (
              <img
                src={c.userAvatar}
                alt={c.userName}
                className="w-[1.875rem] h-[1.875rem] bg-white rounded-full mr-2 object-cover"
              />
            ) : (
              <div className="w-[1.875rem] h-[1.875rem] bg-white rounded-full mr-2" />
            )}

            <div className="max-w-[85%]">
              {/* User name + time */}
              <div className="text-medium max-md:text-[14px] md:text-[1.125rem] text-white mb-2 flex justify-between items-center">
                <span>{c.userName} </span>
                <span className="max-md:text-[12px] md:text-[0.875rem] text-gray-300 pl-3">
                  {formatTime(c.createdAt)}
                </span>
              </div>

              {/* Comment text */}
              <div
                className={`inline-block text-regular max-md:text-[14px] md:text-[1.125rem] leading-relaxed rounded-md rounded-tl-none max-w-full
                                ${
                                  c.userId === currentUserId
                                    ? "bg-[#FFFFFF] bg-opacity-25 px-3 py-2 "
                                    : ""
                                }`}
              >
                {c.text}
              </div>

              {/* Delete button (chỉ hiển thị cho chủ comment) */}
              {c.userId === currentUserId && (
                <button
                  onClick={() => handleDeleteComment(c._id)}
                  className="max-md:text-[12px] md:text-[0.75rem] text-gray-300 hover:text-red-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity block"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input comment */}
      <div className="p-[1.5rem] bg-white rounded-[8px] flex items-center gap-2">
        <div className="flex flex-col items-start flex-1">
          <input
            type="text"
            className="flex-1 border-none rounded-[8px] outline-none bg-white text-black w-full"
            placeholder="Nhập bình luận..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                send();
              }
            }}
            disabled={loading}
          />
        </div>
        <button
          className="bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          onClick={send}
          disabled={loading || !text.trim()}
        >
          {loading ? (
            <svg
              className="w-6 h-6 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 42 42"
              fill="none"
            >
              <path
                d="M38.5 13.6675V28.315C38.5 34.685 34.7025 38.4825 28.3325 38.4825H13.6675C7.2975 38.5 3.5 34.7025 3.5 28.3325V13.6675C3.5 7.2975 7.2975 3.5 13.6675 3.5H28.315C34.7025 3.5 38.5 7.2975 38.5 13.6675Z"
                fill="black"
              />
              <path
                d="M21.738 12.5352L27.6978 18.0963C28.1007 18.4722 28.1007 19.0944 27.6978 19.4704C27.295 19.8463 26.6281 19.8463 26.2253 19.4704L22.0437 15.5685V28.7778C22.0437 29.3093 21.5713 29.75 21.0017 29.75C20.4322 29.75 19.9598 29.3093 19.9598 28.7778V15.5685L15.7782 19.4704C15.3753 19.8463 14.7085 19.8463 14.3056 19.4704C14.0972 19.2759 14 19.0296 14 18.7833C14 18.537 14.1111 18.2778 14.3056 18.0963L20.2654 12.5352C20.4599 12.3537 20.7239 12.25 21.0017 12.25C21.2796 12.25 21.5435 12.3537 21.738 12.5352Z"
                fill="white"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default LiveComment;
