import { JSX } from "react";
import { Summary as BaseSummary } from "../../../../components/Entity/components/EntityView/components/Summary/summary";
import { useEntity } from "../../../../providers/entity/hook";
import { EntityData } from "../../entities";
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
