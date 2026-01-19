// [GET] /livestreams/active
export const getActiveLivestreams = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/livestreams/active`, {
      method: 'GET',
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error('Lỗi khi lấy danh sách livestream!');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw new Error(error);
  }
};

// [GET] /livestreams/:LivestreamID
export const getLivestreamDetail = async (livestreamId) => {
  try {
    console.log("livestreamId", livestreamId)
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/livestreams/${livestreamId}`, {
      method: 'GET',
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error('Lỗi khi lấy thông tin livestream!');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw new Error(error);
  }
};
