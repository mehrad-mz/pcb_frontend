export type ApiError = {
  status: number;
  data?: Record<string, unknown>;
  message?: string;
};

export function parseDjangoError(errorData: unknown): string {
  if (!errorData) return "خطای ناشناخته‌ای رخ داد.";

  if (typeof errorData === "string") return errorData;

  if (typeof errorData === "object" && errorData !== null) {
    const data = errorData as Record<string, unknown>;

    if (typeof data.detail === "string") return data.detail;
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;

    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const firstError = data[firstKey];
      if (Array.isArray(firstError) && typeof firstError[0] === "string") {
        return firstError[0];
      }
      if (typeof firstError === "string") return firstError;
    }
  }

  return "در پردازش درخواست خطایی رخ داد.";
}

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    return parseDjangoError((err as ApiError).data);
  }
  if (err && typeof err === "object" && "status" in err) {
    const apiErr = err as ApiError;
    if (apiErr.status === 0) return "ارتباط با سرور برقرار نشد.";
  }
  if (err instanceof Error) return err.message;
  return "خطایی رخ داد.";
}
