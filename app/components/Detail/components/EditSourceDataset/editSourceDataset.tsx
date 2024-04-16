import { Link } from "@clevercanary/data-explorer-ui/lib/components/Links/components/Link/link";
import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
import { SourceDatasetEditData } from "../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { ROUTE } from "../../../../routes/constants";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { AuthenticationRequired } from "../TrackerForm/components/Section/components/AuthenticationRequired/authenticationRequired";
import { GeneralInfo } from "../TrackerForm/components/Section/components/SourceDataset/components/Edit/components/GeneralInfo/generalInfo";
import { TrackerForm } from "../TrackerForm/trackerForm";

interface EditSourceDatasetProps {
  formMethod: FormMethod<SourceDatasetEditData>;
}

export const EditSourceDataset = ({
  formMethod,
}: EditSourceDatasetProps): JSX.Element => {
  const { isAuthenticated } = useAuthentication();
  return isAuthenticated ? (
    <TrackerForm>
      <Divider />
      <GeneralInfo {...formMethod} />
      <Divider />
    </TrackerForm>
  ) : (
    <AuthenticationRequired divider={<Divider />}>
      <Link label={"Sign in"} url={ROUTE.LOGIN} /> to edit a source dataset.
    </AuthenticationRequired>
  );
};
