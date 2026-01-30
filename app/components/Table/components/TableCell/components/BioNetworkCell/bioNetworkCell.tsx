import { JSX } from "react";
import { TypographyProps } from "@databiosphere/findable-ui/lib/components/common/Typography/common/entities";
import { NetworkKey } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  getBioNetworkByKey,
  getBioNetworkName,
} from "../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { NetworkIcon } from "../../../../../common/CustomIcon/components/NetworkIcon/networkIcon";
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
