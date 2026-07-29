import { NETWORKS } from "@/app/apis/catalog/hca-atlas-tracker/common/constants";
import { isNetworkKey } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import {
  Select,
  SelectProps,
} from "@/app/components/common/Form/components/Select/select";
import { NetworkIconAndName } from "@/app/components/Detail/components/TrackerForm/components/Select/components/NetworkIconAndName/networkIconAndName";
import { getBioNetworkByKey } from "@/app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { MenuItem as MMenuItem } from "@mui/material";
import { forwardRef, JSX, ReactNode } from "react";

export const BioNetwork = forwardRef<HTMLInputElement, SelectProps>(
  function BioNetwork(
    {
      className,
      ...props /* Spread props to allow for Mui SelectProps specific prop overrides and controller related props e.g. "field". */
    }: SelectProps,
    ref,
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
  },
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
