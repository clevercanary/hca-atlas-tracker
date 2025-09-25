import { Title } from "@databiosphere/findable-ui/lib/components/common/Title/title";
import { BackPageTabs } from "@databiosphere/findable-ui/lib/components/Layout/components/BackPage/backPageView.styles";
import { SubTitle } from "@databiosphere/findable-ui/lib/components/Layout/components/BackPage/components/BackPageHero/components/SubTitle/subTitle";
import { BackButton } from "./components/BackButton/backButton";
import {
  DetailViewHeroHeadline,
  DetailViewHero as DetailViewHeroLayout,
  HeroHeader,
  HeroTitle,
  Statuses,
  Titles,
} from "./detailViewHero.styles";
import { Props } from "./entities";

export const DetailViewHero = ({
  actions,
  backPath,
  breadcrumbs,
  status,
  subTitle,
  tabs,
  title,
}: Props): JSX.Element => {
  return (
    <DetailViewHeroLayout>
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
