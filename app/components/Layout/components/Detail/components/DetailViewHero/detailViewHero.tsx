import { Title } from "@databiosphere/findable-ui/lib/components/common/Title/title";
import { BackPageTabs } from "@databiosphere/findable-ui/lib/components/Layout/components/BackPage/backPageView.styles";
import { SubTitle } from "@databiosphere/findable-ui/lib/components/Layout/components/BackPage/components/BackPageHero/components/SubTitle/subTitle";
import { ReactNode } from "react";
import { BackButton } from "./components/BackButton/backButton";
import {
  DetailViewHeroHeadline,
  DetailViewHero as DetailViewHeroLayout,
  HeroHeader,
  HeroTitle,
  Statuses,
  Titles,
} from "./detailViewHero.styles";

export interface DetailViewHeroProps {
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  status?: ReactNode;
  subTitle?: ReactNode;
  tabs?: ReactNode;
  title?: ReactNode;
}

export const DetailViewHero = ({
  actions,
  breadcrumbs,
  status,
  subTitle,
  tabs,
  title,
}: DetailViewHeroProps): JSX.Element => {
  return (
    <DetailViewHeroLayout>
      {(actions || breadcrumbs || title) && (
        <DetailViewHeroHeadline>
          <BackButton />
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
