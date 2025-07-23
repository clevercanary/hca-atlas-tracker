type SummaryKey = string;

export interface SummaryProps {
  summary: Record<SummaryKey, number>;
  summaryKeyValues: [SummaryKey, string][];
}
