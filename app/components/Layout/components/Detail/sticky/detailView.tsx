import { type Props } from "@/app/components/Layout/components/Detail/entities";
import { Global } from "@emotion/react";
import { Fragment, type JSX } from "react";
import { detailScrollPadding, StyledDetailView } from "./detailView.styles";

export const StickyDetailView = (props: Props): JSX.Element => {
  return (
    <Fragment>
      <Global styles={detailScrollPadding} />
      <StyledDetailView {...props} pinnedHero />
    </Fragment>
  );
};
