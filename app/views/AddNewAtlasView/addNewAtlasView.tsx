import { Breadcrumbs } from "@clevercanary/data-explorer-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { AddAtlas } from "../../components/Detail/components/AddAtlas/addAtlas";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { getBreadcrumbs } from "./common/utils";
import { useAddAtlasForm } from "./hooks/useAddAtlasForm";

export const AddNewAtlasView = (): JSX.Element => {
  const formMethod = useAddAtlasForm();
  return (
    <DetailView
      breadcrumbs={<Breadcrumbs breadcrumbs={getBreadcrumbs()} />}
      mainColumn={<AddAtlas formMethod={formMethod} />}
      title="Add New Atlas"
    />
  );
};
