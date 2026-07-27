import {
  ANCHOR_TARGET,
  REL_ATTRIBUTE,
} from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import Image from "next/image";
import { JSX } from "react";
import { Brands } from "./hcaBranding.styles";

export interface HCABrandingProps {
  orgURL: string;
  portalURL: string;
}

export const HCABranding = ({
  orgURL,
  portalURL,
}: HCABrandingProps): JSX.Element => {
  // Widths are derived from each logo's source aspect ratio at 32px tall
  // (hcaPortal.png 2048×472 → 139, hcaOrg.png 887×320 → 89).
  return (
    <Brands>
      <a
        href={portalURL}
        rel={REL_ATTRIBUTE.NO_OPENER_NO_REFERRER}
        target={ANCHOR_TARGET.BLANK}
      >
        <Image
          alt="HCA Data Portal"
          height={32}
          src="/images/hcaPortal.png"
          width={139}
        />
      </a>
      <a
        href={orgURL}
        rel={REL_ATTRIBUTE.NO_OPENER_NO_REFERRER}
        target={ANCHOR_TARGET.BLANK}
      >
        <Image
          alt="The Human Cell Atlas"
          height={32}
          src="/images/hcaOrg.png"
          width={89}
        />
      </a>
    </Brands>
  );
};
