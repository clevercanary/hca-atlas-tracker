import { Breadcrumbs } from "@clevercanary/data-explorer-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { useCallback } from "react";
import { API } from "../../apis/catalog/hca-atlas-tracker/common/api";
import { AtlasId } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasEditData } from "../../apis/catalog/hca-atlas-tracker/common/schema";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../common/entities";
import { getRequestURL } from "../../common/utils";
import { Header } from "../../components/Detail/components/EditAtlas/components/Header/header";
import { Tabs } from "../../components/Detail/components/EditAtlas/components/Tabs/tabs";
import { EditAtlas } from "../../components/Detail/components/EditAtlas/editAtlas";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "./common/utils";
import { onSuccess, useEditAtlasForm } from "./hooks/useEditAtlasForm";

interface EditAtlasViewProps {
  atlasId: AtlasId;
}

export const EditAtlasView = ({ atlasId }: EditAtlasViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(atlasId);
  const formMethod = useEditAtlasForm(atlas);
  const { onSubmit } = formMethod;

  const onFormSubmit = useCallback(
    (payload: AtlasEditData) => {
      onSubmit(getRequestURL(API.ATLAS, atlasId), METHOD.PUT, payload, {
        onSuccess,
      });
    },
    [atlasId, onSubmit]
  );

  return (
    <DetailView
      breadcrumbs={<Breadcrumbs breadcrumbs={getBreadcrumbs(atlas)} />}
      header={<Header formMethod={formMethod} onFormSubmit={onFormSubmit} />}
      mainColumn={
        <EditAtlas formMethod={formMethod} onFormSubmit={onFormSubmit} />
      }
      status={atlas && <AtlasStatus atlasStatus={atlas?.status} />}
      tabs={<Tabs atlas={atlas} atlasId={atlasId} />}
      title={atlas ? getAtlasName(atlas) : "Edit Atlas"}
    />
  );
};
