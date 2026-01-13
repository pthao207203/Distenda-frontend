import LiveCard from "./LiveCard";

const LiveList = ({ data }) => {
  return (
    <div
      className="
        grid 
        grid-cols-4 
        md:grid-cols-2
        gap-4
      "
    >
      {data.map((item) => (
        <div key={item.id} className="flex justify-start">
          <LiveCard item={item} />
        </div>
      ))}
    </div>
  );
};

export default LiveList;
