import { MenuItem, Select } from "@mui/material";
import { UseSetLinkedAtlasSourceDatasets } from "../../../../../../views/AtlasSourceDatasetsView/hooks/useSetLinkedAtlasSourceDatasets";

enum DATASET_STATUS {
  IN_USE = "IN_USE",
  NOT_IN_USE = "NOT_IN_USE",
}

interface LinkDatasetDropdownProps {
  disabled: boolean;
  linked: boolean;
  onSetLinked: UseSetLinkedAtlasSourceDatasets["onSetLinked"];
  sourceDatasetId: string;
}

export const LinkDatasetDropdown = ({
  disabled,
  linked,
  onSetLinked,
  sourceDatasetId,
}: LinkDatasetDropdownProps): JSX.Element => {
  return (
    <Select
      defaultValue={linked ? DATASET_STATUS.IN_USE : DATASET_STATUS.NOT_IN_USE}
      disabled={disabled}
      onChange={(event) =>
        onSetLinked(
          sourceDatasetId,
          event.target.value === DATASET_STATUS.IN_USE
        )
      }
    >
      <MenuItem value={DATASET_STATUS.NOT_IN_USE}>Not in use</MenuItem>
      <MenuItem value={DATASET_STATUS.IN_USE}>In use</MenuItem>
    </Select>
  );
};
