import { bannerService } from '../services/banner.service';

export async function bannerController() {
  try {
    const result = await bannerService(); // Gọi API
    // console.log("result admin ", result);
    return result;
  } catch (err) {
    console.error(err); // Ghi log lỗi
  }
}