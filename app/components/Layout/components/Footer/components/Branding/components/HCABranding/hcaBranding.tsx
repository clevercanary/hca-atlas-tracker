import {
  ANCHOR_TARGET,
  REL_ATTRIBUTE,
} from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import Image from "next/image";
import { type JSX } from "react";
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
  // (hcaPortal.webp 2048×472 → 139, hcaOrg.webp 887×320 → 89).
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
          src="/images/hcaPortal.webp"
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
          src="/images/hcaOrg.webp"
          width={89}
        />
      </a>
    </Brands>
  );
};
