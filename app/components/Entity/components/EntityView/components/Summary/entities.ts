// eslint-disable-next-line sonarjs/redundant-type-aliases -- track via #1365
type SummaryKey = string;

export interface SummaryProps {
  summary: Record<SummaryKey, number>;
  summaryKeyValues: [SummaryKey, string][];
}
