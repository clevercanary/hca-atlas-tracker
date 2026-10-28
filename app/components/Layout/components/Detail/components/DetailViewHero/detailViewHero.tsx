import { Title } from "@databiosphere/findable-ui/lib/components/common/Title/title";
import { BackPageTabs } from "@databiosphere/findable-ui/lib/components/Layout/components/BackPage/backPageView.styles";
import { SubTitle } from "@databiosphere/findable-ui/lib/components/Layout/components/BackPage/components/BackPageHero/components/SubTitle/subTitle";
import { useLayoutHeight } from "@databiosphere/findable-ui/lib/components/Layout/hooks/UseLayoutHeight/hook";
import { type JSX } from "react";
import { BackButton } from "./components/BackButton/backButton";
import { DETAIL_HERO_HEIGHT } from "./constants";
import {
  DetailViewHeroHeadline,
  DetailViewHero as DetailViewHeroLayout,
  HeroHeader,
  HeroTitle,
  Statuses,
  Titles,
} from "./detailViewHero.styles";
import { type Props } from "./entities";

export const DetailViewHero = ({
  actions,
  backPath,
  breadcrumbs,
  pinned = false,
  status,
  subTitle,
  tabs,
  title,
}: Props): JSX.Element => {
  // Only a pinned hero is measured: its height sets where the table's column head pins.
  const { ref } = useLayoutHeight<HTMLDivElement>(DETAIL_HERO_HEIGHT);
  return (
    <DetailViewHeroLayout pinned={pinned} ref={pinned ? ref : undefined}>
      {(actions || breadcrumbs || title) && (
        <DetailViewHeroHeadline>
          <BackButton backPath={backPath} />
          <HeroHeader>
            {breadcrumbs}
            <HeroTitle>
              <Titles>
                <Title>{title}</Title>
                {subTitle && <SubTitle subTitle={subTitle} />}
              </Titles>
              {status && <Statuses>{status}</Statuses>}
            </HeroTitle>
          </HeroHeader>
          {actions}
        </DetailViewHeroHeadline>
      )}
      {tabs && <BackPageTabs>{tabs}</BackPageTabs>}
    </DetailViewHeroLayout>
  );
};
