import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { PathParameter } from "../../common/entities";

interface AtlasSourceDatasetValidationViewProps {
  pathParameter: PathParameter;
}

export const AtlasSourceDatasetValidationView = ({
  pathParameter,
}: AtlasSourceDatasetValidationViewProps): JSX.Element => {
  return (
    <ConditionalComponent isIn={true}>
      Validation View {pathParameter.validationId}
    </ConditionalComponent>
  );
};
