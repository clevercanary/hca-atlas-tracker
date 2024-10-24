import { ReactNode } from "react";
import { DetailViewHero } from "./components/DetailViewHero/detailViewHero";
import {
  DetailViewContent,
  DetailView as DetailViewLayout,
} from "./detailView.styles";

export interface DetailViewProps {
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  mainColumn: ReactNode;
  status?: ReactNode;
  subTitle?: ReactNode;
  tabs?: ReactNode;
  title?: ReactNode;
}

export const DetailView = ({
  actions,
  breadcrumbs,
  mainColumn,
  status,
  subTitle,
  tabs,
  title,
}: DetailViewProps): JSX.Element => {
  return (
    <DetailViewLayout>
      <DetailViewHero
        actions={actions}
        breadcrumbs={breadcrumbs}
        status={status}
        subTitle={subTitle}
        tabs={tabs}
        title={title}
      />
      <DetailViewContent>{mainColumn}</DetailViewContent>
    </DetailViewLayout>
  );
};
