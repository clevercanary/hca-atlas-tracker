import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
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
  const { class: cls } = props;
  const table = useTable(cls);
  return (
    <StyledFluidPaper elevation={0}>
      <StyledToolbar>
        <StyledTypography variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_HEADING_SMALL}>
          {cls.title}
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
