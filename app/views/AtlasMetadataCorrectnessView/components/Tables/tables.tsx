import { useEntity } from "../../../../providers/entity/hook";
import { EntityData } from "../../entities";
import { Table } from "../Table/table";
import { StyledGrid } from "./tables.styles";

export const Tables = (): JSX.Element => {
  const { data } = useEntity();
  const { metadataCorrectness = [] } = data as EntityData;
  return (
    <StyledGrid container>
      {metadataCorrectness.map((entity) => (
        <Table key={entity.name} data={entity} />
      ))}
    </StyledGrid>
  );
};
