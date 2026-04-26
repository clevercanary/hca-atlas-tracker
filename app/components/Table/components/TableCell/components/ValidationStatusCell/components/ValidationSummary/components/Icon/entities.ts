import { ValidatorSummaryStatus } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

export interface Props {
  status: Pick<ValidatorSummaryStatus, "errorCount" | "warningCount">;
}
