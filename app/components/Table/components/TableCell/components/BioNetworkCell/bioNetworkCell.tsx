import { type NetworkKey } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { NetworkIcon } from "@/app/components/common/CustomIcon/components/NetworkIcon/networkIcon";
import {
  getBioNetworkByKey,
  getBioNetworkName,
} from "@/app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { type TypographyProps } from "@databiosphere/findable-ui/lib/components/common/Typography/common/entities";
import { type JSX } from "react";
import { Cell } from "./bioNetworkCell.styles";

export interface BioNetworkCellProps {
  networkKey: NetworkKey;
  TypographyProps?: TypographyProps;
}

export const BioNetworkCell = ({
  networkKey,
  TypographyProps,
}: BioNetworkCellProps): JSX.Element => {
  const name = getBioNetworkByKey(networkKey)?.name ?? networkKey;
  return (
    <Cell component="div" {...TypographyProps}>
      <NetworkIcon networkKey={networkKey} />
      <div>{getBioNetworkName(name)}</div>
    </Cell>
  );
};
