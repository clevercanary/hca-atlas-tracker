import Image, { ImageProps } from "next/image";
import { JSX } from "react";
import { NETWORK_ICONS } from "../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { NetworkKey } from "../../../../../apis/catalog/hca-atlas-tracker/common/entities";

export interface NetworkIconProps extends Pick<ImageProps, "height" | "width"> {
  networkKey: NetworkKey;
}

export const NetworkIcon = ({
  height = 24,
  networkKey,
  width,
}: NetworkIconProps): JSX.Element => {
  // Network icons are square, so default width to the rendered height.
  return (
    <Image
      alt={networkKey}
      height={height}
      src={NETWORK_ICONS[networkKey]}
      width={width ?? height}
    />
  );
};
