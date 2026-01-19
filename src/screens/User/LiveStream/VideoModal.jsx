import { useEffect, useRef } from "react";
import HLS from "hls.js";

const VideoModal = ({ video, onClose }) => {
  const videoRef = useRef(null);

  // Convert S3 URL to HTTP URL or use signed URL
  const getHttpUrl = (video) => {
    // Prefer signed URL if available
    if (
      video.LivestreamVideoSignedUrl &&
      video.LivestreamVideoSignedUrl.startsWith("http")
    ) {
      return video.LivestreamVideoSignedUrl;
    }

    if (!video.LivestreamVideoUrl) return null;

    const s3Url = video.LivestreamVideoUrl;

    // If it's already an HTTP URL, return as is
    if (s3Url.startsWith("http")) {
      return s3Url;
    }

    // Convert s3://bucket/key to HTTPS URL
    if (s3Url.startsWith("s3://")) {
      const s3Parts = s3Url.replace("s3://", "").split("/");
      const bucket = s3Parts[0];
      const key = s3Parts.slice(1).join("/");
      const region = "ap-southeast-2";

      // Use S3 HTTP URL format
      return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }

    return s3Url;
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const videoUrl = getHttpUrl(video);
    if (!videoUrl) return;

    console.log("Loading video from:", videoUrl);

    // Check if it's an HLS stream (m3u8)
    if (videoUrl.endsWith(".m3u8")) {
      if (HLS.isSupported()) {
        const hls = new HLS();
        hls.loadSource(videoUrl);
        hls.attachMedia(videoElement);
      } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        videoElement.src = videoUrl;
      }
    } else {
      // MP4 or other video formats
      videoElement.src = videoUrl;
    }
  }, [video]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-black rounded-lg max-w-6xl w-full mx-4 lg:mx-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-white max-md:text-[16px] md:text-lg font-semibold">
            {video.LivestreamTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white max-md:text-[20px] md:text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Video Player */}
        <div className="bg-black p-4">
          {video.LivestreamVideoUrl ? (
            <video
              ref={videoRef}
              controls
              className="w-full h-auto max-h-[80vh] rounded"
              poster={video.LivestreamThumbnail || ""}
            />
          ) : (
            <div className="bg-gray-800 rounded h-96 flex items-center justify-center">
              <p className="text-gray-400">Video không khả dụng</p>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-white font-semibold mb-2">
            {video.LivestreamTitle}
          </h3>
          <p className="text-gray-400 max-md:text-[12px] md:text-sm mb-3">
            {video.LivestreamDescription}
          </p>

          <div className="flex gap-6 max-md:text-[12px] md:text-sm text-gray-400">
            <div>
              <span className="text-gray-500">👁️ Lượt xem:</span>
              <span className="text-white ml-2">
                {video.LivestreamViewCount || 0}
              </span>
            </div>
            <div>
              <span className="text-gray-500">📅 Kết thúc:</span>
              <span className="text-white ml-2">
                {new Date(video.LivestreamEndedAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>

          {/* Video URL for debugging */}
          <div className="mt-3 p-2 bg-gray-800 rounded max-md:text-[10px] md:text-xs text-gray-500">
            <p className="truncate">S3 URL: {video.LivestreamVideoUrl}</p>
            {video.LivestreamVideoSignedUrl && (
              <p className="truncate">
                Signed URL: {video.LivestreamVideoSignedUrl}
              </p>
            )}
            <p className="truncate">Playing: {getHttpUrl(video)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
