// AWS S3 and SNS Event Interfaces
// These interfaces define the structure of AWS events received via SNS notifications

export interface S3Object {
  eTag: string;
  key: string;
  size: number;
  versionId: string;
}

export interface S3EventRecord {
  eventName: string;
  eventSource: string;
  eventTime: string;
  eventVersion: string;
  s3: {
    bucket: {
      name: string;
    };
    object: S3Object;
    s3SchemaVersion: string;
  };
}

export interface S3Event {
  Records: S3EventRecord[];
}

export interface SNSMessage {
  Message: string;
  MessageId: string;
  Signature: string;
  SignatureVersion: string;
  SigningCertURL: string;
  Subject: string;
  Timestamp: string;
  TopicArn: string;
  Type: string;
}
