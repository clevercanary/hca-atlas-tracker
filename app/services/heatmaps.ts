import { Class } from "@databiosphere/findable-ui/lib/common/entities";
import dataDictionary from "../../catalog/downloaded/data-dictionary.json";
import {
  HCAAtlasTrackerDBEntrySheetValidation,
  Heatmap,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { EntrySheetValidationErrorInfo } from "../utils/hca-validation-tools/hca-validation-tools";
import { getBaseModelAtlasEntrySheetValidations } from "./entry-sheets";

const ENTITY_TYPES = ["dataset", "donor", "sample"] as const;

type EntityType = (typeof ENTITY_TYPES)[number];

export async function getAtlasHeatmap(atlasId: string): Promise<Heatmap> {
  const entrySheetValidations = await getBaseModelAtlasEntrySheetValidations(
    atlasId
  );
  return {
    classes: ENTITY_TYPES.map((entityType) => {
      const ddClass = dataDictionary.classes.find((c) => c.name === entityType);
      if (!ddClass) throw new Error(`Class not found for ${entityType}`);
      return getClassHeatmap(entityType, ddClass, entrySheetValidations);
    }),
  };
}

function getClassHeatmap(
  entityType: EntityType,
  ddClass: Class,
  entrySheetValidations: HCAAtlasTrackerDBEntrySheetValidation[]
): Heatmap["classes"][number] {
  const sheetsInfo: Heatmap["classes"][number]["sheets"] = [];
  for (const validation of entrySheetValidations) {
    // TODO the ID would be unnecessary if we change entry sheet validations to fall back to the source study's record of the sheet title
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
          validation.validation_report
        )
      );
    }
  }
  return {
    fields: ddClass.attributes.map((ddAttribute) => {
      return {
        name: ddAttribute.name,
        organSpecific: false,
        required: ddAttribute.required,
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
  errors: EntrySheetValidationErrorInfo[]
): Heatmap["classes"][number]["sheets"][number] {
  const correctCounts: Record<string, number> = Object.fromEntries(
    ddClass.attributes.map((a) => [a.name, rowCount])
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
