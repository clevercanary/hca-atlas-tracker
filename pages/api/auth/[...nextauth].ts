import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import { nextAuthOptions } from "../../../site-config/hca-atlas-tracker/local/authentication/next-auth-config";

const handler = (req: NextApiRequest, res: NextApiResponse): void =>
  NextAuth(req, res, nextAuthOptions);

export default handler;
