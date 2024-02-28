import { StaticImage } from "@clevercanary/data-explorer-ui/lib/components/common/StaticImage/staticImage";
import { NETWORK_ICONS } from "../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { NetworkKey } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  getBioNetworkByKey,
  getBioNetworkName,
} from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { Cell } from "./bioNetworkCell.styles";

export interface BioNetworkCellProps {
  networkKey: NetworkKey;
}

export const BioNetworkCell = ({
  networkKey,
}: BioNetworkCellProps): JSX.Element => {
  const name = getBioNetworkByKey(networkKey)?.name ?? networkKey;
  return (
    <Cell>
      <StaticImage alt={name} height={24} src={NETWORK_ICONS[networkKey]} />
      <div>{getBioNetworkName(name)}</div>
    </Cell>
  );
};
