import { Link } from "@clevercanary/data-explorer-ui/lib/components/Links/components/Link/link";
import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback } from "react";
import { AtlasId } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { NewAtlasData } from "../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../../common/entities";
import { getRequestURL } from "../../../../common/utils";
import { ROUTE } from "../../../../constants/routes";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import {
  onDeleteSuccess as onSuccess,
  REQUEST_URL,
} from "../../../../views/EditAtlasView/hooks/useEditAtlasForm";
import { ButtonOutlineError } from "../../../common/Button/components/ButtonOutlineError/buttonOutlineError";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { AuthenticationRequired } from "../TrackerForm/components/Section/components/AuthenticationRequired/authenticationRequired";
import { GeneralInfo } from "../TrackerForm/components/Section/components/GeneralInfo/generalInfo";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { FormActions } from "../TrackerForm/trackerForm.styles";

interface EditAtlasProps {
  atlasId: AtlasId;
  formMethod: FormMethod<NewAtlasData>;
}

export const EditAtlas = ({
  atlasId,
  formMethod,
}: EditAtlasProps): JSX.Element => {
  const { isAuthenticated } = useAuthentication();
  const { disabled, handleSubmit, onDelete } = formMethod;

  const onFormDelete = useCallback(() => {
    onDelete(getRequestURL(REQUEST_URL, atlasId), METHOD.DELETE, {
      onSuccess,
    });
  }, [atlasId, onDelete]);

  return isAuthenticated ? (
    <TrackerForm>
      <Divider />
      <GeneralInfo {...formMethod} />
      <Divider />
      <FormActions>
        <ButtonOutlineError
          disabled={disabled}
          onClick={handleSubmit(onFormDelete)}
        >
          Delete
        </ButtonOutlineError>
      </FormActions>
    </TrackerForm>
  ) : (
    <AuthenticationRequired>
      <Link label={"Sign in"} url={ROUTE.LOGIN} /> to edit an atlas.
    </AuthenticationRequired>
  );
};
