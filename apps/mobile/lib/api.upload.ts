import { Platform } from "react-native";

import { API_BASE } from "./api.constants";
import {
  ApiError,
  createApiErrorFromResponse,
  createNetworkError,
} from "./api.errors";
import { getToken } from "./api.token";
import { tryParseJson } from "./api.utils";

export type UploadableFile = {
  uri: string;
  name: string;
  type: string;
};

export async function uploadFile(
  endpoint: string,
  file: UploadableFile
): Promise<{ url: string }> {
  const token = await getToken();

  const formData = new FormData();
  if (Platform.OS === "web") {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    const uploadBlob = new File([blob], file.name, { type: blob.type || file.type });
    formData.append("file", uploadBlob);
  } else {
    // React Native FormData accepts a uri/name/type object instead of a File.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formData.append("file", { uri: file.uri, name: file.name, type: file.type } as any);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Do not set Content-Type manually; fetch adds the multipart boundary.
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text();
      const payload = text ? tryParseJson(text) : null;
      throw createApiErrorFromResponse(response.status, payload);
    }

    return response.json() as Promise<{ url: string }>;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    throw createNetworkError(err, "POST");
  }
}
