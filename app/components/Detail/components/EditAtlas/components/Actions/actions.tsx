import { ButtonPrimary } from "@clevercanary/data-explorer-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { ButtonSecondary } from "@clevercanary/data-explorer-ui/lib/components/common/Button/components/ButtonSecondary/buttonSecondary";
import { Fragment, useCallback } from "react";
import { API } from "../../../../../../apis/catalog/hca-atlas-tracker/common/api";
import { AtlasId } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { NewAtlasData } from "../../../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../../../common/entities";
import { getRequestURL } from "../../../../../../common/utils";
import { FormMethod } from "../../../../../../hooks/useForm/common/entities";
import { onSuccess } from "../../../../../../views/EditAtlasView/hooks/useEditAtlasForm";
import { RefreshIcon } from "../../../../../common/CustomIcon/components/RefreshIcon/refreshIcon";

interface ActionsProps {
  atlasId: AtlasId;
  formMethod: FormMethod<NewAtlasData>;
}

export const Actions = ({ atlasId, formMethod }: ActionsProps): JSX.Element => {
  const { handleSubmit, onSubmit } = formMethod;

  const onFormSubmit = useCallback(
    (payload: NewAtlasData): void => {
      onSubmit(getRequestURL(API.ATLAS, atlasId), METHOD.PUT, payload, {
        onSuccess,
      });
    },
    [atlasId, onSubmit]
  );

  return (
    <Fragment>
      <ButtonSecondary startIcon={<RefreshIcon />}>Refresh</ButtonSecondary>
      <ButtonPrimary onClick={handleSubmit(onFormSubmit)}>
        Publish
      </ButtonPrimary>
    </Fragment>
  );
};
