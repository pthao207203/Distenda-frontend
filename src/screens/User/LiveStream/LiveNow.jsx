import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Hls from "hls.js";
import axios from "axios";
import { io } from "socket.io-client";
import { MessageCircle } from "lucide-react";
import { getLivestreamDetail } from "../../../services/livestream.service";
import LivestreamReactionBar from "./LivestreamReactionBar";
import "./LiveStream.css";

const LiveNow = () => {
  const { LivestreamID } = useParams();
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const [livestream, setLivestream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

  // Reaction types with images like Forum
  const reactionsList = [
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

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user/me`, {
          withCredentials: true,
        });
        // Backend trả về trực tiếp user object, không có wrapper
        if (response.data && response.data._id) {
          setCurrentUserId(response.data._id);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
    fetchCurrentUser();
  }, [API_BASE_URL]);

  const getTotalReactions = () => {
    return reactions.length;
  };

  const getUserReactionType = () => {
    const userReaction = reactions.find((r) => r.userId === currentUserId);
    return userReaction ? userReaction.type : null;
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Vừa mới bắt đầu";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleString("vi-VN");
  };

  const handleAddReaction = async (type) => {
    if (!currentUserId) {
      alert("Vui lòng đăng nhập để react");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/livestreams/${LivestreamID}/reaction`,
        { type },
        { withCredentials: true }
      );

      console.log("Add reaction response:", response.data);

      if (response.data.code === 201 || response.data.code === 200) {
        setReactions(response.data.data);
        socketRef.current?.emit("addLivestreamReaction", {
          livestreamId: LivestreamID,
          type,
          reactions: response.data.data,
        });
      }
    } catch (err) {
      console.error("Error adding reaction:", err);
      alert("Không thể thêm reaction");
    }
  };

  const handleRemoveReaction = async () => {
    if (!currentUserId) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/livestreams/${LivestreamID}/reaction`,
        { withCredentials: true }
      );

      if (response.data.code === 200) {
        setReactions(response.data.data);
        socketRef.current?.emit("removeLivestreamReaction", {
          livestreamId: LivestreamID,
          reactions: response.data.data,
        });
      }
    } catch (err) {
      console.error("Error removing reaction:", err);
      alert("Không thể xóa reaction");
    }
  };

  const handleReaction = async (type) => {
    if (type === null) {
      await handleRemoveReaction();
    } else if (type === getUserReactionType()) {
      await handleRemoveReaction();
    } else {
      await handleAddReaction(type);
    }
  };

  useEffect(() => {
    const fetchLivestream = async () => {
      try {
        setLoading(true);
        const response = await getLivestreamDetail(LivestreamID);
        if (response.code === 200) {
          setLivestream(response.data);
          setReactions(response.data.reactions || []);
        } else {
          setError("Không thể tải thông tin livestream");
        }
      } catch (err) {
        setError("Lỗi khi tải livestream: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (LivestreamID) fetchLivestream();
  }, [LivestreamID]);

  // Fetch initial viewer count
  useEffect(() => {
    if (!LivestreamID) return;

    const fetchData = async () => {
      try {
        // Fetch viewer count
        const viewerResponse = await axios.get(
          `${API_BASE_URL}/livestreams/${LivestreamID}/active-viewers`,
          { withCredentials: true }
        );
        if (viewerResponse.data?.code === 200) {
          setViewerCount(viewerResponse.data.data?.activeViewers || 0);
        }

        // Fetch comment count
        const commentResponse = await axios.get(
          `${API_BASE_URL}/livestreams/${LivestreamID}/comments`,
          {
            params: { limit: 1, skip: 0 },
            withCredentials: true,
          }
        );
        if (commentResponse.data?.code === 200) {
          setCommentCount(commentResponse.data.data?.length || 0);
        }
      } catch (err) {
        console.error("Error fetching viewer count or comments:", err);
      }
    };

    fetchData();
  }, [LivestreamID, API_BASE_URL]);

  // Socket.io connection for livestream reactions
  useEffect(() => {
    if (!LivestreamID) return;

    console.log("Connecting Socket.io with livestreamId:", LivestreamID);

    socketRef.current = io(API_BASE_URL, {
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Socket.io connected");
      socketRef.current.emit("watchLivestream", LivestreamID);
      socketRef.current.emit("joinLivestream", LivestreamID);
      console.log("👁️ Emitted watchLivestream for livestreamId:", LivestreamID);
    });

    socketRef.current.on("livestreamReactionAdded", (data) => {
      console.log("Received livestreamReactionAdded:", data);
      if (data.livestreamId === LivestreamID) {
        setReactions(data.reactions || []);
      }
    });

    socketRef.current.on("livestreamReactionRemoved", (data) => {
      console.log("Received livestreamReactionRemoved:", data);
      if (data.livestreamId === LivestreamID) {
        setReactions(data.reactions || []);
      }
    });

    socketRef.current.on("viewerCountUpdated", (data) => {
      console.log("📊 viewerCountUpdated received:", data);
      if (data.livestreamId === LivestreamID) {
        console.log("Setting viewerCount to:", data.viewerCount);
        setViewerCount(data.viewerCount || 0);
      }
    });

    // Lắng nghe bình luận mới
    socketRef.current.on("commentAdded", (comment) => {
      console.log("💬 commentAdded received:", comment);
      setCommentCount((prev) => prev + 1);
    });

    // Lắng nghe xóa bình luận
    socketRef.current.on("commentDeleted", (data) => {
      console.log("🗑️ commentDeleted received:", data);
      setCommentCount((prev) => Math.max(0, prev - 1));
    });

    // Cleanup
    return () => {
      console.log("Cleaning up Socket.io connection");
      socketRef.current?.emit("stopWatchingLivestream", LivestreamID);
      socketRef.current?.emit("leaveLivestream", LivestreamID);
      socketRef.current?.disconnect();
    };
  }, [LivestreamID, API_BASE_URL]);

  useEffect(() => {
    if (!livestream || !livestream.LivestreamStreamKey) return;
    const video = videoRef.current;
    const hlsUrl = `http://localhost:8888/${livestream.LivestreamStreamKey}/index.m3u8`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        liveSyncDuration: 1,
        liveMaxLatencyDuration: 2,
        maxLiveSyncPlaybackRate: 1.5,
        backBufferLength: 0,
        maxBufferLength: 2,
        maxBufferHole: 0.1,
        enableWorker: true,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setVideoLoaded(true);
        video.play().catch((error) => {
          console.warn("Autoplay was prevented:", error);
        });
      });
      hls.on(Hls.Events.LEVEL_UPDATED, (_, data) => {
        const liveEdge = data.details.liveEdge;
        if (!isNaN(liveEdge)) video.currentTime = liveEdge - 0.1;
      });
      hls.on(Hls.Events.ERROR, (event, data) =>
        console.error("HLS error", data)
      );

      return () => hls.destroy();
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
      setVideoLoaded(true);
      video.play().catch((error) => {
        console.warn("Autoplay was prevented:", error);
      });
    }
  }, [livestream]);

  if (loading) {
    return (
      <div className="text-center text-white p-4">Đang tải livestream...</div>
    );
  }

  if (error || !livestream) {
    return (
      <div className="text-center text-red-400 p-4">
        {error || "Không tìm thấy livestream"}
      </div>
    );
  }

  const avatar =
    livestream.createdBy?.UserId?.AdminAvatar ||
    "https://distenda.vn/default-avatar.jpg";

  return (
    <div className="bg-white bg-opacity-25 overflow-hidden-scroll text-white p-[16px] ">
      <h2 className="font-semibold max-md:text-[18px] md:text-[1.5rem] mb-[8px]">
        {livestream.LivestreamTitle}
      </h2>

      <p className="max-md:text-[16px] md:text-[1.25rem] mb-[8px] ">
        {livestream.LivestreamDescription || ""}
      </p>
      <div className={`relative ${!videoLoaded ? "min-h-[300px]" : ""}`}>
        <span className="absolute top-3 left-3 bg-red-600 px-3 py-1 rounded text-xs font-semibold text-white ">
          LIVE
        </span>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          controls
          className="w-full max-h-[35.5rem] object-cover bg-black"
        />
      </div>

      <div className=" text-white flex justify-between mt-[8px]">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt="avatar"
            className="w-[4rem] h-[4rem] rounded-full object-cover"
          />

          <div className="flex-1">
            <p className="max-md:text-[16px] md:text-[1.25rem] font-semibold mb-1">
              {livestream.createdBy?.UserId?.AdminFullName || ""}
            </p>
            <p className="max-md:text-[14px] md:text-[1rem] text-white font-regular">
              {getRelativeTime(livestream.LivestreamStartedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 max-md:text-[16px] md:text-[1.25rem] text-white">
          {/* Reaction bar */}
          <LivestreamReactionBar
            myReaction={getUserReactionType()}
            totalReactions={getTotalReactions()}
            onReact={handleReaction}
            reactions={reactionsList}
          />

          <div className="flex items-center gap-1">
            <MessageCircle size={20} />
            <span>{commentCount}</span>
          </div>

          <div className="flex items-center gap-1">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/6d0691d3e7343fc6c0028f1faa5c59306b98586db03c35bcda1991ff364f4d53?placeholderIfAbsent=true&apiKey=e677dfd035d54dfb9bce1976069f6b0e"
              alt="eye icon"
              className="w-8 h-8 object-contain"
            />
            <span>{viewerCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveNow;
