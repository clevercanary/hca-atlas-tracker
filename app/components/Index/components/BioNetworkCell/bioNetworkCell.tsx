import { NetworkKey } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  getBioNetworkByKey,
  getBioNetworkName,
} from "../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { NetworkIcon } from "../../../common/CustomIcon/components/NetworkIcon/networkIcon";
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
      <NetworkIcon networkKey={networkKey} />
      <div>{getBioNetworkName(name)}</div>
    </Cell>
  );
};
