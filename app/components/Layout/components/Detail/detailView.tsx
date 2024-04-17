import { Fragment, ReactNode } from "react";
import { DetailViewHero } from "./components/DetailViewHero/detailViewHero";
import {
  DetailView as DetailViewLayout,
  DetailViewContent,
} from "./detailView.styles";

export interface DetailViewProps {
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  header?: ReactNode;
  mainColumn: ReactNode;
  status?: ReactNode;
  tabs?: ReactNode;
  title?: ReactNode;
}

export const DetailView = ({
  actions,
  breadcrumbs,
  header,
  mainColumn,
  status,
  tabs,
  title,
}: DetailViewProps): JSX.Element => {
  return (
    <Fragment>
      {header}
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
