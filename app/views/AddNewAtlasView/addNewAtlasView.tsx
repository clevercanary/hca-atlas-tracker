import { Breadcrumbs } from "@clevercanary/data-explorer-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { AddAtlas } from "../../components/Detail/components/AddAtlas/addAtlas";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { getBreadcrumbs } from "./common/utils";

export const AddNewAtlasView = (): JSX.Element => {
  return (
    <DetailView
      breadcrumbs={<Breadcrumbs breadcrumbs={getBreadcrumbs()} />}
      mainColumn={<AddAtlas />}
      title="Add New Atlas"
    />
  );
};
