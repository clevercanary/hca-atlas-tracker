import { Title } from "@clevercanary/data-explorer-ui/lib/components/common/Title/title";
import { BackPageTabs } from "@clevercanary/data-explorer-ui/lib/components/Layout/components/BackPage/backPageView.styles";
import { ReactNode } from "react";
import {
  DetailViewHero as DetailViewHeroLayout,
  DetailViewHeroHeadline,
  HeroActions,
  HeroHeader,
  HeroTitle,
  Statuses,
} from "./detailViewHero.styles";

export interface DetailViewHeroProps {
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  status?: ReactNode;
  tabs?: ReactNode;
  title?: ReactNode;
}

export const DetailViewHero = ({
  actions,
  breadcrumbs,
  status,
  tabs,
  title,
}: DetailViewHeroProps): JSX.Element => {
  return (
    <DetailViewHeroLayout>
      {(actions || breadcrumbs || title) && (
        <DetailViewHeroHeadline>
          <HeroHeader>
            {breadcrumbs}
            <HeroTitle>
              {title && <Title title={title} />}
              {status && <Statuses>{status}</Statuses>}
            </HeroTitle>
          </HeroHeader>
          {actions && <HeroActions>{actions}</HeroActions>}
        </DetailViewHeroHeadline>
      )}
      {tabs && <BackPageTabs>{tabs}</BackPageTabs>}
    </DetailViewHeroLayout>
  );
};
