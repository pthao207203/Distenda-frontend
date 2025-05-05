import React, { useState, useEffect } from "react";
import CourseHeader from "./CourseHeader";
import CourseContent from "./CourseContent";
import CertificatePopup from "./CertificatePopup";
import { courseDetailController } from "../../../controllers/course.controller";
import { getVideoStatusController, userMarkVideoCompletedController } from "../../../controllers/user.controller";
import { useParams } from "react-router-dom";
import Rating from "./Rating";
import { Helmet } from "react-helmet";
// import LoadingPopup from "../../../components/LoadingPopup";
import Loading from "../../../components/Loading";

export default function CourseDetailPage() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [videoStatusList, setVideoStatusList] = useState({});
  const [lessonRateMap, setLessonRateMap] = useState({});
  const [progressStatus, setProgressStatus] = useState(0);
  const { CourseSlug } = useParams();
  const [showCertificate, setShowCertificate] = useState(false);
  useEffect(() => {
    if (!CourseSlug) return;
    (async () => {
      setLoading(true);
      try {
        // Lấy chi tiết khóa học
        const detail = await courseDetailController(setLoading, CourseSlug);
        if (!detail) return;

        // Lấy tiến trình khóa học
        setData(detail);
        const uc = detail.user?.UserCourse?.find(
          (c) => c.CourseId === detail._id
        );
        setProgressStatus(uc?.CourseStatus ?? 0);

        // Lấy trạng thái video của khóa
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

  // 3) Đánh dấu hoàn thành
    const markVideoAsCompleted = async (videoId) => {
      if (!data) return;
      try {
        const resp = await userMarkVideoCompletedController({
          courseId: data._id,
          videoId,
        });
        if (resp) {
          setVideoStatusList((prev) => ({ ...prev, [videoId]: 1 }));
        }
      } catch (err) {
        console.error(err);
      }
    };
  console.log("video ", data);
  console.log("data", data);
  console.log("videoStatusList", videoStatusList);
  console.log("lessonRateMap", lessonRateMap);
  console.log("progressStatus", progressStatus);
  if (loading) return <Loading />;
  return (
    <>
      <Helmet>
        <title>{data ? data.CourseName : "Chi tiết khoá học"}</title>
      </Helmet>

      {/* {loading && <LoadingPopup />} */}

      <div className="flex overflow-hidden flex-col">
        <CourseHeader
          {...data}
          progressStatus={progressStatus}
          onOpenCertificate={() => setShowCertificate(true)}
        />
        <div className="flex z-10 flex-col lg:px-[6rem] mt-0 w-full bg-white bg-opacity-10 min-h-screen max-lg:mt-0 max-lg:px-[20px] max-lg:max-w-full">
          <CourseContent
            {...data}
            videoStatusList={videoStatusList}
            lessonRateMap={lessonRateMap}
            markVideoAsCompleted={markVideoAsCompleted}
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
    </>
  );
}
