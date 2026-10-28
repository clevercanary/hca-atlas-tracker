import { type JSX } from "react";
import { DetailViewHero } from "./components/DetailViewHero/detailViewHero";
import {
  DetailViewContent,
  DetailView as DetailViewLayout,
} from "./detailView.styles";
import { type Props } from "./entities";

export const DetailView = ({
  actions,
  backPath,
  breadcrumbs,
  className,
  mainColumn,
  pinnedHero,
  status,
  subTitle,
  tabs,
  title,
}: Props): JSX.Element => {
  return (
    <DetailViewLayout className={className}>
      <DetailViewHero
        actions={actions}
        backPath={backPath}
        breadcrumbs={breadcrumbs}
        pinned={pinnedHero}
        status={status}
        subTitle={subTitle}
        tabs={tabs}
        title={title}
      />
      <DetailViewContent>{mainColumn}</DetailViewContent>
    </DetailViewLayout>
  );
};
