import { type JSX } from "react";
import { InvalidIcon } from "../../../../../../../../../common/CustomIcon/components/InvalidIcon/invalidIcon";
import { PartiallyInvalidIcon } from "../../../../../../../../../common/CustomIcon/components/PartiallyInvalidIcon/partiallyInvalidIcon";
import { PartiallyValidIcon } from "../../../../../../../../../common/CustomIcon/components/PartiallyValidIcon/partiallyValidIcon";
import { ValidIcon } from "../../../../../../../../../common/CustomIcon/components/ValidIcon/validIcon";
import { Props } from "./entities";

export const Icon = ({ status }: Props): JSX.Element => {
  const { errorCount, valid, warningCount } = status;
  if (errorCount > 0) {
    if (warningCount > 0) {
      return <PartiallyInvalidIcon />;
    }
    return <InvalidIcon />;
  }
  if (!valid) {
    return <InvalidIcon />;
  }
  if (warningCount > 0) {
    return <PartiallyValidIcon />;
  }
  return <ValidIcon />;
};
