import {
  STATUS_BADGE_COLOR,
  StatusBadge,
} from "@databiosphere/findable-ui/lib/components/common/StatusBadge/statusBadge";
import { Fragment, JSX } from "react";
import { getDateFromIsoString } from "../../../../../../utils/date-fns";
import { Props } from "./types";

export const ReleaseDateCell = ({ publishedAt }: Props): JSX.Element => {
  if (publishedAt === null) {
    return <StatusBadge color={STATUS_BADGE_COLOR.INFO} label="Draft" />;
  }

  return <Fragment>{getDateFromIsoString(publishedAt)}</Fragment>;
};
