import { JSX } from "react";
import { DetailViewHero } from "./components/DetailViewHero/detailViewHero";
import {
  DetailViewContent,
  DetailView as DetailViewLayout,
} from "./detailView.styles";
import { Props } from "./entities";

export const DetailView = ({
  actions,
  backPath,
  breadcrumbs,
  mainColumn,
  status,
  subTitle,
  tabs,
  title,
}: Props): JSX.Element => {
  return (
    <DetailViewLayout>
      <DetailViewHero
        actions={actions}
        backPath={backPath}
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
