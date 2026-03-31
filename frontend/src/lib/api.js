const readPayload = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

let refreshPromise = null;
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
const ACCESS_TOKEN_STORAGE_KEY = "videotube.accessToken";
const REFRESH_TOKEN_STORAGE_KEY = "videotube.refreshToken";

const readStorageValue = (key) => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(key) || "";
};

const writeStorageValue = (key, value) => {
  if (typeof window === "undefined") {
    return;
  }

  if (value) {
    window.localStorage.setItem(key, value);
    return;
  }

  window.localStorage.removeItem(key);
};

const getStoredAccessToken = () => readStorageValue(ACCESS_TOKEN_STORAGE_KEY);
const getStoredRefreshToken = () => readStorageValue(REFRESH_TOKEN_STORAGE_KEY);

export const setAuthTokens = ({ accessToken = "", refreshToken = "" } = {}) => {
  writeStorageValue(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  writeStorageValue(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
};

export const clearAuthTokens = () => {
  writeStorageValue(ACCESS_TOKEN_STORAGE_KEY, "");
  writeStorageValue(REFRESH_TOKEN_STORAGE_KEY, "");
};

const resolveApiUrl = (path) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!apiBaseUrl) {
    return path;
  }

  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const tryRefreshToken = async () => {
  if (!refreshPromise) {
    refreshPromise = fetch(resolveApiUrl("/api/v1/users/refresh-token"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: getStoredRefreshToken(),
      }),
    })
      .then(async (response) => {
        const payload = await readPayload(response);

        if (!response.ok) {
          clearAuthTokens();
          return null;
        }

        const accessToken = payload?.data?.accessToken || "";
        const refreshToken = payload?.data?.refreshToken || getStoredRefreshToken();

        setAuthTokens({ accessToken, refreshToken });

        return accessToken;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const apiRequest = async (path, options = {}, config = {}) => {
  const { skipRefresh = false } = config;
  const accessToken = getStoredAccessToken();
  const requestOptions = {
    method: options.method || "GET",
    credentials: "include",
    headers: {
      ...(options.headers || {}),
    },
  };

  if (options.body !== undefined) {
    if (options.body instanceof FormData) {
      requestOptions.body = options.body;
    } else {
      requestOptions.body = JSON.stringify(options.body);
      requestOptions.headers["Content-Type"] =
        requestOptions.headers["Content-Type"] || "application/json";
    }
  }

  if (accessToken && !requestOptions.headers.Authorization) {
    requestOptions.headers.Authorization = `Bearer ${accessToken}`;
  }

  const requestUrl = resolveApiUrl(path);
  let response = await fetch(requestUrl, requestOptions);

  if (
    response.status === 401 &&
    !skipRefresh &&
    path !== "/api/v1/users/refresh-token"
  ) {
    const refreshedAccessToken = await tryRefreshToken();

    if (refreshedAccessToken) {
      requestOptions.headers.Authorization = `Bearer ${refreshedAccessToken}`;
      response = await fetch(requestUrl, requestOptions);
    }
  }

  const payload = await readPayload(response);

  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};
