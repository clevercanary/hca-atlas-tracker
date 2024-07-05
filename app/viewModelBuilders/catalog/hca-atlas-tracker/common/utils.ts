import { MetadataValue } from "@databiosphere/findable-ui/lib/components/Index/components/NTagCell/nTagCell";
import { ColumnConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { RowData } from "@tanstack/react-table";
import { MetadataValueTuple } from "../../../../components/Table/components/TableCell/components/NTagCell/components/PinnedNTagCell/pinnedNTagCell";
import { PLURALIZED_METADATA_LABEL } from "./constants";
import {
  COMPONENT_NAME,
  ExtraPropsByComponentName,
  METADATA_KEY,
} from "./entities";

/**
 * Returns true if the value is a member of COMPONENT_NAME.
 * @param value - The value to check.
 * @returns true if the value is a member of COMPONENT_NAME.
 */
function isComponentName(value: string): value is COMPONENT_NAME {
  const names = Object.values(COMPONENT_NAME);
  return names.includes(value as COMPONENT_NAME);
}

/**
 * Maps column configurations with extra properties.
 * @param columns - Column config.
 * @param extraPropsByComponentName - Extra properties by component name.
 * @returns column config, with extra properties.
 */
export function mapColumnsWithExtraProps<T extends RowData>(
  columns: ColumnConfig<T>[],
  extraPropsByComponentName: ExtraPropsByComponentName
): ColumnConfig<T>[] {
  return columns.map((column) => {
    const { componentConfig } = column;
    const {
      component: { name },
    } = componentConfig;
    if (isComponentName(name) && extraPropsByComponentName.has(name)) {
      return {
        ...column,
        componentConfig: {
          ...componentConfig,
          props: {
            ...componentConfig.props,
            ...extraPropsByComponentName.get(name),
          },
        },
      };
    }
    return column;
  });
}

/**
 * Returns the pluralized metadata label for the specified metadata.
 * @param metadataKey - Metadata key.
 * @returns string label describing the metadata in plural form.
 */
export function getPluralizedMetadataLabel(
  metadataKey: keyof typeof METADATA_KEY
): string {
  return PLURALIZED_METADATA_LABEL[metadataKey];
}

/**
 * Returns metadata values partitioned into pinned values and non-pinned values.
 * @param values - Values to partition.
 * @param pinned - Values to pin.
 * @returns metadata tuple containing pinned values and non-pinned values.
 */
export function partitionMetadataValues(
  values: MetadataValue[],
  pinned: MetadataValue[]
): MetadataValueTuple {
  const partitionedValues: MetadataValueTuple = [[], []];
  return values.reduce((acc, value) => {
    if (pinned.includes(value)) {
      acc[0].push(value);
    } else {
      acc[1].push(value);
    }
    return acc;
  }, partitionedValues);
}
