import { InvalidIcon } from "@/app/components/common/CustomIcon/components/InvalidIcon/invalidIcon";
import { PartiallyInvalidIcon } from "@/app/components/common/CustomIcon/components/PartiallyInvalidIcon/partiallyInvalidIcon";
import { PartiallyValidIcon } from "@/app/components/common/CustomIcon/components/PartiallyValidIcon/partiallyValidIcon";
import { ValidIcon } from "@/app/components/common/CustomIcon/components/ValidIcon/validIcon";
import { type JSX } from "react";
import { type Props } from "./entities";

export const ValidatorIcon = ({ status }: Props): JSX.Element => {
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
