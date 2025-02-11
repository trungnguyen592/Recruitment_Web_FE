import { IBackendRes } from "@/types/backend";
import { Mutex } from "async-mutex";
import axiosClient from "axios";
import { store } from "@/redux/store";
import { setRefreshTokenAction } from "@/redux/slice/accountSlide";
interface AccessTokenResponse {
  access_token: string;
}

/**
 * Creates an initial 'axios' instance with custom settings.
 */

const instance = axiosClient.create({
  baseURL: import.meta.env.VITE_BACKEND_URL as string, //Đặt URL cơ bản cho mọi request từ file .env. Điều này giúp bạn không cần phải chỉ định URL đầy đủ mỗi khi gọi API.
  withCredentials: true,
});
// Đảm bảo rằng chỉ có một luồng xử lý refresh token tại một thời điểm. Điều này ngăn việc nhiều request đồng thời cố gắng làm mới token cùng lúc.
const mutex = new Mutex();
const NO_RETRY_HEADER = "x-no-retry";
//Nếu có nhiều tác vụ gọi handleRefreshToken đồng thời, Mutex sẽ đảm bảo rằng chỉ một tác vụ được thực thi trong vùng runExclusive. Các tác vụ khác sẽ phải chờ.
const handleRefreshToken = async (): Promise<string | null> => {
  return await mutex.runExclusive(async () => {
    const res = await instance.get<IBackendRes<AccessTokenResponse>>(
      "/api/v1/auth/refresh"
    );
    if (res && res.data) return res.data.access_token;
    else return null;
  });
};

//Trước khi gửi request, kiểm tra localStorage để lấy access_token và thêm nó vào header.
instance.interceptors.request.use(function (config) {
  if (
    typeof window !== "undefined" &&
    window &&
    window.localStorage &&
    window.localStorage.getItem("access_token")
  ) {
    config.headers.Authorization =
      "Bearer " + window.localStorage.getItem("access_token");
  }
  if (!config.headers.Accept && config.headers["Content-Type"]) {
    config.headers.Accept = "application/json";
    config.headers["Content-Type"] = "application/json; charset=utf-8";
  }
  return config;
});

/**
 * Handle all responses. It is possible to add handlers
 * for requests, but it is omitted here for brevity.
 */
instance.interceptors.response.use(
  //Xử lý thành công
  (res) => res.data,
  //Xử lý thất bại
  async (error) => {
    if (
      error.config &&
      error.response &&
      +error.response.status === 401 &&
      error.config.url !== "/api/v1/auth/login" &&
      !error.config.headers[NO_RETRY_HEADER]
    ) {
      const access_token = await handleRefreshToken();
      error.config.headers[NO_RETRY_HEADER] = "true";
      if (access_token) {
        error.config.headers["Authorization"] = `Bearer ${access_token}`;
        localStorage.setItem("access_token", access_token);
        return instance.request(error.config);
      }
    }

    if (
      error.config &&
      error.response &&
      +error.response.status === 400 &&
      error.config.url === "/api/v1/auth/refresh" &&
      location.pathname.startsWith("/admin")
    ) {
      const message =
        error?.response?.data?.message ?? "Có lỗi xảy ra, vui lòng login.";
      //dispatch redux action
      store.dispatch(setRefreshTokenAction({ status: true, message }));
    }

    return error?.response?.data ?? Promise.reject(error);
  }
);

/**
 * Token hết hạn (401):
Nếu gặp lỗi 401 và không phải API /login, nó sẽ gọi handleRefreshToken để lấy token mới.
Sau khi nhận token mới, nó sẽ cập nhật header Authorization và gửi lại request ban đầu.
Flag x-no-retry ngăn không cho interceptor thực hiện lại việc refresh token nhiều lần.

Lỗi 400 ở /refresh:
Khi refresh token thất bại (ví dụ token đã hết hạn hoàn toàn), kiểm tra nếu user đang ở trang /admin:
Gửi thông báo lỗi tới Redux thông qua setRefreshTokenAction.
Trả về lỗi:
Nếu không xử lý được lỗi, trả về error.response.data hoặc ném lỗi để hàm gọi request xử lý.

 * Replaces main `axios` instance with the custom-one.
 *
 * @param cfg - Axios configuration object.
 * @returns A promise object of a response of the HTTP request with the 'data' object already
 * destructured.
 */
// const axios = <T>(cfg: AxiosRequestConfig) => instance.request<any, T>(cfg);

// export default axios;

export default instance;
