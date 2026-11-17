export interface SummarySegment {
  color: string;
  count: number;
  label: string;
}

export interface Props {
  segments: SummarySegment[];
}
