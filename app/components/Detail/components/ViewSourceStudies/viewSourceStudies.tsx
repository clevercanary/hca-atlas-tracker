import { PathParameter } from "@/app/common/entities";
import { getRouteURL } from "@/app/common/utils";
import { StyledFluidPaper } from "@/app/components/Table/components/TablePaper/tablePaper.styles";
import { StyledToolbar } from "@/app/components/Table/components/TableToolbar/tableToolbar.styles";
import { FormManager } from "@/app/hooks/useFormManager/common/entities";
import { ROUTE } from "@/app/routes/constants";
import { Table } from "@/app/views/SourceStudiesView/components/Table/table";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/components/common/Button/constants";
import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { Button, Divider } from "@mui/material";
import Link from "next/link";
import { Fragment, JSX } from "react";
import { Alert } from "./components/Alert/alert";
import { SubGrid } from "./viewAtlasSourceStudies.styles";

interface ViewSourceStudiesProps {
  formManager: FormManager;
  pathParameter: PathParameter;
}

export const ViewSourceStudies = ({
  formManager,
  pathParameter,
}: ViewSourceStudiesProps): JSX.Element => {
  const {
    access: { canEdit },
  } = formManager;
  return (
    <SubGrid>
      {/* What is a Source Study? */}
      <Alert />
      <StyledFluidPaper elevation={0}>
        {canEdit && (
          <Fragment>
            <StyledToolbar>
              <Button
                {...BUTTON_PROPS.SECONDARY_CONTAINED}
                component={Link}
                href={getRouteURL(ROUTE.CREATE_SOURCE_STUDY, pathParameter)}
                startIcon={
                  <AddIcon
                    color={SVG_ICON_PROPS.COLOR.INK_LIGHT}
                    fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL}
                  />
                }
              >
                Add Source Study
              </Button>
            </StyledToolbar>
            <Divider />
          </Fragment>
        )}
        <Table />
      </StyledFluidPaper>
    </SubGrid>
  );
};
