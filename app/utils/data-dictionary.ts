import { type NetworkKey } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { isNetworkKey } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import {
  type Attribute,
  type Class,
} from "@databiosphere/findable-ui/lib/common/entities";
import dataDictionary from "hca-metadata-schema/core_data_dictionary.json";

export function getDataDictionaryClass(className: string): Class {
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
export function getAttributeBioNetworks(attribute: Attribute): NetworkKey[] {
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
