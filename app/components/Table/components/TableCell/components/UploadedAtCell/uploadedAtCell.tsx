import { formatISOToUTCDateTime } from "@/app/utils/date-fns";
import { type JSX } from "react";
import { type Props } from "./types";

export const UploadedAtCell = ({
  fileEventTime,
}: Props): JSX.Element | null => {
  const parts = formatISOToUTCDateTime(fileEventTime);
  if (!parts) return null;
  const [date, time] = parts;
  return (
    <div>
      <div>{date}</div>
      <div>{time}</div>
    </div>
  );
};
