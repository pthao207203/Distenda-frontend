import * as React from "react";
import { Link } from "react-router-dom";
import { CircularProgressbar } from "react-circular-progressbar";

function LessonCard({
  lessonId,
  lessonName,
  videos,
  exerciseSlug,

  videoKey,
  courseSlug,
  videoStatusList,
  completionRate,
  markVideoAsCompleted,
}) {
  const percentage = Math.round((completionRate ?? 0) * 100);
  return (
    <div className="flex overflow-hidden flex-col w-full text-xl max-lg:text-[14px]">
      <div className="flex gap-3 items-center px-3 py-4 w-full font-medium leading-5 text-white bg-neutral-900 min-h-[60px]">
        <div className="flex-1 shrink gap-2.5 self-stretch my-auto w-full max-w-[28rem]">
        {lessonName}
        </div>
        <div className="lg:w-[3.25rem] lg:h-[3.25rem] flex justify-center ">
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
                fontSize: "2.5rem", // Kích thước chữ
                fontWeight: "semibold",
                textAlign: "center",
                dominantBaseline: "middle",
                textAnchor: "middle",
              },
            }}
          />
        </div>
      </div>
      <div className="flex flex-col justify-center w-full text-black bg-white">
        <div className="flex flex-col  w-full">
        {videos.map(video => (
              <Link
                to={`/courses/CoursePurchased/${courseSlug}/${video.VideoSlug}`}
                key={video._id}
                className={`flex gap-3 items-center justify-between px-4 py-3 w-full hover:text-[#CDD5DF] ${
                  video._id === videoKey ? "bg-[#EBF1F9]" : "bg-white"
                }`}
                onClick={() => markVideoAsCompleted(video._id)}
              >
                <div className="gap-2.5 self-stretch my-auto leading-snug">
                {video.VideoName}
                </div>
                <img
              src={
                videoStatusList[video._id] === 1
                  ? "/Icon/done.svg"
                  : "/Icon/undone.svg"
              }
              alt={
                videoStatusList[video._id] === 1
                  ? "Completed"
                  : "Not Completed"
              }
              className="w-[1.875rem] h-[1.875rem]"
              loading="lazy"
            />
              </Link>
            ))}
        </div>
      </div>
      {exerciseSlug && (
        <Link
          to={`/courses/CoursePurchased/:CourseSlug/CourseCode/${exerciseSlug}`}
          className="flex items-start py-2.5 w-full text-lg max-lg:text-[14px] font-semibold bg-slate-300 text-neutral-900"
        >
          <div className="flex flex-1 shrink gap-3 items-center p-2 basis-0">
            <div className="gap-2.5 self-stretch my-auto">Bài tập</div>
          </div>
          <div className="flex gap-3 items-center p-2">
            <div className="gap-2.5 self-stretch my-auto">Điểm: 0.0</div>
          </div>
        </Link>
      )}
    </div>
  );
}

function LessonList({
  course,
  videoKey,
  videoStatusList,
  lessonRateMap,
  markVideoAsCompleted,
}) {
  const lessons = Object.values(course.lesson || {});
  return (
    <div className="flex flex-col min-w-[12.5rem]">
      {lessons &&
        lessons.length > 0 &&
        lessons.map((lesson, index) => (
          <LessonCard
          key={lesson._id}

          // Props của lesson
          lessonId={lesson._id}
          lessonName={lesson.LessonName}
          videos={lesson.video || []}
          exerciseSlug={lesson.exercise?.ExerciseSlug}

          // Props chung từ parent
          videoKey={videoKey}
          courseSlug={course.CourseSlug}
          videoStatusList={videoStatusList}
          completionRate={lessonRateMap[lesson._id] ?? 0}
          markVideoAsCompleted={markVideoAsCompleted}
          />
        ))}
    </div>
  );
}

export default LessonList;
