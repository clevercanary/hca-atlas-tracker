const mockKy = jest.fn().mockReturnValue({
  arrayBuffer: jest.fn(),
  blob: jest.fn(),
  json: jest.fn(),
  text: jest.fn(),
});

export default mockKy;
export type { Options as KyOptions } from "ky";
