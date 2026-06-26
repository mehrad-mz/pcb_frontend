export type ApiError = {
  status: number;
  data?: Record<string, unknown>;
  message?: string;
};

const AUTH_ERROR_TRANSLATIONS: Record<string, string> = {
  "Invalid or expired OTP.": "کد تأیید نادرست یا منقضی شده است.",
  "OTP has expired.": "کد تأیید منقضی شده است.",
  "Too many failed attempts. Try again later.":
    "تعداد تلاش‌های ناموفق زیاد است. لطفاً بعداً دوباره تلاش کنید.",
  "Invalid phone or password.": "شماره موبایل یا رمز عبور نادرست است.",
  "Phone and password are required.": "شماره موبایل و رمز عبور الزامی است.",
  "Invalid credentials": "اطلاعات ورود نادرست است.",
  "phone and method are required.": "شماره موبایل و روش ورود الزامی است.",
  "phone number is not valid format": "فرمت شماره موبایل معتبر نیست.",
};

export function translateAuthError(message: string): string {
  const trimmed = message.trim();
  return AUTH_ERROR_TRANSLATIONS[trimmed] ?? message;
}

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
    return translateAuthError(parseDjangoError((err as ApiError).data));
  }
  if (err && typeof err === "object" && "status" in err) {
    const apiErr = err as ApiError;
    if (apiErr.status === 0) return "ارتباط با سرور برقرار نشد.";
  }
  if (err instanceof Error) return translateAuthError(err.message);
  return "خطایی رخ داد.";
}
