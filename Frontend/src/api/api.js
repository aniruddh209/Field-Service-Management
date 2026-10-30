import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5179/api",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/Auth/login") || originalRequest.url?.includes("/Auth/refresh")) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const storedUserRaw = localStorage.getItem("authUser");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!storedUserRaw || !refreshToken) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authUser");
        return Promise.reject(error);
      }

      let userId;
      try {
        const userObj = JSON.parse(storedUserRaw);
        userId = userObj.id || userObj.userId;
      } catch {
        userId = null;
      }

      if (!userId) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authUser");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/Auth/refresh`,
          {
            userId: Number(userId),
            refreshToken: refreshToken
          },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken = refreshResponse.data?.accessToken || refreshResponse.data?.data?.accessToken;
        const newRefreshToken = refreshResponse.data?.refreshToken || refreshResponse.data?.data?.refreshToken;

        if (newAccessToken && newRefreshToken) {
          localStorage.setItem("authToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return api(originalRequest);
        } else {
          throw new Error("Invalid refresh payload");
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authUser");
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;