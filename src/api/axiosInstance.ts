import axios, { type AxiosRequestConfig } from "axios";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  path?: string;
  statusCode?: number;
}

export const AXIOS_INSTANCE = axios.create({
  baseURL: "/api",
});

// Large file transfers must not be killed by the default 4 s request timeout.
export const FILE_TRANSFER_OPTIONS: AxiosRequestConfig = { timeout: 0 };

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data !== undefined && "success" in response.data) {
      const apiResponse: ApiResponse<unknown> = response.data;
      return apiResponse.data;
    }
    return response.data;
  },
  (error) => {
    // Handle errors globally if you wish
    return Promise.reject(error);
  },
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
    timeout: options?.timeout ?? 4000,
    headers: {
      ...(config.headers ?? {}),
      ...(options?.headers ?? {}),
    },
  }).then((response) => response as T);

  // @ts-expect-error
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};
