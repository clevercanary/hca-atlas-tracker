import { JSX } from "react";
import { API } from "../../../../apis/catalog/hca-atlas-tracker/common/api";
import { PathParameter } from "../../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../../common/utils";
import { useCreateAtlasRevision } from "../../../../hooks/UseCreateAtlasRevision/hook";
import { ROUTE } from "../../../../routes/constants";
import { AtlasActionButton } from "../../components/AtlasActionButton/atlasActionButton";

interface Props {
  pathParameter: PathParameter;
}

export const CreateRevisionButton = ({ pathParameter }: Props): JSX.Element => {
  const { isRequesting, onSubmit, succeeded } = useCreateAtlasRevision();
  return (
    <AtlasActionButton
      disabled={isRequesting || succeeded}
      onClick={() => {
        onSubmit(getRequestURL(API.ATLAS_VERSIONS, pathParameter), {
          onSuccess: (newAtlas) => {
            location.assign(getRouteURL(ROUTE.ATLAS, { atlasId: newAtlas.id }));
          },
        });
      }}
    >
      Create New Version
    </AtlasActionButton>
  );
};
