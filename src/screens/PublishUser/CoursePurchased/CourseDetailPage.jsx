import React, { useState, useEffect } from "react";
import CourseHeader from "./CourseHeader";
import CourseContent from "./CourseContent";
import CertificatePopup from "./CertificatePopup";
import { courseDetailController } from "../../../controllers/course.controller";
import Loading from "../../../components/Loading";
import { useParams } from "react-router-dom";
import Rating from "./Rating";

export default function CourseDetailPage() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const { CourseSlug } = useParams();

  useEffect(() => {
    async function fetchData(courseSlug) {
      const result = await courseDetailController(setLoading, courseSlug);
      if (result) {
        setData(result);
      }
    }

    if (CourseSlug) {
      fetchData(CourseSlug);
    }
  }, [CourseSlug]);

  if (loading) {
    return <Loading />;
  } else
    return (
      <div className="flex overflow-hidden flex-col">
        <CourseHeader {...data} onOpenCertificate={() => setShowCertificate(true)} />
        <div className="flex z-10 flex-col lg:px-[6rem] mt-0 w-full bg-white bg-opacity-10 min-h-screen max-lg:mt-0 max-lg:px-[20px] max-lg:max-w-full">
          <CourseContent {...data} />
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
