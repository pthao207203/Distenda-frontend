// [GET] /forum/newest
export const getNewestPostsService = async () => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/forum/newest`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Lấy bài viết mới nhất thất bại");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error.message;
  }
};

// [GET] /forum/detail/:PostID
export const getDetailPostService = async (PostID) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/forum/detail/${PostID}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Lấy chi tiết bài viết thất bại");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error.message;
  }
};

// [GET] /forum/my-posts
export const getMyPostsService = async () => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/forum/my-posts`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Lấy bài viết của tôi thất bại");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error.message;
  }
};

export const createPostService = async (formData) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/forum/create`,
      {
        method: "POST",
        body: formData,                  
        credentials: "include",            
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Tạo bài viết thất bại (${response.status})`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Lỗi khi gọi API tạo bài viết:", error);
    throw error; 
  }
};

// [PUT] /forum/:PostID/edit
export const updatePostService = async (PostID, data) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/forum/${PostID}/edit`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Cập nhật bài viết thất bại");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error.message;
  }
};

// [DELETE] /forum/:PostID/delete
export const deletePostService = async (PostID) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/forum/${PostID}/delete`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Xóa bài viết thất bại");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error.message;
  }
};

// [POST] /forum/:PostID/react
export const reactToPostService = async (PostID, type) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/forum/${PostID}/react`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Phản ứng thất bại");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error.message;
  }
};

// [POST] /forum/:PostID/comments
export const addCommentService = async (PostID, content) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/forum/${PostID}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Content: content }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Thêm bình luận thất bại");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error.message;
  }
};

// [POST] /forum/:PostID/comments/:CommentID/replies
export const addReplyService = async (PostID, CommentID, content) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/forum/${PostID}/comments/${CommentID}/replies`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Content: content }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Thêm phản hồi thất bại");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error.message;
  }
};