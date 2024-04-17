import { Fragment, ReactNode } from "react";
import { DetailViewHero } from "./components/DetailViewHero/detailViewHero";
import {
  DetailView as DetailViewLayout,
  DetailViewContent,
} from "./detailView.styles";

export interface DetailViewProps {
  actions?: ReactNode;
  banner?: ReactNode;
  breadcrumbs?: ReactNode;
  mainColumn: ReactNode;
  status?: ReactNode;
  tabs?: ReactNode;
  title?: ReactNode;
}

export const DetailView = ({
  actions,
  banner,
  breadcrumbs,
  mainColumn,
  status,
  tabs,
  title,
}: DetailViewProps): JSX.Element => {
  return (
    <Fragment>
      {banner}
      <DetailViewLayout>
        <DetailViewHero
          actions={actions}
          breadcrumbs={breadcrumbs}
          status={status}
          tabs={tabs}
          title={title}
        />
        <DetailViewContent>{mainColumn}</DetailViewContent>
      </DetailViewLayout>
    </Fragment>
  );
};
