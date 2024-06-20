import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { FormProvider } from "react-hook-form";
import { PathParameter } from "../../common/entities";
import { EntityForm } from "../../components/common/Form/components/EntityForm/entityForm";
import { AccessDeniedPrompt } from "../../components/common/Form/components/FormManager/components/AccessDeniedPrompt/accessDeniedPrompt";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Divider } from "../../components/Detail/components/TrackerForm/components/Divider/divider.styles";
import {
  ADD_PUBLISHED_SOURCE_STUDY_SECTION_CONFIGS,
  ADD_UNPUBLISHED_SOURCE_STUDY_SECTION_CONFIGS,
} from "../../components/Forms/components/SourceStudy/common/sections";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { FormManager } from "../../hooks/useFormManager/common/entities";
import { FIELD_NAME } from "./common/constants";
import { PUBLICATION_STATUS } from "./common/entities";
import { getBreadcrumbs } from "./common/utils";
import { useAddSourceStudyForm } from "./hooks/useAddSourceStudyForm";
import { useAddSourceStudyFormManager } from "./hooks/useAddSourceStudyFormManager";

interface AddNewSourceStudyViewProps {
  pathParameter: PathParameter;
}

export const AddNewSourceStudyView = ({
  pathParameter,
}: AddNewSourceStudyViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const formMethod = useAddSourceStudyForm();
  const formManager = useAddSourceStudyFormManager(pathParameter, formMethod);
  const {
    access: { canView },
    formAction,
    isLoading,
  } = formManager;
  const { watch } = formMethod;
  const publicationStatus = watch(FIELD_NAME.PUBLICATION_STATUS);
  const isPublishedForm = publicationStatus === PUBLICATION_STATUS.PUBLISHED;
  console.log(publicationStatus);
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent isIn={shouldRenderView(canView, Boolean(atlas))}>
      <DetailView
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(pathParameter, atlas)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <Fragment>
            <FormProvider {...formMethod}>
              <EntityForm
                accessFallback={renderAccessFallback(formManager)}
                formManager={formManager}
                formMethod={formMethod}
                sectionConfigs={
                  isPublishedForm
                    ? ADD_PUBLISHED_SOURCE_STUDY_SECTION_CONFIGS
                    : ADD_UNPUBLISHED_SOURCE_STUDY_SECTION_CONFIGS
                }
              />
            </FormProvider>
            {/*<AddSourceStudy formManager={formManager} formMethod={formMethod} />*/}
          </Fragment>
        }
        title="Add Source Study"
      />
    </ConditionalComponent>
  );
};

/**
 * Returns the access fallback component from the form manager access state.
 * @param formManager - Form manager.
 * @returns access fallback component.
 */
function renderAccessFallback(formManager: FormManager): JSX.Element | null {
  const {
    access: { canEdit, canView },
  } = formManager;
  if (!canView)
    return (
      <AccessPrompt divider={<Divider />} text="to add a new source study" />
    );
  if (!canEdit) return <AccessDeniedPrompt divider={<Divider />} />;
  return null;
}
