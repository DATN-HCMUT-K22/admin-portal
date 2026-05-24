import { axiosInstance } from "./axios-instance";
import { AxiosError } from "axios";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type FetchOptions = {
  method?: string;
  body?: any;
  headers?: any;
  token?: string | null;
  [key: string]: any;
};

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = "GET", body, headers, token, ...rest } = options;

  try {
    const config = {
      method,
      url: path,
      data: body,
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...rest,
    };

    const response = await axiosInstance.request<T>(config);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(
        error.response?.data?.message || error.message || "Request failed",
        error.response?.status || 500,
        error.response?.data
      );
    }
    throw error;
  }
}
