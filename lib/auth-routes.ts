export const DEFAULT_AUTH_NEXT = "/order";

export function getNextParam(searchParams: URLSearchParams | null): string {
  const next = searchParams?.get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return DEFAULT_AUTH_NEXT;
  }
  return next;
}

export function resolveAuthNext(params: { next?: string }): string {
  return getNextParam(params.next ? new URLSearchParams({ next: params.next }) : null);
}

export function appendNext(path: string, next: string): string {
  const url = new URL(path, "http://local");
  url.searchParams.set("next", next);
  return `${url.pathname}${url.search}`;
}
