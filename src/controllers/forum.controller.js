import {
  getNewestPostsService,
  getDetailPostService,
  getMyPostsService,
  createPostService,
  updatePostService,
  deletePostService,
  reactToPostService,
  addCommentService,
  addReplyService,
} from "../services/forum.service";

// [GET] /forum/newest
export const getNewestPostsController = async (
  setSuccess,
  setError,
  setLoading,
) => {
  try {
    setLoading(true);
    const result = await getNewestPostsService();
    if (result.success) {
      setSuccess(result.data);
    } else {
      setError(result.message || "Lỗi không xác định");
    }
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};

// [GET] /forum/detail/:PostID
export const getDetailPostController = async (
  PostID,
  setSuccess,
  setError,
  setLoading,
) => {
  try {
    setLoading(true);
    const result = await getDetailPostService(PostID);
    if (result.success) {
      setSuccess(result.data);
    } else {
      setError(result.message || "Lỗi không xác định");
    }
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};

// [GET] /forum/my-posts
export const getMyPostsController = async (
  setSuccess,
  setError,
  setLoading,
  status = null,
) => {
  try {
    setLoading(true);
    const params = status ? { status } : {};
    const result = await getMyPostsService(params);
    if (result.success) {
      setSuccess(result.data);
    } else {
      setError(result.message || "Lỗi không xác định");
    }
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};

export const createPostController = async (formData, onSuccess, onError) => {
  try {
    const result = await createPostService(formData);

    if (result?.success) {
      onSuccess?.();
      // Có thể thêm toast hoặc alert ở đây nếu muốn
      alert("Đăng bài viết thành công!");
    } else {
      onError?.(result?.message || "Lỗi không xác định từ server");
    }
  } catch (err) {
    onError?.(err.message || "Có lỗi xảy ra khi kết nối server");
  }
};

// [PUT] /forum/:PostID/edit
export const updatePostController = async (
  PostID,
  formData,
  onSuccess,
  onError
) => {
  try {
    const result = await updatePostService(PostID, formData);

    if (result.success) {
      onSuccess(result.data);
    } else {
      onError(result.message || "Lỗi cập nhật bài viết");
    }
  } catch (err) {
    onError(err.message || "Lỗi cập nhật bài viết");
  }
};

// [DELETE] /forum/:PostID/delete
export const deletePostController = async (
  PostID,
  setSuccess,
  setError,
) => {
  try {
    const result = await deletePostService(PostID);
    if (result.success) {
      setSuccess("Xóa bài viết thành công!");
    } else {
      setError(result.message || "Lỗi không xác định");
    }
  } catch (err) {
    setError(err);
  }
};

// [POST] /forum/:PostID/react
export const reactToPostController = async (
  PostID,
  type,
  setSuccess,
  setError,
) => {
  try {
    const result = await reactToPostService(PostID, type);
    if (result.success) {
      setSuccess(result.data);
    } else {
      setError(result.message || "Lỗi không xác định");
    }
  } catch (err) {
    setError(err);
  }
};

// [POST] /forum/:PostID/comments
export const addCommentController = async (
  PostID,
  content,
  setSuccess,
  setError,
) => {
  try {
    const result = await addCommentService(PostID, content);
    if (result.success) {
      setSuccess(result.data);
    } else {
      setError(result.message || "Lỗi không xác định");
    }
  } catch (err) {
    setError(err);
  }
};

// [POST] /forum/:PostID/comments/:CommentID/replies
export const addReplyController = async (
  PostID,
  CommentID,
  content,
  setSuccess,
  setError,
) => {
  try {
    const result = await addReplyService(PostID, CommentID, content);
    if (result.success) {
      setSuccess(result.data);
    } else {
      setError(result.message || "Lỗi không xác định");
    }
  } catch (err) {
    setError(err);
  }
};
