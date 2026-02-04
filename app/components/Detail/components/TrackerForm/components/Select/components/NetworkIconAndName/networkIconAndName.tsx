import { JSX } from "react";
import { Typography as MTypography } from "@mui/material";
import { Network } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { NetworkIcon } from "../../../../../../../common/CustomIcon/components/NetworkIcon/networkIcon";
import { NetworkItem } from "./networkIconAndName.styles";

interface NetworkIconAndNameProps {
  networkKey: Network["key"];
  networkName: Network["name"];
}

export const NetworkIconAndName = ({
  networkKey,
  networkName,
}: NetworkIconAndNameProps): JSX.Element => {
  return (
    <NetworkItem>
      <NetworkIcon networkKey={networkKey} />
      <MTypography component="span" noWrap variant="inherit">
        {networkName}
      </MTypography>
    </NetworkItem>
  );
};
