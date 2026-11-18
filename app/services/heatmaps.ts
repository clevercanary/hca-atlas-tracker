import { NETWORK_KEYS } from "@/app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  type HCAAtlasTrackerDBEntrySheetValidation,
  type Heatmap,
  type NetworkKey,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  getAttributeBioNetworks,
  getDataDictionaryClass,
} from "@/app/utils/data-dictionary";
import { type EntrySheetValidationErrorInfo } from "@/app/utils/hca-validation-tools/hca-validation-tools";
import { type Class } from "@databiosphere/findable-ui/lib/common/entities";
import { getBaseModelAtlas } from "./atlases";
import { getSourceStudiesEntrySheetValidations } from "./entry-sheets";

const ENTITY_TYPES = ["dataset", "donor", "sample"] as const;

type EntityType = (typeof ENTITY_TYPES)[number];

export async function getAtlasHeatmap(atlasId: string): Promise<Heatmap> {
  const {
    overview: { network },
    source_studies: sourceStudyIds,
  } = await getBaseModelAtlas(atlasId);
  const entrySheetValidations =
    await getSourceStudiesEntrySheetValidations(sourceStudyIds);
  return {
    classes: ENTITY_TYPES.map((entityType) => {
      const ddClass = getNetworkClass(
        getDataDictionaryClass(entityType),
        network,
      );
      return getClassHeatmap(entityType, ddClass, entrySheetValidations);
    }),
  };
}

/**
 * Get a data dictionary class with only the attributes that apply to the given bionetwork.
 * @param ddClass - Data dictionary class.
 * @param network - Bionetwork of the atlas.
 * @returns class with attributes outside the network removed.
 */
function getNetworkClass(ddClass: Class, network: NetworkKey): Class {
  return {
    ...ddClass,
    attributes: ddClass.attributes.filter((attribute) =>
      getAttributeBioNetworks(attribute).includes(network),
    ),
  };
}

function getClassHeatmap(
  entityType: EntityType,
  ddClass: Class,
  entrySheetValidations: HCAAtlasTrackerDBEntrySheetValidation[],
): Heatmap["classes"][number] {
  const sheetsInfo: Heatmap["classes"][number]["sheets"] = [];
  for (const validation of entrySheetValidations) {
    // TODO the ID would be unnecessary if we change entry sheet validations to fall back to the source study's record of the sheet title (see issue #704)
    const sheetTitle =
      validation.entry_sheet_title ?? validation.entry_sheet_id;
    const rowCount = validation.validation_summary[`${entityType}_count`];
    if (rowCount === null) {
      sheetsInfo.push({
        correctness: null,
        title: sheetTitle,
      });
    } else {
      sheetsInfo.push(
        getSheetHeatmap(
          entityType,
          ddClass,
          sheetTitle,
          rowCount,
          validation.validation_report,
        ),
      );
    }
  }
  return {
    fields: ddClass.attributes.map((ddAttribute) => {
      const bioNetworks = getAttributeBioNetworks(ddAttribute);
      return {
        name: ddAttribute.name,
        organSpecific: !NETWORK_KEYS.every((network) =>
          bioNetworks.includes(network),
        ),
        required: Boolean(ddAttribute.required),
        title: ddAttribute.title,
      };
    }),
    sheets: sheetsInfo,
    title: ddClass.title,
  };
}

function getSheetHeatmap(
  entityType: EntityType,
  ddClass: Class,
  sheetTitle: string,
  rowCount: number,
  errors: EntrySheetValidationErrorInfo[],
): Heatmap["classes"][number]["sheets"][number] {
  const correctCounts: Record<string, number> = Object.fromEntries(
    ddClass.attributes.map((a) => [a.name, rowCount]),
  );
  const countedCells = new Set<string>();
  for (const error of errors) {
    if (
      error.entity_type !== entityType ||
      error.column === null ||
      !Object.hasOwn(correctCounts, error.column)
    ) {
      continue;
    }
    if (error.cell === null) {
      correctCounts[error.column] = 0;
    } else if (
      correctCounts[error.column] > 0 &&
      !countedCells.has(error.cell)
    ) {
      correctCounts[error.column]--;
      countedCells.add(error.cell);
    }
  }
  return {
    correctness: {
      correctCounts,
      rowCount,
    },
    title: sheetTitle,
  };
}
