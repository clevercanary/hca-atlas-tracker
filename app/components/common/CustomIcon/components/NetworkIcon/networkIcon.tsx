import {
  StaticImage,
  StaticImageProps,
} from "@clevercanary/data-explorer-ui/lib/components/common/StaticImage/staticImage";
import { NETWORK_ICONS } from "../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { NetworkKey } from "../../../../../apis/catalog/hca-atlas-tracker/common/entities";

export interface NetworkIconProps
  extends Pick<StaticImageProps, "height" | "width"> {
  networkKey: NetworkKey;
}

export const NetworkIcon = ({
  height = 24,
  networkKey,
  ...props
}: NetworkIconProps): JSX.Element => {
  return (
    <StaticImage
      alt={networkKey}
      height={height}
      src={NETWORK_ICONS[networkKey]}
      {...props}
    />
  );
};
