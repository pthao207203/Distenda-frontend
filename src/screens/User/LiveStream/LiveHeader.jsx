import SearchBar from "../../PublishUser/Course/SearchBar";

const LiveHeader = ({ tab, setTab }) => {
  return (
    <div className="space-y-3">
      {/* Search */}
       <SearchBar />

      {/* Tabs */}
      <div className="flex gap-[1rem] text-[1.25rem] font-medium mb-4 mt-4 text-white">
        {["LiveNow", "LiveDone"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 border-b-2 ${
              tab === t
                ? "border-white font-semibold"
                : "border-transparent font-medium text-gray-400 "
            }`}
          >
            {t === "LiveNow" ? "Đang live" : "Đã xong"}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LiveHeader;
