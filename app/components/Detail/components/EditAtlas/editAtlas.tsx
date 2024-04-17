import { Link } from "@clevercanary/data-explorer-ui/lib/components/Links/components/Link/link";
import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
import { AtlasEditData } from "../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { GeneralInfo } from "../TrackerForm/components/Section/components/Atlas/components/GeneralInfo/generalInfo";
import { IntegrationLead } from "../TrackerForm/components/Section/components/Atlas/components/IntegrationLead/integrationLead";
import { AuthenticationRequired } from "../TrackerForm/components/Section/components/AuthenticationRequired/authenticationRequired";
import { TrackerForm } from "../TrackerForm/trackerForm";

interface EditAtlasProps {
  formMethod: FormMethod<AtlasEditData>;
}

export const EditAtlas = ({ formMethod }: EditAtlasProps): JSX.Element => {
  const { isAuthenticated } = useAuthentication();
  return isAuthenticated ? (
    <TrackerForm>
      <GeneralInfo {...formMethod} />
      <Divider />
      <IntegrationLead {...formMethod} />
      <Divider />
    </TrackerForm>
  ) : (
    <AuthenticationRequired>
      <Link label={"Sign in"} url={ROUTE.LOGIN} /> to edit an atlas.
    </AuthenticationRequired>
  );
};
