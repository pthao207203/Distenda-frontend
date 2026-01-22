import LiveCardActive from "./LiveCardActive";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LiveList = () => {
  const [liveNowList, setLiveNowList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLivestreams = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/livestreams/active`
        );
        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Backend response:", data);
        setLiveNowList(data.data || data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching livestreams:", error);
        setLoading(false);
      }
    };

    fetchLivestreams();
  }, []);
  if (!liveNowList || liveNowList.length === 0) {
    return (
      <div className="max-md:text-[14px] md:text-sm text-gray-400">
        Không có livestream đang diễn ra
      </div>
    );
  }
  console.log("liveNowList", liveNowList);
  return (
    <div
      className="
        grid 
        grid-cols-4 
        md:grid-cols-2
        gap-4
      "
    >
      {loading ? (
        <div className="text-center text-white">Đang tải livestream...</div>
      ) : (
        liveNowList.map((item) => (
          <div
            key={item._id || item.id}
            className="flex justify-start cursor-pointer"
            onClick={() => navigate(`/user/livestream/${item._id || item.id}`)}
          >
            <LiveCardActive item={item} />
          </div>
        ))
      )}
    </div>
  );
};

export default LiveList;
