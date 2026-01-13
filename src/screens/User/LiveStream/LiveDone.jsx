import LiveCard from "./LiveCard";

const LiveDone = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-gray-400">
        Chưa có livestream đã kết thúc
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto">
      {data.map((item) => (
        <LiveCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default LiveDone;
