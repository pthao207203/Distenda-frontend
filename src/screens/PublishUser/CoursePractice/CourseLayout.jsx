import React, { useState, useEffect } from "react";
import NavigationBar from "./Navigation";
import LessonList from "./LessonList";
import CodeEditor from "./CodeEditor";
import { useParams } from "react-router-dom";
import { videoController } from "../../../controllers/video.controller";
import {
  userMarkVideoCompletedController,
  getVideoStatusController,
} from "../../../controllers/user.controller";
import { Helmet } from "react-helmet";
import LoadingPopup from "../../../components/LoadingPopup";

function CourseLayout() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const { VideoSlug } = useParams();
  const [videoStatusList, setVideoStatusList] = useState({});
  const [lessonRateMap, setLessonRateMap] = useState({});

  // 1) Lấy trạng thái video & tỉ lệ hoàn thành từng lesson
  const fetchVideoStatuses = async (courseId) => {
    try {
      const statusData = await getVideoStatusController(courseId);
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
      console.error("Error fetching video statuses:", err);
    }
  };

  // 2) Khi VideoSlug thay đổi, load detail + status
  useEffect(() => {
    if (!VideoSlug) return;
    (async () => {
      setLoading(true);
      try {
        const detail = await videoController(setLoading, VideoSlug);
        setData(detail);
        await fetchVideoStatuses(detail.course._id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [VideoSlug]);

  // 3) Đánh dấu hoàn thành
  const markVideoAsCompleted = async (videoId) => {
    if (!data) return;
    try {
      const resp = await userMarkVideoCompletedController({
        courseId: data.course._id,
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

  return (
    <>
      <Helmet>
        <title>{data ? data.VideoName : "Bài học"}</title>
      </Helmet>

      {loading && <LoadingPopup />}
      <div className="flex flex-col bg-neutral-900">
        <NavigationBar {...data} />
        <div className="flex flex-col w-full max-md:max-w-full h-full">
          <div className="flex overflow-hidden flex-wrap flex-1 gap-1.5 justify-center bg-white bg-opacity-10 size-full max-md:max-w-full">
            {data && data.course && (
              <>
                <div className="flex flex-col overflow-y-auto h-[calc(100vh-10rem)] max-w-[28rem] lg:block max-lg:hidden">
                  <LessonList
                    course={data.course}
                    videoKey={data._id}
                    videoStatusList={videoStatusList}
                    lessonRateMap={lessonRateMap}
                    markVideoAsCompleted={markVideoAsCompleted}
                  />
                </div>
                <CodeEditor {...data} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseLayout;
