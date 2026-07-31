import { TablePlaceholder } from "@/app/components/Table/components/TablePlaceholder/tablePlaceholder";
import { useEntity } from "@/app/providers/entity/hook";
import { Table } from "@/app/views/AtlasMetadataCorrectnessView/components/Table/table";
import { EntityData } from "@/app/views/AtlasMetadataCorrectnessView/entities";
import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { JSX } from "react";
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
