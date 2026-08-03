import ky, { type Options, type ResponsePromise } from "ky";

export type HttpGetOptions = Options;

export function httpGet(
  url: string,
  options?: HttpGetOptions,
): ResponsePromise {
  return ky.get(url, options);
}
