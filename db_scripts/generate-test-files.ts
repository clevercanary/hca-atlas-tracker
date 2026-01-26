import pg from "pg";
import {
  NETWORK_KEYS,
  WAVES,
} from "../app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  ATLAS_STATUS,
  FILE_TYPE,
  FILE_VALIDATION_STATUS,
  FileEventInfo,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBAtlasOverview,
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBComponentAtlasInfo,
  HCAAtlasTrackerDBFile,
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetInfo,
  IntegrationLead,
  INTEGRITY_STATUS,
  NetworkKey,
  PUBLICATION_STATUS,
  SYSTEM,
  Wave,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { doTransaction, endPgPool } from "../app/services/database";

/**
 * Usage: `npx esrun db_scripts/generate-test-files.ts`
 * Any number of existing entity IDs can be added as arguments to the command; if none are specified, new atlases will be generated.
 * Specified entity IDs may be for atlases, component atlases, or source datasets.
 * File entries will be randomly generated for the given or generated atlases.
 * New file versions will be generated for the given component atlases and source datasets.
 */

const GENERATED_ATLAS_AMOUNT = 2;

const GENERATED_MANIFEST_AMOUNT_MIN = 1;
const GENERATED_MANIFEST_AMOUNT_MAX = 2;

const GENERATED_INTEGRATED_OBJECT_AMOUNT_MIN = 1;
const GENERATED_INTEGRATED_OBJECT_AMOUNT_MAX = 4;

const GENERATED_SOURCE_DATASET_AMOUNT_MIN = 1;
const GENERATED_SOURCE_DATASET_AMOUNT_MAX = 4;

const GENERATED_FILE_VERSION_AMOUNT_MIN = 1;
const GENERATED_FILE_VERSION_AMOUNT_MAX = 3;

const networkOptions: NetworkKey[] = NETWORK_KEYS.slice();
const waveOptions: Wave[] = WAVES.slice();
const atlasStatusOptions = Object.values(ATLAS_STATUS);
const integrationLeadOptions: IntegrationLead[] = [
  {
    email: "foo@example.com",
    name: "Foo",
  },
  {
    email: "bar@example.com",
    name: "Bar",
  },
  {
    email: "baz@example.com",
    name: "Baz",
  },
];

generateAndAddFiles();

async function generateAndAddFiles(): Promise<void> {
  const entityIds = process.argv.slice(2);

  const atlasGeneratedCounts: [string, number, number, number][] = [];
  const fileGeneratedCounts: [string, number][] = [];

  await doTransaction(async (client) => {
    let atlasIds: string[];
    let componentAtlasIds: string[];
    let sourceDatasetIds: string[];

    if (entityIds.length) {
      // If entity IDs are specified, determine their entity types
      ({ atlasIds, componentAtlasIds, sourceDatasetIds } =
        await categorizeEntityIds(entityIds, client));
    } else {
      // Otherwise, create new atlases
      atlasIds = await generateAndAddAtlases(client);
      componentAtlasIds = [];
      sourceDatasetIds = [];
      console.log(
        `No entity IDs specified; generated ${GENERATED_ATLAS_AMOUNT} new atlases`
      );
    }

    // Add new files to specified atlases
    await generateAndAddFilesForAtlases(atlasIds, atlasGeneratedCounts, client);

    // Add new versions to files of specified component atlases and source datasets
    await generateAndAddFileVersionsForEntities(
      componentAtlasIds,
      sourceDatasetIds,
      fileGeneratedCounts,
      client
    );
  });

  // Display counts of new files
  if (atlasGeneratedCounts.length) {
    console.log("Generated files:");
    for (const info of atlasGeneratedCounts) {
      const [
        atlasName,
        manifestCount,
        integratedObjectCount,
        sourceDatasetCount,
      ] = info;
      console.log(
        `  ${atlasName}: ${manifestCount} manifests, ${integratedObjectCount} integrated objects, ${sourceDatasetCount} source datasets`
      );
    }
    if (fileGeneratedCounts.length) console.log("");
  }

  // Display counts of new file versions
  if (fileGeneratedCounts.length) {
    console.log("Generated file versions:");
    for (const [key, count] of fileGeneratedCounts) {
      console.log(`  ${key}: ${count}`);
    }
  }

  endPgPool();
}

async function generateAndAddFilesForAtlases(
  atlasIds: string[],
  atlasGeneratedCounts: [string, number, number, number][],
  client: pg.PoolClient
): Promise<void> {
  if (atlasIds.length) {
    const { rows: atlases } = await client.query<HCAAtlasTrackerDBAtlas>(
      "SELECT * FROM hat.atlases WHERE id=ANY($1)",
      [atlasIds]
    );

    for (const atlas of atlases) {
      const counts = await generateAndAddFilesForAtlas(client, atlas);
      const name = `${atlas.overview.shortName} v${atlas.overview.version}`;
      atlasGeneratedCounts.push([name, ...counts]);
    }
  }
}

async function generateAndAddFileVersionsForEntities(
  componentAtlasIds: string[],
  sourceDatasetIds: string[],
  fileGeneratedCounts: [string, number][],
  client: pg.PoolClient
): Promise<void> {
  // Determine files associated with specified component atlases and source datasets
  const files: HCAAtlasTrackerDBFile[] = [];

  if (componentAtlasIds.length) {
    const queryResult = await client.query<HCAAtlasTrackerDBFile>(
      "SELECT f.* FROM hat.files f JOIN hat.component_atlases c ON f.id=c.file_id WHERE c.is_latest AND c.id=ANY($1)",
      [componentAtlasIds]
    );
    files.push(...queryResult.rows);
  }

  if (sourceDatasetIds.length) {
    const queryResult = await client.query<HCAAtlasTrackerDBFile>(
      "SELECT f.* FROM hat.files f JOIN hat.source_datasets d ON f.id=d.file_id WHERE d.is_latest AND d.id=ANY($1)",
      [sourceDatasetIds]
    );
    files.push(...queryResult.rows);
  }

  // And new versions for the identified files
  if (files.length) {
    for (const file of files) {
      const count = await generateAndAddVersionsForFile(file, client);
      fileGeneratedCounts.push([file.key, count]);
    }
  }
}

async function categorizeEntityIds(
  entityIds: string[],
  client: pg.PoolClient
): Promise<{
  atlasIds: string[];
  componentAtlasIds: string[];
  sourceDatasetIds: string[];
}> {
  const atlasesResult = await client.query<Pick<HCAAtlasTrackerDBAtlas, "id">>(
    "SELECT id FROM hat.atlases WHERE id=ANY($1)",
    [entityIds]
  );
  const atlasIds = atlasesResult.rows.map(({ id }) => id);

  const componentAtlasesResult = await client.query<
    Pick<HCAAtlasTrackerDBComponentAtlas, "id">
  >("SELECT id FROM hat.component_atlases WHERE id=ANY($1) AND is_latest", [
    entityIds,
  ]);
  const componentAtlasIds = componentAtlasesResult.rows.map(({ id }) => id);

  const sourceDatasetsResult = await client.query<
    Pick<HCAAtlasTrackerDBSourceDataset, "id">
  >("SELECT id FROM hat.source_datasets WHERE id=ANY($1) AND is_latest", [
    entityIds,
  ]);
  const sourceDatasetIds = sourceDatasetsResult.rows.map(({ id }) => id);

  const missingIds = entityIds.filter(
    (id) =>
      !(
        atlasIds.includes(id) ||
        componentAtlasIds.includes(id) ||
        sourceDatasetIds.includes(id)
      )
  );
  if (missingIds.length)
    throw new Error(`Entities not found for ID(s): ${missingIds.join(", ")}`);

  return { atlasIds, componentAtlasIds, sourceDatasetIds };
}

async function generateAndAddFilesForAtlas(
  client: pg.PoolClient,
  atlas: HCAAtlasTrackerDBAtlas
): Promise<[number, number, number]> {
  const manifestAmount = randomInRange(
    GENERATED_MANIFEST_AMOUNT_MIN,
    GENERATED_MANIFEST_AMOUNT_MAX
  );
  const integratedObjectAmount = randomInRange(
    GENERATED_INTEGRATED_OBJECT_AMOUNT_MIN,
    GENERATED_INTEGRATED_OBJECT_AMOUNT_MAX
  );
  const sourceDatasetAmount = randomInRange(
    GENERATED_SOURCE_DATASET_AMOUNT_MIN,
    GENERATED_SOURCE_DATASET_AMOUNT_MAX
  );

  const bucketName = `test-${randomInRange(0, 99999)}`;
  const versioned = Boolean(randomInRange(0, 1));

  // Generate manifest files (no metadata object needed)
  for (let i = 0; i < manifestAmount; i++) {
    await generateAndAddFile(
      client,
      atlas,
      bucketName,
      versioned,
      "manifests",
      FILE_TYPE.INGEST_MANIFEST,
      ".json"
    );
  }

  // Generate integrated object files linked to component atlases
  for (let i = 0; i < integratedObjectAmount; i++) {
    const file = await generateAndAddFile(
      client,
      atlas,
      bucketName,
      versioned,
      "integrated-objects",
      FILE_TYPE.INTEGRATED_OBJECT,
      ".h5ad"
    );
    await createComponentAtlas(client, atlas, file.id);
  }

  // Generate source dataset files linked to source datasets
  for (let i = 0; i < sourceDatasetAmount; i++) {
    const file = await generateAndAddFile(
      client,
      atlas,
      bucketName,
      versioned,
      "source-datasets",
      FILE_TYPE.SOURCE_DATASET,
      ".h5ad"
    );
    await createSourceDataset(client, atlas, file.id);
  }

  return [manifestAmount, integratedObjectAmount, sourceDatasetAmount];
}

async function generateAndAddVersionsForFile(
  file: HCAAtlasTrackerDBFile,
  client: pg.PoolClient
): Promise<number> {
  const numVersions = randomInRange(
    GENERATED_FILE_VERSION_AMOUNT_MIN,
    GENERATED_FILE_VERSION_AMOUNT_MAX
  );

  const newIds: string[] = [];
  let latestId = file.id;

  for (let i = 0; i < numVersions; i++) {
    await client.query("UPDATE hat.files SET is_latest=FALSE WHERE id=$1", [
      latestId,
    ]);
    const newId = (
      await generateAndAddFileVersion(
        client,
        file.bucket,
        file.version_id !== null,
        file.file_type,
        file.key
      )
    ).id;
    newIds.push(newId);
    latestId = newId;
  }

  if (file.file_type === FILE_TYPE.INTEGRATED_OBJECT) {
    const componentAtlasResult =
      await client.query<HCAAtlasTrackerDBComponentAtlas>(
        "UPDATE hat.component_atlases SET is_latest = FALSE WHERE file_id = $1 RETURNING *",
        [file.id]
      );
    if (componentAtlasResult.rowCount === 0)
      throw new Error(`Failed to find metadata entity for file ${file.id}`);
    const existingComponentAtlas = componentAtlasResult.rows[0];
    let newComponentAtlasVersion = existingComponentAtlas.version_id;
    for (const [i, newId] of newIds.entries()) {
      const newComponentAtlasResult = await client.query<
        Pick<HCAAtlasTrackerDBComponentAtlas, "version_id">
      >(
        `
          INSERT INTO hat.component_atlases (component_info, file_id, id, is_latest, source_datasets, wip_number)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING version_id
        `,
        [
          JSON.stringify(existingComponentAtlas.component_info),
          newId,
          existingComponentAtlas.id,
          i === newIds.length - 1,
          existingComponentAtlas.source_datasets,
          existingComponentAtlas.wip_number + 1 + i,
        ]
      );
      newComponentAtlasVersion = newComponentAtlasResult.rows[0].version_id;
    }
    await client.query(
      "UPDATE hat.atlases SET component_atlases = ARRAY_REPLACE(component_atlases, $1, $2)",
      [existingComponentAtlas.version_id, newComponentAtlasVersion]
    );
  } else if (file.file_type === FILE_TYPE.SOURCE_DATASET) {
    const sourceDatasetResult = await client.query(
      "UPDATE hat.source_datasets SET file_id = $1, wip_number = wip_number + $3 WHERE file_id = $2",
      [latestId, file.id, newIds.length]
    );
    if (sourceDatasetResult.rowCount === 0)
      throw new Error(`Failed to find metadata entity for file ${file.id}`);
  }

  return numVersions;
}

async function generateAndAddFile(
  client: pg.PoolClient,
  atlas: HCAAtlasTrackerDBAtlas,
  bucketName: string,
  versioned: boolean,
  folderName: string,
  fileType: FILE_TYPE,
  extension: string
): Promise<HCAAtlasTrackerDBFile> {
  const fileName = crypto.randomUUID() + extension;
  const key = `${atlas.overview.network}/${
    atlas.overview.shortName
  }-v${atlas.overview.version.replaceAll(".", "-")}/${folderName}/${fileName}`;
  return await generateAndAddFileVersion(
    client,
    bucketName,
    versioned,
    fileType,
    key
  );
}

async function generateAndAddFileVersion(
  client: pg.PoolClient,
  bucketName: string,
  versioned: boolean,
  fileType: FILE_TYPE,
  key: string
): Promise<HCAAtlasTrackerDBFile> {
  const versionId = versioned
    ? randomInRange(0, 999999).toString().padStart(6, "0")
    : null;
  const eTag = crypto.randomUUID().replaceAll("-", "");
  const eventInfo: FileEventInfo = {
    eventName: "ObjectCreated:*",
    eventTime: new Date(randomInRange(1755755554042, Date.now())).toISOString(),
  };
  const snsMessageId = crypto.randomUUID();

  const insertResult = await client.query<HCAAtlasTrackerDBFile>(
    `
      INSERT INTO hat.files (bucket, key, version_id, etag, size_bytes, event_info, sha256_client, integrity_status, validation_status, is_latest, file_type, sns_message_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, $10, $11)
      RETURNING *
    `,
    [
      bucketName,
      key,
      versionId,
      eTag,
      randomInRange(1e3, 1e12),
      JSON.stringify(eventInfo),
      null,
      INTEGRITY_STATUS.PENDING,
      FILE_VALIDATION_STATUS.PENDING,
      fileType,
      snsMessageId,
    ]
  );

  return insertResult.rows[0];
}

async function createComponentAtlas(
  client: pg.PoolClient,
  atlas: HCAAtlasTrackerDBAtlas,
  fileId: string
): Promise<string> {
  const componentAtlasVersion = crypto.randomUUID();
  const info: HCAAtlasTrackerDBComponentAtlasInfo = {
    capUrl: null,
  };

  await client.query(
    `
      INSERT INTO hat.component_atlases (version_id, component_info, file_id)
      VALUES ($1, $2, $3)
    `,
    [componentAtlasVersion, JSON.stringify(info), fileId]
  );

  await client.query(
    "UPDATE hat.atlases SET component_atlases = component_atlases || $1::uuid WHERE id = $2",
    [componentAtlasVersion, atlas.id]
  );

  return componentAtlasVersion;
}

async function createSourceDataset(
  client: pg.PoolClient,
  atlas: HCAAtlasTrackerDBAtlas,
  fileId: string
): Promise<string> {
  const sourceDatasetId = crypto.randomUUID();
  const sourceDatasetVersion = crypto.randomUUID();

  const sd_info: HCAAtlasTrackerDBSourceDatasetInfo = {
    capUrl: null,
    metadataSpreadsheetTitle: null,
    metadataSpreadsheetUrl: null,
    publicationStatus: PUBLICATION_STATUS.UNSPECIFIED,
  };

  await client.query(
    `
      INSERT INTO hat.source_datasets (id, sd_info, file_id, version_id)
      VALUES ($1, $2, $3, $4)
    `,
    [sourceDatasetId, JSON.stringify(sd_info), fileId, sourceDatasetVersion]
  );

  await client.query(
    "UPDATE hat.files SET source_dataset_id = $1 WHERE id = $2",
    [sourceDatasetId, fileId]
  );

  await client.query(
    "UPDATE hat.atlases SET source_datasets = source_datasets || $1::uuid WHERE id=$2",
    [sourceDatasetVersion, atlas.id]
  );

  return sourceDatasetId;
}

async function generateAndAddAtlases(client: pg.PoolClient): Promise<string[]> {
  const ids: string[] = [];
  for (let i = 0; i < GENERATED_ATLAS_AMOUNT; i++) {
    ids.push(await generateAndAddAtlas(client));
  }
  return ids;
}

async function generateAndAddAtlas(client: pg.PoolClient): Promise<string> {
  const network = chooseRandom(networkOptions);
  const shortName = `files_test_${randomInRange(0, 99999)}`;
  const version = `${randomInRange(0, 9)}.${randomInRange(0, 9)}`;
  const wave = chooseRandom(waveOptions);
  const status = chooseRandom(atlasStatusOptions);
  const integrationLead = chooseRandom(integrationLeadOptions);
  const overview: HCAAtlasTrackerDBAtlasOverview = {
    capId: null,
    cellxgeneAtlasCollection: null,
    codeLinks: [],
    completedTaskCount: 0,
    description: "",
    highlights: "",
    ingestionTaskCounts: {
      [SYSTEM.CAP]: { completedCount: 0, count: 0 },
      [SYSTEM.CELLXGENE]: { completedCount: 0, count: 0 },
      [SYSTEM.HCA_DATA_REPOSITORY]: { completedCount: 0, count: 0 },
    },
    integrationLead: [integrationLead],
    metadataCorrectnessUrl: null,
    metadataSpecificationTitle: null,
    metadataSpecificationUrl: null,
    network,
    publications: [],
    shortName,
    taskCount: 0,
    version,
    wave,
  };

  const result = await client.query<Pick<HCAAtlasTrackerDBAtlas, "id">>(
    "INSERT INTO hat.atlases (overview, source_studies, status, target_completion) VALUES ($1, $2, $3, $4) RETURNING id",
    [JSON.stringify(overview), "[]", status, null]
  );

  return result.rows[0].id;
}

function chooseRandom<T>(arr: T[]): T {
  return arr[randomInRange(0, arr.length - 1)];
}

function randomInRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
