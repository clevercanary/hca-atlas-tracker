import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import { METHOD } from "../app/common/entities";
import { endPgPool } from "../app/services/database";
import tasksHandler from "../pages/api/tasks";
import {
  USER_CONTENT_ADMIN,
  USER_STAKEHOLDER,
  USER_UNREGISTERED,
} from "../testing/constants";
import { TestUser } from "../testing/entities";
import { resetDatabase } from "../testing/utils";

jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/services/user-profile");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe("/api/me", () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (await doTasksRequest(USER_STAKEHOLDER, METHOD.POST))._getStatusCode()
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect((await doTasksRequest())._getStatusCode()).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect((await doTasksRequest(USER_UNREGISTERED))._getStatusCode()).toEqual(
      403
    );
  });

  // TODO tasks for response content

  it("returns status 200 for user with STAKEHOLDER role", async () => {
    expect((await doTasksRequest(USER_STAKEHOLDER))._getStatusCode()).toEqual(
      200
    );
  });

  it("returns status 200 for user with CONTENT_ADMIN role", async () => {
    expect((await doTasksRequest(USER_CONTENT_ADMIN))._getStatusCode()).toEqual(
      200
    );
  });
});

async function doTasksRequest(
  user?: TestUser,
  method = METHOD.GET
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
  });
  await tasksHandler(req, res);
  return res;
}
