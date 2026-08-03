import { type InferType } from "yup";
import { type taskCompletionDatesSchema } from "./schema";

export type TaskCompletionDatesData = InferType<
  typeof taskCompletionDatesSchema
>;
