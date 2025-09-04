const responseMap = new Map<string, unknown>();

function defaultJsonFor(url: string): unknown {
  if (url.includes("/index/catalogs")) {
    return { default_catalog: "dcp23" };
  }
  if (url.includes("/index/projects")) {
    return { hits: [], pagination: { next: undefined } };
  }
  return {};
}

const mockKy = jest.fn((url: string) => {
  return {
    arrayBuffer: jest.fn(async () => new ArrayBuffer(0)),
    blob: jest.fn(async () => new Blob()),
    json: jest.fn(async () => responseMap.get(url) ?? defaultJsonFor(url)),
    text: jest.fn(async () => ""),
  };
});

export function setKyJsonResponse(url: string, data: unknown): void {
  responseMap.set(url, data);
}

export function clearKyJsonResponses(): void {
  responseMap.clear();
}

export default mockKy;
export type { Options as KyOptions } from "ky";
