import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { RowData } from "@tanstack/react-table";
import { ToggleButtonGroup } from "./components/ToggleButtonGroup/toggleButtonGroup";
import { Props } from "./entities";
import { useTable } from "./hooks/useTable/hook";
import {
  StyledFluidPaper,
  StyledTable,
  StyledToolbar,
  StyledTypography,
} from "./table.styles";
import { getColumnTrackSizing as getGridTemplateColumns } from "./utils";

export const Table = (props: Props): JSX.Element => {
  const { data } = props;
  const table = useTable(data.sourceStudies as RowData[]);
  return (
    <StyledFluidPaper elevation={0}>
      <StyledToolbar>
        <StyledTypography variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_HEADING_SMALL}>
          {data.title}
        </StyledTypography>
        <ToggleButtonGroup table={table} />
      </StyledToolbar>
      <StyledTable
        gridTemplateColumns={getGridTemplateColumns(table)}
        table={table}
      />
    </StyledFluidPaper>
  );
};
