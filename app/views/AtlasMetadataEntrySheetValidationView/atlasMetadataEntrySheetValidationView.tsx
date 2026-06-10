import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { JSX } from "react";
import { PathParameter } from "../../common/entities";
import { EntityView } from "../../components/Entity/components/EntityView/entityView";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
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
  const syncInfo = useEntrySheetSync(pathParameter);
  return (
    <EntityProvider
      data={{ atlas, entrySheetValidation }}
      formManager={formManager}
    >
      <ConditionalComponent isIn={Boolean(entrySheetValidation)}>
        <DetailView
          actions={<Actions {...syncInfo} />}
          mainColumn={
            <EntityView
              sectionConfigs={VIEW_METADATA_ENTRY_SHEET_SECTION_CONFIGS}
            />
          }
          subTitle={
            <Typography
              color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
              variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
            >
              {renderSubTitle(entrySheetValidation)}
            </Typography>
          }
          title={
            <>
              <Typography variant={TYPOGRAPHY_PROPS.VARIANT.HEADING}>
                {renderTitle(entrySheetValidation)}
              </Typography>
            </>
          }
        />
      </ConditionalComponent>
    </EntityProvider>
  );
};
