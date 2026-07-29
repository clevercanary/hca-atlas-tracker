import { NETWORK_ICONS } from "@/app/apis/catalog/hca-atlas-tracker/common/constants";
import { NetworkKey } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import Image, { ImageProps } from "next/image";
import { JSX } from "react";

export interface NetworkIconProps extends Pick<ImageProps, "height" | "width"> {
  alt?: string;
  networkKey: NetworkKey;
}

export const NetworkIcon = ({
  alt = "",
  height = 24,
  networkKey,
  width,
}: NetworkIconProps): JSX.Element => {
  // Icons render beside a visible network label, so they're decorative by
  // default (empty alt); callers pass alt when used without an adjacent label.
  // Icons are square, so default width to the rendered height.
  return (
    <Image
      alt={alt}
      height={height}
      src={NETWORK_ICONS[networkKey]}
      width={width ?? height}
    />
  );
};
