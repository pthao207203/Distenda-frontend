import React, { useState, useEffect } from "react";
import CourseHeader from "./CourseHeader";
import CourseContent from "./CourseContent";
import CertificatePopup from "./CertificatePopup";
import { courseDetailController } from "../../../controllers/course.controller";
import { getVideoStatusController } from "../../../controllers/user.controller";
import { useParams } from "react-router-dom";
import Rating from "./Rating";

export default function CourseDetailPage() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [videoStatusList, setVideoStatusList] = useState({});
  const [lessonRateMap,   setLessonRateMap]   = useState({});
  const { CourseSlug } = useParams();

  useEffect(() => {
    if (!CourseSlug) return;
    (async () => {
      setLoading(true);
      try {
        // 1) Lấy chi tiết khóa học
        const detail = await courseDetailController(setLoading, CourseSlug);
        if (!detail) return;
        setData(detail);

        // 2) Lấy trạng thái video của khóa
        const statusData = await getVideoStatusController(detail._id);
        const vidList = {};
        const rateMap = {};
        statusData.lessons.forEach(({ lessonId, completionRate, videos }) => {
          rateMap[lessonId] = completionRate;
          videos.forEach(({ videoId, completed }) => {
            vidList[videoId] = completed ? 1 : 0;
          });
        });
        setVideoStatusList(vidList);
        setLessonRateMap(rateMap);

      } catch (err) {
        console.error("Error in CourseDetailPage:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [CourseSlug]);
  console.log("data", data);
  console.log("videoStatusList", videoStatusList);
  console.log("lessonRateMap", lessonRateMap);
  return (
    <>
      <Helmet>
        <title>{data ? data.CourseName : "Chi tiết khoá học"}</title>
      </Helmet>

      {loading && <LoadingPopup />}

      <div className="flex overflow-hidden flex-col">
        <CourseHeader {...data} onOpenCertificate={() => setShowCertificate(true)} />
        <div className="flex z-10 flex-col lg:px-[6rem] mt-0 w-full bg-white bg-opacity-10 min-h-screen max-lg:mt-0 max-lg:px-[20px] max-lg:max-w-full">
          <CourseContent
            {...data}
            videoStatusList={videoStatusList}
            lessonRateMap={lessonRateMap}
          />
          <Rating
            setLoading={setLoading}
            courseID={data?._id}
            courseReview={data?.CourseReview}
            has={data?.review}
          />
        </div>

        {/* Render popup ở cuối cùng */}
        {showCertificate && (
        <CertificatePopup
        userName={data?.user?.UserFullName || "Tên học viên"}
        courseName={data?.CourseName || "Tên khoá học"}
        instructorName={data?.intructor?.AdminFullName || "Tên giảng viên"}
        onClose={() => setShowCertificate(false)}
      />
      )}
      </div>
    );
}
