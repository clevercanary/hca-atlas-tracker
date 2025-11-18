import { LinkProps } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { ComponentProps } from "react";
import { Chip } from "../../../../../common/Chip/chip";
import {
  CAP_INGEST_STATUS_COLOR,
  CAP_INGEST_STATUS_LABEL,
} from "../CAPIngestStatusCell/constants";
import { CAP_INGEST_STATUS } from "../CAPIngestStatusCell/entities";
import { Props } from "./entities";

/**
 * Returns chip props for the CAP status chip.
 * If `capIngestStatus` is present and equal to "NOT_REQUIRED",
 * returns a status chip using CAP ingest status color and label.
 * Otherwise, returns a generic TODO status chip.
 * @param props - CAP cell component props.
 * @returns Chip props appropriate for the CAP cell.
 */
function getChipProps(props: Props): ComponentProps<typeof Chip> {
  if ("capIngestStatus" in props) {
    // Get the CAP ingest status.
    const status = props.capIngestStatus;

    // Return a chip with the CAP ingest status "NOT_REQUIRED".
    if (status === CAP_INGEST_STATUS.NOT_REQUIRED) {
      return {
        color: CAP_INGEST_STATUS_COLOR[status],
        label: CAP_INGEST_STATUS_LABEL[status],
        variant: CHIP_PROPS.VARIANT.STATUS,
      };
    }
  }

  // Return a chip with label "TODO".
  return {
    color: CHIP_PROPS.COLOR.INFO,
    label: "TODO",
    variant: CHIP_PROPS.VARIANT.STATUS,
  };
}

/**
 * Returns the link props for the CAP cell.
 * If the CAP URL is available, returns a link with the CAP URL.
 * Otherwise, returns link with label as Chip and url as empty string.
 * @param props - CAP cell component props.
 * @returns Link props appropriate for the CAP cell.
 */
export function getLinkProps(props: Props): LinkProps {
  const { capUrl } = props;

  // Return link props with the CAP URL.
  if (capUrl) return { label: "CAP", url: capUrl };

  // Return link props with the chip.
  return {
    label: Chip(getChipProps(props)),
    url: "",
  };
}
