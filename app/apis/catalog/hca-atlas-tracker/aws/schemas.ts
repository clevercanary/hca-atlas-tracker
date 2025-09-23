import { array, boolean, InferType, number, object, string } from "yup";
import { INTEGRITY_STATUS } from "../common/entities";

// AWS S3 and SNS Event Validation Schemas
// These schemas validate the structure of AWS events received via SNS notifications

export const s3ObjectSchema = object({
  eTag: string().required(),
  key: string().required(),
  size: number().required(),
  versionId: string().nullable().optional(),
}).required();

export const s3BucketSchema = object({
  name: string().required(),
}).required();

export const s3RecordSchema = object({
  eventName: string().required(),
  eventSource: string().oneOf(["aws:s3"]).required(),
  eventTime: string().required(),
  s3: object({
    bucket: s3BucketSchema,
    object: s3ObjectSchema,
  }).required(),
}).required();

export const s3EventSchema = object({
  Records: array().of(s3RecordSchema).min(1).required(),
}).required();

export const snsMessageSchema = object({
  Message: string().required(),
  MessageId: string().required(),
  Signature: string().required(),
  SignatureVersion: string().required(),
  SigningCertURL: string().url().required(),
  Subject: string().optional(),
  SubscribeURL: string().url().optional(),
  Timestamp: string().required(),
  Token: string().optional(),
  TopicArn: string().required(),
  Type: string()
    .oneOf([
      "Notification",
      "SubscriptionConfirmation",
      "UnsubscribeConfirmation",
    ])
    .required(),
  UnsubscribeURL: string().url().optional(),
}).required();

// Dataset validator results schemas
// Validates the structure of validation results received via SNS notification

const datasetValidatorToolReportSchema = object({
  errors: array(string().required()).required(),
  finished_at: string().required(),
  started_at: string().required(),
  valid: boolean().required(),
  warnings: array(string().required()).required(),
});

const datasetValidatorToolReportsSchema = object({
  cap: datasetValidatorToolReportSchema.required(),
});

export const datasetValidatorResultsSchema = object({
  batch_job_id: string().required(),
  batch_job_name: string().defined().nullable(),
  bucket: string().required(),
  downloaded_sha256: string().defined().nullable(),
  error_message: string().defined().nullable(),
  file_id: string().required(),
  integrity_status: string()
    .oneOf(Object.values(INTEGRITY_STATUS))
    .defined()
    .nullable(),
  key: string().required(),
  metadata_summary: object({
    assay: array(string().required()).required(),
    cell_count: number().required(),
    disease: array(string().required()).required(),
    suspension_type: array(string().required()).required(),
    tissue: array(string().required()).required(),
    title: string().defined(),
  })
    .defined()
    .nullable(),
  source_sha256: string().defined().nullable(),
  status: string()
    .required()
    .oneOf(["failure", "success"] as const),
  timestamp: string().required(),
  tool_reports: datasetValidatorToolReportsSchema.defined().nullable(),
})
  .strict()
  .required();

// Type inference from Yup schemas

export type S3Object = InferType<typeof s3ObjectSchema>;
export type S3EventRecord = InferType<typeof s3RecordSchema>;
export type S3Event = InferType<typeof s3EventSchema>;
export type SNSMessage = InferType<typeof snsMessageSchema>;

export type DatasetValidatorToolReport = InferType<
  typeof datasetValidatorToolReportSchema
>;
export type DatasetValidatorToolReports = InferType<
  typeof datasetValidatorToolReportsSchema
>;
export type DatasetValidatorResults = InferType<
  typeof datasetValidatorResultsSchema
>;
