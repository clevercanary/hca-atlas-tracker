import { PathParameter } from "@/app/common/entities";
import { EntityView } from "@/app/components/Entity/components/EntityView/entityView";
import { DetailView } from "@/app/components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "@/app/hooks/UseFetchAtlas/hook";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { EntityProvider } from "@/app/providers/entity/provider";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { JSX } from "react";
import { VIEW_METADATA_ENTRY_SHEET_SECTION_CONFIGS } from "./common/config";
import { Actions } from "./components/Actions/actions";
import { useEntrySheetSync } from "./hooks/UseEntrySheetSync/hook";
import { useFetchEntrySheetValidation } from "./hooks/UseFetchEntrySheetValidation/hook";
import { renderSubTitle, renderTitle } from "./utils";

interface AtlasMetadataEntrySheetValidationViewProps {
  pathParameter: PathParameter;
}

export const AtlasMetadataEntrySheetValidationView = ({
  pathParameter,
}: AtlasMetadataEntrySheetValidationViewProps): JSX.Element => {
  const { data: atlas } = useFetchAtlas(pathParameter);
  const { data: entrySheetValidation } =
    useFetchEntrySheetValidation(pathParameter);
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
