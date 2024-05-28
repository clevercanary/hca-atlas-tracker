import { InferType } from "yup";
import { taskCompletionDatesSchema } from "./schema";

export type TaskCompletionDatesData = InferType<
  typeof taskCompletionDatesSchema
>;
