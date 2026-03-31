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
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const apiRequest = async (path, options = {}, config = {}) => {
  const { skipRefresh = false } = config;
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

  const requestUrl = resolveApiUrl(path);
  let response = await fetch(requestUrl, requestOptions);

  if (
    response.status === 401 &&
    !skipRefresh &&
    path !== "/api/v1/users/refresh-token"
  ) {
    const refreshed = await tryRefreshToken();

    if (refreshed) {
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
