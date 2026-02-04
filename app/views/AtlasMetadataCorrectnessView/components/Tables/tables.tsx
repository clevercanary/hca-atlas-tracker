import { JSX } from "react";
import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { TablePlaceholder } from "../../../../components/Table/components/TablePlaceholder/tablePlaceholder";
import { useEntity } from "../../../../providers/entity/hook";
import { EntityData } from "../../entities";
import { Table } from "../Table/table";
import { StyledGrid } from "./tables.styles";
import { filterClasses } from "./utils";

export const Tables = (): JSX.Element => {
  const { data } = useEntity();
  const { heatmap } = data as EntityData;
  const classes = filterClasses(heatmap?.classes);

  if (classes.length === 0) {
    return (
      <FluidPaper>
        <TablePlaceholder message="No metadata entry sheets registered for this atlas" />
      </FluidPaper>
    );
  }

  return (
    <StyledGrid container>
      {classes?.map((cls) => (
        <Table key={cls.title} class={cls} />
      ))}
    </StyledGrid>
  );
};
