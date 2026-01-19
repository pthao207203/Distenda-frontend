import React, { useEffect, useMemo, useState } from "react";
import Hls from "hls.js";

// Thẻ dùng cho danh sách đang live: cố gắng chụp 1 frame từ stream nếu chưa có thumbnail
const LiveCardActive = ({ item }) => {
  const [snapshot, setSnapshot] = useState(item.thumbnail || null);

  const hlsUrl = useMemo(() => {
    if (!item?.LivestreamStreamKey) return null;
    return `http://localhost:8888/${item.LivestreamStreamKey}/index.m3u8`;
  }, [item?.LivestreamStreamKey]);

  // Nếu chưa có thumbnail, thử lấy một frame từ stream
  useEffect(() => {
    if (snapshot || !hlsUrl) return;

    let cancelled = false;
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;

    let hls;

    const captureFrame = () => {
      if (cancelled || !video.videoWidth || !video.videoHeight) return;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      if (!cancelled) setSnapshot(dataUrl);
    };

    const handleCanPlay = () => {
      // Cố gắng seek nhẹ để có frame
      if (video.duration && !isNaN(video.duration)) {
        video.currentTime = Math.min(1, Math.max(0, video.duration * 0.1));
      }
      captureFrame();
    };

    const handleError = () => {
      if (!cancelled) setSnapshot(null);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    if (Hls.isSupported()) {
      hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 0,
        maxBufferLength: 2,
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, () => handleError());
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
      video.load();
    }

    return () => {
      cancelled = true;
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      video.pause();
      if (hls) hls.destroy();
    };
  }, [snapshot, hlsUrl]);

  const displayThumb =
    snapshot || "https://distenda.vn/default-live-thumbnail.jpg";
  const avatar =
    item.createdBy?.UserId?.AdminAvatar ||
    "https://distenda.vn/default-avatar.jpg";

  return (
    <div className="w-full shrink-0 bg-white bg-opacity-10 overflow-hidden pl-[1.25rem] pt-[1.25rem] pb-[2.5rem] pr-[1rem] text-white">
      <div className="flex items-center gap-3 mb-[1.5rem]">
        <img
          src={avatar}
          alt="avatar"
          className="w-[4rem] h-[4rem] rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="max-md:text-[16px] md:text-[1.25rem] font-semibold mb-1">
            {item.createdBy?.UserId?.AdminFullName}
          </p>
          <p className="max-md:text-[14px] md:text-[1rem] text-white font-regular">
            {item.LivestreamStartedAt
              ? new Date(item.LivestreamStartedAt).toLocaleDateString(
                  "vi-VN",
                  {}
                )
              : ""}
          </p>
        </div>
      </div>

      <img
        alt={item.LivestreamTitle || "Ảnh"}
        src={displayThumb}
        className="w-full h-auto object-cover"
      />

      <h2 className="font-semibold max-md:text-[18px] md:text-[1.5rem] mt-[1rem]">
        {item.LivestreamTitle}
      </h2>

      <p className="max-md:text-[16px] md:text-[1.25rem] mt-[1rem]">
        {item.LivestreamDescription}
      </p>

      <div className="text-white flex justify-between mt-[1.5rem]">
        <div className="flex items-center gap-6 max-md:text-[16px] md:text-[1.25rem] text-white">
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="20"
              viewBox="0 0 21 20"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.82347 9.12312C3.22547 13.4851 8.76447 17.0121 10.2365 17.8851C11.7135 17.0031 17.2925 13.4371 18.6495 9.12712C19.5405 6.34112 18.7135 2.81212 15.4275 1.75312C13.8355 1.24212 11.9785 1.55312 10.6965 2.54512C10.4285 2.75112 10.0565 2.75512 9.78647 2.55112C8.42847 1.53012 6.65447 1.23112 5.03747 1.75312C1.75647 2.81112 0.932468 6.34012 1.82347 9.12312M10.2375 19.5011C10.1135 19.5011 9.99047 19.4711 9.87847 19.4101C9.56547 19.2391 2.19247 15.1751 0.395468 9.58112C-0.733532 6.05812 0.522469 1.63212 4.57747 0.325118C6.48147 -0.290882 8.55647 -0.019882 10.2345 1.03912C11.8605 0.0111181 14.0205 -0.272882 15.8865 0.325118C19.9455 1.63412 21.2055 6.05912 20.0785 9.58012C18.3395 15.1101 10.9125 19.2351 10.5975 19.4081C10.4855 19.4701 10.3615 19.5011 10.2375 19.5011"
                fill="white"
              />
            </svg>
            <span>{item.like || 0}</span>
          </div>

          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.10844 18.675C5.68844 18.675 6.23544 18.895 6.81444 19.128C10.3614 20.768 14.5564 20.022 17.2894 17.29C20.8954 13.682 20.8954 7.813 17.2894 4.207C15.5434 2.461 13.2214 1.5 10.7494 1.5C8.27644 1.5 5.95344 2.462 4.20844 4.208C1.47444 6.94 0.730437 11.135 2.35544 14.648C2.58944 15.227 2.81544 15.791 2.81544 16.377C2.81544 16.962 2.61444 17.551 2.43744 18.071C2.29144 18.499 2.07044 19.145 2.21244 19.287C2.35144 19.431 3.00144 19.204 3.43044 19.057C3.94544 18.881 4.52944 18.679 5.10844 18.675V18.675ZM10.7244 21.494C9.19644 21.494 7.65844 21.171 6.21944 20.505C5.79544 20.335 5.39844 20.175 5.11344 20.175C4.78544 20.177 4.34444 20.329 3.91844 20.476C3.04444 20.776 1.95644 21.15 1.15144 20.348C0.349437 19.545 0.719437 18.46 1.01744 17.587C1.16444 17.157 1.31544 16.713 1.31544 16.377C1.31544 16.101 1.18244 15.749 0.978437 15.242C-0.894563 11.197 -0.0285628 6.322 3.14844 3.147C5.17644 1.118 7.87544 0 10.7484 0C13.6214 0 16.3214 1.117 18.3494 3.146C22.5414 7.338 22.5414 14.158 18.3494 18.35C16.2944 20.406 13.5274 21.494 10.7244 21.494Z"
                fill="white"
              />
            </svg>
            <span>{item.comment || 0}</span>
          </div>

          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="17"
              viewBox="0 0 20 17"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.99987 5.64111C8.66987 5.64111 7.58887 6.72311 7.58887 8.05311C7.58887 9.38211 8.66987 10.4631 9.99987 10.4631C11.3299 10.4631 12.4119 9.38211 12.4119 8.05311C12.4119 6.72311 11.3299 5.64111 9.99987 5.64111ZM9.99987 11.9631C7.84287 11.9631 6.08887 10.2091 6.08887 8.05311C6.08887 5.89611 7.84287 4.14111 9.99987 4.14111C12.1569 4.14111 13.9119 5.89611 13.9119 8.05311C13.9119 10.2091 12.1569 11.9631 9.99987 11.9631Z"
                fill="white"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.56975 8.05226C3.42975 12.1613 6.56275 14.6043 9.99975 14.6053C13.4368 14.6043 16.5697 12.1613 18.4298 8.05226C16.5697 3.94426 13.4368 1.50126 9.99975 1.50026C6.56375 1.50126 3.42975 3.94426 1.56975 8.05226ZM10.0017 16.1053H9.99775H9.99675C5.86075 16.1023 2.14675 13.2033 0.06075 8.34826C-0.02025 8.15926 -0.02025 7.94526 0.06075 7.75626C2.14675 2.90226 5.86175 0.00326172 9.99675 0.000261719C14.1388 0.00326172 17.8527 2.90226 19.9387 7.75626C20.0208 7.94526 20.0208 8.15926 19.9387 8.34826C17.8537 13.2033 14.1388 16.1023 10.0028 16.1053H10.0017Z"
                fill="white"
              />
            </svg>
            <span>{item.view || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCardActive;
