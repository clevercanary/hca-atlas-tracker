import { Logo } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/components/Content/components/Logo/logo";
import { ANCHOR_TARGET } from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { Brands } from "./hcaBranding.styles";

export interface HCABrandingProps {
  orgURL: string;
  portalURL: string;
}

export const HCABranding = ({
  orgURL,
  portalURL,
}: HCABrandingProps): JSX.Element => {
  return (
    <Brands>
      <Logo
        alt="HCA Data Portal"
        height={32}
        link={portalURL}
        src="/images/hcaPortal.png"
        target={ANCHOR_TARGET.BLANK}
      />
      <Logo
        alt="The Human Cell Atlas"
        height={32}
        link={orgURL}
        src="/images/hcaOrg.png"
        target={ANCHOR_TARGET.BLANK}
      />
    </Brands>
  );
};
