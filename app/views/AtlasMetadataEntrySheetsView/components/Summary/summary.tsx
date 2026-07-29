import { Summary as BaseSummary } from "@/app/components/Entity/components/EntityView/components/Summary/summary";
import { useEntity } from "@/app/providers/entity/hook";
import { EntityData } from "@/app/views/AtlasMetadataEntrySheetsView/entities";
import { JSX } from "react";
import { SUMMARY_KEY_VALUES } from "./constants";
import { buildSummaryValues } from "./utils";

export const Summary = (): JSX.Element => {
  const { data } = useEntity();
  const { entrySheets = [] } = data as EntityData;
  const summary = buildSummaryValues(entrySheets);
  return (
    <BaseSummary summary={summary} summaryKeyValues={SUMMARY_KEY_VALUES} />
  );
};
