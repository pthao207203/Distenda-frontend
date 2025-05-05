import * as React from "react";
import { Link } from "react-router-dom";
import { CircularProgressbar } from "react-circular-progressbar";
import { useMediaQuery } from "react-responsive";

export default function CourseLesson({ markVideoAsCompleted,courseSlug,videoStatusList,completionRate, ...lesson }) {
  const videos = lesson.video;
  const percentage = Math.round(completionRate * 100);
  const isMobile = useMediaQuery({ maxWidth: 1024 });
  const textSize = isMobile ? "20px" : "2.5rem";
  return (
    <div className="flex flex-col overflow-hidden grow shrink self-start my-auto w-full  bg-neutral-900 text-white">
      <div className="flex gap-3 items-center justify-between px-5 py-4 w-full text-[1.25rem] max-lg:text-[16px] font-medium leading-5 text-white bg-neutral-900 min-h-[3.75rem] max-lg:max-w-full">
        <div className="flex-1 shrink gap-2.5 self-stretch my-auto w-full">
          {lesson.LessonName}
        </div>
        <div className="lg:w-[3.25rem] lg:h-[3.25rem] w-[32px] h-[32px] flex justify-center ">
          <CircularProgressbar
            value={percentage}
            text={`${percentage}%`}
            styles={{
              path: {
                stroke: "#CFF500", // Màu của đường tiến trình
                strokeLinecap: "round",
                strokeWidth: 8, // Độ dày đường viền
              },
              trail: {
                stroke: "#EBF1F9", // Màu đường nền
              },
              text: {
                fill: "#EBF1F9", // Màu chữ
                fontSize: textSize, // Kích thước chữ
                fontWeight: "semibold",
                textAlign: "center",
                dominantBaseline: "middle",
                textAnchor: "middle",
              },
            }}
          />
        </div>
      </div>
      <div className="flex flex-col w-full leading-none bg-white max-lg:max-w-full">
        <div className="flex flex-col px-5 py-2 w-full text-[1.25rem] max-lg:text-[14px] text-black max-lg:max-w-full">
          {videos &&
            videos.length > 0 &&
            videos.map((topic, index) => (
              <Link
                to={`/courses/CoursePurchased/${courseSlug}/${topic.VideoSlug}`}
                onClick={() => markVideoAsCompleted(topic._id)}
                key={index}
                className="flex gap-3 items-center justify-between px-3 lg:py-3 w-full bg-white bg-opacity-10 max-lg:py-[1rem] hover:text-[#CDD5DF] transition"
              >
                <div className="gap-2.5 my-auto">{topic.VideoName}</div>
                <img
                loading="lazy"
                src={
                  videoStatusList[topic._id] === 1
                    ? "/Icon/done.svg"
                    : "/Icon/undone.svg"
                }
                alt={videoStatusList[topic._id] === 1 ? "Completed" : "Not Completed"}
                className="lg:w-[1.875rem] lg:h-[1.875rem] w-[14px] h-[14px]" 
              />
              </Link>
            ))}
        </div>
        {lesson.exercise && (
          <Link
            to={`/courses/CoursePurchased/${courseSlug}/CourseCode/${lesson.exercise.ExerciseSlug}`}
            className="flex items-start lg:py-2 px-5 max-lg:py-[16px] w-full text-lg max-lg:text-[14px] font-semibold bg-[#CDD5DF] text-neutral-900 max-lg:max-w-full hover:text-white transition"
          >
            <div className="flex flex-1 shrink gap-3 items-center p-3 basis-0 min-w-[15rem]">
              <div className="gap-2.5 self-stretch my-auto">Bài tập</div>
            </div>
            <div className="flex gap-3 items-center p-3">
              <div className="gap-2.5 self-stretch my-auto">Điểm: 0.0</div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
