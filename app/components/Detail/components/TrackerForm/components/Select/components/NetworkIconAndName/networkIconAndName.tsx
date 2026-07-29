import { Network } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { NetworkIcon } from "@/app/components/common/CustomIcon/components/NetworkIcon/networkIcon";
import { Typography as MTypography } from "@mui/material";
import { JSX } from "react";
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
