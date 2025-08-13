import { useEntity } from "../../../../providers/entity/hook";
import { EntityData } from "../../entities";
import { Table } from "../Table/table";
import { StyledFluidPaper, StyledGrid } from "./tables.styles";
import { filterClasses } from "./utils";

export const Tables = (): JSX.Element => {
  const { data } = useEntity();
  const { heatmap } = data as EntityData;
  const classes = filterClasses(heatmap?.classes);

  if (classes.length === 0) {
    return (
      <StyledFluidPaper>
        No metadata entry sheets registered for this atlas
      </StyledFluidPaper>
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
