import { MenuItem as MMenuItem } from "@mui/material";
import { forwardRef, ReactNode } from "react";
import { NETWORKS } from "../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { isNetworkKey } from "../../../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { getBioNetworkByKey } from "../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import {
  Select,
  SelectProps,
} from "../../../../../common/Form/components/Select/select";
import { NetworkIconAndName } from "../../../../../Detail/components/TrackerForm/components/Select/components/NetworkIconAndName/networkIconAndName";

export const BioNetwork = forwardRef<HTMLInputElement, SelectProps>(
  function BioNetwork(
    {
      className,
      ...props /* Spread props to allow for Mui SelectProps specific prop overrides and controller related props e.g. "field". */
    }: SelectProps,
    ref
  ): JSX.Element {
    return (
      <Select
        {...props}
        className={className}
        ref={ref}
        renderValue={renderValue}
      >
        {NETWORKS.map(({ key, name }) => (
          <MMenuItem key={key} value={key}>
            <NetworkIconAndName networkKey={key} networkName={name} />
          </MMenuItem>
        ))}
      </Select>
    );
  }
);

/**
 * Renders select value.
 * @param value - Select value.
 * @returns select value.
 */
function renderValue(value: unknown): ReactNode {
  if (isNetworkKey(value)) {
    const networkName = getBioNetworkByKey(value)?.name;
    return (
      <NetworkIconAndName
        networkKey={value}
        networkName={networkName ?? value}
      />
    );
  }
  return "Choose...";
}
