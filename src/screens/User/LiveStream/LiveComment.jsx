import { useEffect, useRef, useState } from "react";

const LiveComment = () => {
    const [comments, setComments] = useState([
        {
            id: 1,
            user: "Xuyên Nguyễn",
            time: "19:03",
            text: "Xin chào bạn, hôm nay cây trồng của bạn vẫn rất tốt, nhưng hãy chú ý lượng nước nhé. Nhắn để xem cụ thể nhé!",
        },
        {
            id: 2,
            user: "Bạn",
            time: "19:03",
            text: "Xin chào bạn, hôm nay cây trồng của bạn vẫn rất tốt, nhưng hãy chú ý lượng nước nhé. Nhắn để xem cụ thể nhé!",
        },
    ]);

    const [text, setText] = useState("");
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    const send = () => {
        if (!text.trim()) return;
        setComments((p) => [
            ...p,
            {
                id: Date.now(),
                user: "Bạn",
                time: "19:03",
                text,
            },
        ]);
        setText("");
    };

    return (
        <div className="h-full md:max-w-[300px] max-md:w-full max-md:mb-[24px] flex flex-col text-white">
            {/* Header */}
            <div className="flex flex-col text-[1.5rem] font-medium mb-4 text-white ">
                <div className="p-[0.625rem] bg-white bg-opacity-50 max-w-fit rounded-[0.5rem] sticky top-0">
                    Bình luận
                </div>
            </div>

            {/* Comment list */}
            <div className="flex-1 overflow-y-auto ">
                {comments.map((c) => (
                    <div key={c.id} className="flex gap-2 mb-4">
                        {/* Avatar giả */}
                        <div className="w-[1.875rem] h-[1.875rem] bg-white rounded-full mr-2" />

                        <div className="max-w-[85%]">
                            <div className="text-medium text-[1.125rem] text-white mb-2">
                                {c.user === "Bạn" ? "Bạn" : c.user} {c.time}
                            </div>

                            <div
                                className={`text-regular text-[1.125rem] leading-relaxed
                                ${c.user === "Bạn" ? "bg-[#FFFFFF] bg-opacity-25 px-3 py-2 " : ""}`}
                            >
                                {c.text}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-[1.5rem] bg-white rounded-[8px] flex items-center ">
                <div className="flex flex-col items-start w-full">
                    <input
                        type="text"
                        className="flex-1 border-none rounded-[8px] outline-none bg-white text-black w-full"
                        placeholder="Nhập bình luận..."

                    />
                </div>
                <button
                    className="bg-black text-white rounded-lg"
                >
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
                </button>
            </div>
        </div>
    );
};

export default LiveComment;
