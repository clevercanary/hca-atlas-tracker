declare module "hca-metadata-schema/core_data_dictionary.json" {
  import { type DataDictionaryAttribute } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
  import { type DataDictionary } from "@databiosphere/findable-ui/lib/common/entities";

  const dataDictionary: DataDictionary<DataDictionaryAttribute>;

  export default dataDictionary;
}
