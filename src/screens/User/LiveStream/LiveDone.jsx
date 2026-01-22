import LiveCard from "./LiveCard";
import { useEffect, useState } from "react";

const LiveDone = () => {
  const [liveDoneList, setLiveDoneList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLivestreams = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/livestreams/completed`
        );
        const data = await response.json();
        setLiveDoneList(data.data || data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching livestreams:", error);
        setLoading(false);
      }
    };

    fetchLivestreams();
  }, []);

  console.log("liveDoneList", liveDoneList);
  return (
    <>
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
          liveDoneList.map((item) => (
            <div key={item._id} className="w-full flex justify-start">
              <LiveCard item={item} />
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default LiveDone;
