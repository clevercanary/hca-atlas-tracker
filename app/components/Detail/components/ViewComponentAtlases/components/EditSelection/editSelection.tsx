import { EditFileArchivedStatus } from "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/components/EditFileArchivedStatus/editFileArchivedStatus";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { useEntity } from "@/app/providers/entity/hook";
import { INTEGRATED_OBJECTS } from "@/app/views/ComponentAtlasesView/hooks/UseFetchComponentAtlases/query/constants";
import { type JSX } from "react";
import { type Props } from "./entities";

// Module-level component (not an inline arrow passed as `component`): findable-ui's
// ComponentCreator renders the row selection view with `createElement(component, ...)`,
// so a new function identity each render would change the element type and remount the
// subtree — resetting the in-flight `isRequesting` guard inside FileArchivedStatus.
export const EditSelection = ({ rows, table }: Props): JSX.Element => {
  const { pathParameter } = useEntity();
  const { atlasId } = pathParameter || {};

  return (
    <EditFileArchivedStatus
      queryKeys={[
        [ATLAS, atlasId],
        [INTEGRATED_OBJECTS, atlasId],
      ]}
      rows={rows}
      table={table}
    />
  );
};
