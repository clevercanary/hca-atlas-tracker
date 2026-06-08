import pg from "pg";
import dataDictionary from "../../catalog/downloaded/data-dictionary.json";
import {
  METADATA_COVERAGE_CLASSES,
  NETWORKS,
} from "../apis/catalog/hca-atlas-tracker/common/constants";
import {
  AtlasMetadataCoverage,
  AtlasMetadataCoverageBioNetwork,
  AtlasMetadataCoverageClass,
  FILE_TYPE,
  FileMetadataCoverage,
  MetadataCoverageClass,
  MetadataCoverageTier,
  NetworkKey,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  AtlasMetadataCoverageDBRow,
  getAtlasComponentAtlasMetadataCoverage,
  getAtlasSourceDatasetMetadataCoverage,
} from "../data/metadata-coverage";

type FieldCatalog = Record<MetadataCoverageClass, Set<string>>;

/**
 * Get the per-atlas, per-entity-class metadata completeness rollup that backs
 * the corpus-wide metadata completeness heatmap.
 * @param source - File type contributing coverage (source dataset or integrated object).
 * @param tiers - Field requirement tiers to include in the slot math.
 * @param client - Optional database client for transaction support.
 * @returns one entry per atlas, including atlases with no files of the requested source.
 */
export async function getAtlasCompletenessRollup(
  source: FILE_TYPE.INTEGRATED_OBJECT | FILE_TYPE.SOURCE_DATASET,
  tiers: MetadataCoverageTier[],
  client?: pg.PoolClient,
): Promise<AtlasMetadataCoverage[]> {
  const fieldCatalog = getFieldCatalog(new Set(tiers));
  const atlasRows = await getAtlasMetadataCoverage(source, client);
  return atlasRows.map((row) => buildAtlasCoverage(row, fieldCatalog));
}

/**
 * Get metadata coverage for files of the given type for each atlas.
 * @param source - File type to get metadata coverage for.
 * @param client - Optional Postgres client to use.
 * @returns per-atlas metadata coverage info for the given file type.
 */
async function getAtlasMetadataCoverage(
  source: FILE_TYPE.INTEGRATED_OBJECT | FILE_TYPE.SOURCE_DATASET,
  client?: pg.PoolClient,
): Promise<AtlasMetadataCoverageDBRow[]> {
  switch (source) {
    case FILE_TYPE.INTEGRATED_OBJECT: {
      return await getAtlasComponentAtlasMetadataCoverage(client);
    }
    case FILE_TYPE.SOURCE_DATASET: {
      return await getAtlasSourceDatasetMetadataCoverage(client);
    }
  }
}

/**
 * Build the set of in-scope field names per class from the data dictionary,
 * limited to the requested requirement tiers.
 * @param tiers - Requirement tiers to include.
 * @returns map of class name to in-scope field names.
 */
function getFieldCatalog(tiers: Set<MetadataCoverageTier>): FieldCatalog {
  const catalog = {} as FieldCatalog;
  for (const className of METADATA_COVERAGE_CLASSES) {
    const ddClass = dataDictionary.classes.find((c) => c.name === className);
    if (!ddClass)
      throw new Error(`Data dictionary class not found: ${className}`);
    const fields = new Set<string>();
    for (const attribute of ddClass.attributes) {
      const tier: MetadataCoverageTier = attribute.required
        ? "required"
        : "recommended";
      if (tiers.has(tier)) fields.add(attribute.name);
    }
    catalog[className] = fields;
  }
  return catalog;
}

/**
 * Build the rollup entry for a single atlas.
 * @param row - Atlas row with its files' metadata coverage blobs.
 * @param fieldCatalog - In-scope field names per class.
 * @returns atlas completeness entry.
 */
function buildAtlasCoverage(
  row: AtlasMetadataCoverageDBRow,
  fieldCatalog: FieldCatalog,
): AtlasMetadataCoverage {
  const classes = {} as Record<
    MetadataCoverageClass,
    AtlasMetadataCoverageClass
  >;
  for (const className of METADATA_COVERAGE_CLASSES) {
    classes[className] = buildClassCoverage(
      className,
      row.metadata_coverages,
      fieldCatalog[className],
    );
  }
  const total =
    METADATA_COVERAGE_CLASSES.reduce(
      (sum, className) => sum + (classes[className].completion ?? 0),
      0,
    ) / METADATA_COVERAGE_CLASSES.length;
  return {
    atlasId: row.id,
    bionetwork: getBioNetwork(row.overview.network),
    classes,
    generation: row.generation,
    integrationLeads: row.overview.integrationLead.map((lead) => ({
      id: lead.email,
      name: lead.name,
    })),
    name: row.overview.shortName,
    total,
    version: `${row.generation}.${row.revision}`,
  };
}

/**
 * Aggregate the slot math for a single (atlas, entity class) across all of the
 * atlas's coverage blobs.
 * @param className - Entity class being aggregated.
 * @param coverages - Metadata coverage blobs of the atlas's files.
 * @param inScopeFields - In-scope field names for the class.
 * @returns aggregated class coverage.
 */
function buildClassCoverage(
  className: MetadataCoverageClass,
  coverages: FileMetadataCoverage[],
  inScopeFields: Set<string>,
): AtlasMetadataCoverageClass {
  let entityCount = 0;
  let filledSlots = 0;
  let totalSlots = 0;
  for (const coverage of coverages) {
    entityCount += coverage.entities[className].recordCount;
    for (const fieldInfo of coverage.fieldCoverage) {
      if (
        fieldInfo.entityClass !== className ||
        !inScopeFields.has(fieldInfo.field)
      )
        continue;
      filledSlots += fieldInfo.complete;
      totalSlots +=
        fieldInfo.complete + fieldInfo.missing + fieldInfo.inconsistent;
    }
  }
  return {
    completion: totalSlots === 0 ? null : filledSlots / totalSlots,
    entityCount,
    filledSlots,
    totalSlots,
  };
}

/**
 * Get the bionetwork identifier and display label for an atlas's network key.
 * @param networkKey - Network key.
 * @returns bionetwork id and label.
 */
function getBioNetwork(
  networkKey: NetworkKey,
): AtlasMetadataCoverageBioNetwork {
  const network = NETWORKS.find((n) => n.key === networkKey);
  const label = (network?.name ?? networkKey).replace(/\sNetwork.*/i, "");
  return { id: networkKey, label };
}
