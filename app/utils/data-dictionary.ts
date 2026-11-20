import {
  type DataDictionaryAttribute,
  type NetworkKey,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { isNetworkKey } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { type Class } from "@databiosphere/findable-ui/lib/common/entities";
import dataDictionary from "hca-metadata-schema/core_data_dictionary.json";

export function getDataDictionaryClass(
  className: string,
): Class<DataDictionaryAttribute> {
  const ddClass = dataDictionary.classes.find((c) => c.name === className);
  if (!ddClass)
    throw new Error(`Data dictionary class not found: ${className}`);
  return ddClass;
}

/**
 * Get the bionetworks a data dictionary attribute applies to.
 * @param attribute - Data dictionary attribute.
 * @returns the attribute's `bioNetworks` annotation.
 * @throws Error - When the attribute has no `bioNetworks` list, or the list has a value that isn't a network key.
 */
export function getAttributeBioNetworks(
  attribute: DataDictionaryAttribute,
): NetworkKey[] {
  const bioNetworks = attribute.annotations?.bioNetworks;
  if (!Array.isArray(bioNetworks))
    throw new Error(
      `Data dictionary attribute has no bioNetworks list: ${attribute.name}`,
    );
  const unknownNetwork = bioNetworks.find((network) => !isNetworkKey(network));
  if (unknownNetwork !== undefined)
    throw new Error(
      `Data dictionary attribute ${attribute.name} has unknown bioNetwork: ${unknownNetwork}`,
    );
  return bioNetworks.filter(isNetworkKey);
}

/**
 * Get whether a data dictionary attribute is required on entry sheets.
 * @param attribute - Data dictionary attribute.
 * @returns the attribute's `entrySheetRequired` annotation if it has one, and otherwise whether it has any requirement level, so "strongly recommended" counts as required.
 * @throws Error - When the attribute's `entrySheetRequired` annotation is present but not a boolean.
 */
export function getAttributeEntrySheetRequired(
  attribute: DataDictionaryAttribute,
): boolean {
  const entrySheetRequired = attribute.annotations?.entrySheetRequired;
  if (entrySheetRequired === undefined) return Boolean(attribute.required);
  if (typeof entrySheetRequired !== "boolean")
    throw new Error(
      `Data dictionary attribute ${attribute.name} has non-boolean entrySheetRequired: ${JSON.stringify(entrySheetRequired)}`,
    );
  return entrySheetRequired;
}
