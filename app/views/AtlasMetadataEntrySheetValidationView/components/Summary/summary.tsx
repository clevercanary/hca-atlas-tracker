import { Summary as BaseSummary } from "../../../../components/Entity/components/EntityView/components/Summary/summary";
import { useEntity } from "../../../../providers/entity/hook";
import { EntityData } from "../../entities";
import { SUMMARY_KEY_VALUES } from "./constants";
import { buildSummaryValues } from "./utils";

export const Summary = (): JSX.Element | null => {
  const { data } = useEntity();

  // Coerce the entity data provided by EntityProvider to the EntityData type -- safe to assume that the data structure conforms to EntityData.
  const entityData = data as EntityData;

  const summary = buildSummaryValues(
    entityData.entrySheetValidation?.validationSummary
  );

  if (!summary) return null;

  return (
    <BaseSummary summary={summary} summaryKeyValues={SUMMARY_KEY_VALUES} />
  );
};
