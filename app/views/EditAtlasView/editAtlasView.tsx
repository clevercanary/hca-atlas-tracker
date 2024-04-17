import { Breadcrumbs } from "@clevercanary/data-explorer-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { AtlasId } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { Banner } from "../../components/Detail/components/EditAtlas/components/Banner/banner";
import { Tabs } from "../../components/Detail/components/EditAtlas/components/Tabs/tabs";
import { EditAtlas } from "../../components/Detail/components/EditAtlas/editAtlas";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "./common/utils";
import { useEditAtlasForm } from "./hooks/useEditAtlasForm";

interface EditAtlasViewProps {
  atlasId: AtlasId;
}

export const EditAtlasView = ({ atlasId }: EditAtlasViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(atlasId);
  const formMethod = useEditAtlasForm(atlas);
  return (
    <DetailView
      banner={<Banner atlasId={atlasId} formMethod={formMethod} />}
      breadcrumbs={<Breadcrumbs breadcrumbs={getBreadcrumbs(atlas)} />}
      mainColumn={<EditAtlas formMethod={formMethod} />}
      status={atlas && <AtlasStatus atlasStatus={atlas?.status} />}
      tabs={<Tabs atlas={atlas} atlasId={atlasId} />}
      title={atlas ? getAtlasName(atlas) : "Edit Atlas"}
    />
  );
};
