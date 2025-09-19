import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { PathParameter } from "../../common/entities";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Divider } from "../../components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { EntityView } from "../../components/Entity/components/EntityView/entityView";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { FormManager } from "../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { EntityProvider } from "../../providers/entity/provider";
import { VIEW_METADATA_ENTRY_SHEET_SECTION_CONFIGS } from "./common/config";
import { Actions } from "./components/Actions/actions";
import { useEntrySheetSync } from "./hooks/UseEntrySheetSync/hook";
import { useFetchEntrySheetValidation } from "./hooks/useFetchEntrySheetValidations";
import { renderSubTitle, renderTitle } from "./utils";

interface AtlasMetadataEntrySheetValidationViewProps {
  pathParameter: PathParameter;
}

export const AtlasMetadataEntrySheetValidationView = ({
  pathParameter,
}: AtlasMetadataEntrySheetValidationViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { entrySheetValidation } = useFetchEntrySheetValidation(pathParameter);
  const formManager = useFormManager();
  const {
    access: { canView },
  } = formManager;
  const syncInfo = useEntrySheetSync(pathParameter);
  return (
    <EntityProvider
      data={{ atlas, entrySheetValidation }}
      formManager={formManager}
    >
      <ConditionalComponent
        isIn={shouldRenderView(canView, Boolean(entrySheetValidation))}
      >
        <DetailView
          actions={<Actions {...syncInfo} />}
          mainColumn={
            <EntityView
              accessFallback={renderAccessFallback(formManager)}
              sectionConfigs={VIEW_METADATA_ENTRY_SHEET_SECTION_CONFIGS}
            />
          }
          subTitle={
            <Typography
              color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
              variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_BODY_400}
            >
              {renderSubTitle(entrySheetValidation)}
            </Typography>
          }
          title={
            <>
              {/* TODO(cc) update heading variant with typography props */}
              <Typography component="h1" variant="text-heading">
                {renderTitle(entrySheetValidation)}
              </Typography>
            </>
          }
        />
      </ConditionalComponent>
    </EntityProvider>
  );
};

/**
 * Returns the access fallback component from the form manager access state.
 * @param formManager - Form manager.
 * @returns access fallback component.
 */
function renderAccessFallback(formManager: FormManager): JSX.Element | null {
  const {
    access: { canView },
  } = formManager;
  if (!canView)
    return (
      <AccessPrompt
        divider={<Divider />}
        text="to view metadata entry sheet validation"
      />
    );
  return null;
}
