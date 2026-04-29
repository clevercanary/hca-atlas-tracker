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
  HCAAtlasTrackerDBComponentAtlas,
  HCAAtlasTrackerDBFile,
  HCAAtlasTrackerDBSourceDataset,
  IntegrationLead,
  INTEGRITY_STATUS,
  NetworkKey,
  Wave,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  updateComponentAtlasVersionInAtlas,
  updateSourceDatasetVersionInAtlas,
} from "../app/data/atlases";
import {
  createNewComponentAtlasVersion,
  markComponentAtlasAsNotLatest,
  updateSourceDatasetVersionInComponentAtlases,
} from "../app/data/component-atlases";
import {
  markPreviousVersionsAsNotLatest,
  upsertFileRecord,
} from "../app/data/files";
import {
  createNewSourceDatasetVersion,
  markSourceDatasetAsNotLatest,
} from "../app/data/source-datasets";
import { createAtlas } from "../app/services/atlases";
import { createComponentAtlas } from "../app/services/component-atlases";
import { getOrCreateConceptId } from "../app/services/concepts";
import { doTransaction, endPgPool } from "../app/services/database";
import { createSourceDataset } from "../app/services/source-datasets";

/**
 * Usage: `npx esrun db_scripts/generate-test-files.ts`
 * Any number of existing entity IDs can be added as arguments to the command; if none are specified, new atlases will be generated.
 * Specified entity IDs may be for atlases, component atlases, or source datasets.
 * File entries will be randomly generated for the given or generated atlases.
 * New file versions will be generated for the given component atlases and source datasets.
 */

const GENERATED_ATLAS_AMOUNT = 2;

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

  const atlasGeneratedCounts: [string, number, number][] = [];
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
        `No entity IDs specified; generated ${GENERATED_ATLAS_AMOUNT} new atlases`,
      );
    }

    // Add new files to specified atlases
    await generateAndAddFilesForAtlases(atlasIds, atlasGeneratedCounts, client);

    // Add new versions to files of specified component atlases and source datasets
    await generateAndAddFileVersionsForEntities(
      componentAtlasIds,
      sourceDatasetIds,
      fileGeneratedCounts,
      client,
    );
  });

  // Display counts of new files
  if (atlasGeneratedCounts.length) {
    console.log("Generated files:");
    for (const info of atlasGeneratedCounts) {
      const [atlasName, integratedObjectCount, sourceDatasetCount] = info;
      console.log(
        `  ${atlasName}: ${integratedObjectCount} integrated objects, ${sourceDatasetCount} source datasets`,
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
  atlasGeneratedCounts: [string, number, number][],
  client: pg.PoolClient,
): Promise<void> {
  if (atlasIds.length) {
    const { rows: atlases } = await client.query<HCAAtlasTrackerDBAtlas>(
      "SELECT * FROM hat.atlases WHERE id=ANY($1)",
      [atlasIds],
    );

    for (const atlas of atlases) {
      const counts = await generateAndAddFilesForAtlas(client, atlas);
      const name = `${atlas.overview.shortName} v${atlas.generation}.${atlas.revision}`;
      atlasGeneratedCounts.push([name, ...counts]);
    }
  }
}

async function generateAndAddFileVersionsForEntities(
  componentAtlasIds: string[],
  sourceDatasetIds: string[],
  fileGeneratedCounts: [string, number][],
  client: pg.PoolClient,
): Promise<void> {
  // Determine files associated with specified component atlases and source datasets
  const files: HCAAtlasTrackerDBFile[] = [];

  if (componentAtlasIds.length) {
    const queryResult = await client.query<HCAAtlasTrackerDBFile>(
      "SELECT f.* FROM hat.files f JOIN hat.component_atlases c ON f.id=c.file_id WHERE c.is_latest AND c.id=ANY($1)",
      [componentAtlasIds],
    );
    files.push(...queryResult.rows);
  }

  if (sourceDatasetIds.length) {
    const queryResult = await client.query<HCAAtlasTrackerDBFile>(
      "SELECT f.* FROM hat.files f JOIN hat.source_datasets d ON f.id=d.file_id WHERE d.is_latest AND d.id=ANY($1)",
      [sourceDatasetIds],
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
  client: pg.PoolClient,
): Promise<{
  atlasIds: string[];
  componentAtlasIds: string[];
  sourceDatasetIds: string[];
}> {
  const atlasesResult = await client.query<Pick<HCAAtlasTrackerDBAtlas, "id">>(
    "SELECT id FROM hat.atlases WHERE id=ANY($1)",
    [entityIds],
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
      ),
  );
  if (missingIds.length)
    throw new Error(`Entities not found for ID(s): ${missingIds.join(", ")}`);

  return { atlasIds, componentAtlasIds, sourceDatasetIds };
}

async function generateAndAddFilesForAtlas(
  client: pg.PoolClient,
  atlas: HCAAtlasTrackerDBAtlas,
): Promise<[number, number]> {
  const integratedObjectAmount = randomInRange(
    GENERATED_INTEGRATED_OBJECT_AMOUNT_MIN,
    GENERATED_INTEGRATED_OBJECT_AMOUNT_MAX,
  );
  const sourceDatasetAmount = randomInRange(
    GENERATED_SOURCE_DATASET_AMOUNT_MIN,
    GENERATED_SOURCE_DATASET_AMOUNT_MAX,
  );

  const bucketName = `test-${randomInRange(0, 99999)}`;
  const versioned = Boolean(randomInRange(0, 1));

  // Generate integrated object files linked to component atlases
  for (let i = 0; i < integratedObjectAmount; i++) {
    const { conceptId, fileId } = await generateAndAddFile(
      client,
      atlas,
      bucketName,
      versioned,
      "integrated-objects",
      FILE_TYPE.INTEGRATED_OBJECT,
      ".h5ad",
    );
    await createComponentAtlas(atlas.id, fileId, conceptId, client);
  }

  // Generate source dataset files linked to source datasets
  for (let i = 0; i < sourceDatasetAmount; i++) {
    const { conceptId, fileId } = await generateAndAddFile(
      client,
      atlas,
      bucketName,
      versioned,
      "source-datasets",
      FILE_TYPE.SOURCE_DATASET,
      ".h5ad",
    );
    await createSourceDataset(atlas.id, fileId, conceptId, client);
  }

  return [integratedObjectAmount, sourceDatasetAmount];
}

async function generateAndAddVersionsForFile(
  file: HCAAtlasTrackerDBFile,
  client: pg.PoolClient,
): Promise<number> {
  if (!file.concept_id)
    throw new Error(`Missing concept ID for file ${file.id}`);
  const conceptId = file.concept_id;

  const numVersions = randomInRange(
    GENERATED_FILE_VERSION_AMOUNT_MIN,
    GENERATED_FILE_VERSION_AMOUNT_MAX,
  );

  // Determine the atlas containing the file's metadata entity, since data-layer
  // helpers require the atlas ID to update its version arrays.
  const atlasId = await getFileAtlasId(file, client);

  const newFileIds: string[] = [];
  for (let i = 0; i < numVersions; i++) {
    await markPreviousVersionsAsNotLatest(conceptId, client);
    const newId = await generateAndAddFileVersion(
      client,
      file.bucket,
      file.version_id !== null,
      file.file_type,
      file.key,
      conceptId,
    );
    newFileIds.push(newId);
  }

  if (file.file_type === FILE_TYPE.INTEGRATED_OBJECT) {
    for (const newFileId of newFileIds) {
      const prevVersion = await markComponentAtlasAsNotLatest(
        conceptId,
        client,
      );
      const newVersion = await createNewComponentAtlasVersion(
        prevVersion,
        newFileId,
        client,
      );
      await updateComponentAtlasVersionInAtlas(
        prevVersion,
        newVersion,
        atlasId,
        client,
      );
    }
  } else if (file.file_type === FILE_TYPE.SOURCE_DATASET) {
    for (const newFileId of newFileIds) {
      const prevVersion = await markSourceDatasetAsNotLatest(conceptId, client);
      const newVersion = await createNewSourceDatasetVersion(
        prevVersion,
        newFileId,
        client,
      );
      await updateSourceDatasetVersionInAtlas(
        prevVersion,
        newVersion,
        atlasId,
        client,
      );
      await updateSourceDatasetVersionInComponentAtlases(
        prevVersion,
        newVersion,
        client,
      );
    }
  }

  return numVersions;
}

async function getFileAtlasId(
  file: HCAAtlasTrackerDBFile,
  client: pg.PoolClient,
): Promise<string> {
  let queryResult: pg.QueryResult<Pick<HCAAtlasTrackerDBAtlas, "id">>;
  if (file.file_type === FILE_TYPE.INTEGRATED_OBJECT) {
    queryResult = await client.query<Pick<HCAAtlasTrackerDBAtlas, "id">>(
      `SELECT DISTINCT a.id FROM hat.atlases a JOIN hat.component_atlases e ON e.version_id = ANY(a.component_atlases) WHERE e.file_id = $1`,
      [file.id],
    );
  } else if (file.file_type === FILE_TYPE.SOURCE_DATASET) {
    queryResult = await client.query<Pick<HCAAtlasTrackerDBAtlas, "id">>(
      `SELECT DISTINCT a.id FROM hat.atlases a JOIN hat.source_datasets e ON e.version_id = ANY(a.source_datasets) WHERE e.file_id = $1`,
      [file.id],
    );
  } else {
    throw new Error(`Unexpected file type: ${file.file_type}`);
  }
  if (queryResult.rows.length !== 1)
    throw new Error(
      `Expected exactly 1 atlas for file ${file.id}, got ${queryResult.rows.length}`,
    );
  return queryResult.rows[0].id;
}

async function generateAndAddFile(
  client: pg.PoolClient,
  atlas: HCAAtlasTrackerDBAtlas,
  bucketName: string,
  versioned: boolean,
  folderName: string,
  fileType: FILE_TYPE.INTEGRATED_OBJECT | FILE_TYPE.SOURCE_DATASET,
  extension: string,
): Promise<{ conceptId: string; fileId: string }> {
  const fileName = crypto.randomUUID() + extension;
  const key = `${atlas.overview.network}/${
    atlas.short_name_slug
  }-v${atlas.generation}-${atlas.revision}/${folderName}/${fileName}`;
  const conceptId = await getOrCreateConceptId(
    {
      atlas_short_name: atlas.short_name_slug,
      base_filename: fileName,
      file_type: fileType,
      generation: atlas.generation,
      network: atlas.overview.network,
    },
    client,
  );
  const fileId = await generateAndAddFileVersion(
    client,
    bucketName,
    versioned,
    fileType,
    key,
    conceptId,
  );
  return { conceptId, fileId };
}

async function generateAndAddFileVersion(
  client: pg.PoolClient,
  bucketName: string,
  versioned: boolean,
  fileType: FILE_TYPE,
  key: string,
  conceptId: string,
): Promise<string> {
  const versionId = versioned
    ? randomInRange(0, 999999).toString().padStart(6, "0")
    : null;
  const eTag = crypto.randomUUID().replaceAll("-", "");
  const eventInfo: FileEventInfo = {
    eventName: "ObjectCreated:*",
    eventTime: new Date(randomInRange(1755755554042, Date.now())).toISOString(),
  };
  const snsMessageId = crypto.randomUUID();

  const result = await upsertFileRecord(
    {
      bucket: bucketName,
      conceptId,
      etag: eTag,
      eventInfo: JSON.stringify(eventInfo),
      fileType,
      integrityStatus: INTEGRITY_STATUS.PENDING,
      key,
      sha256Client: null,
      sizeBytes: randomInRange(1e3, 1e12),
      snsMessageId,
      validationStatus: FILE_VALIDATION_STATUS.PENDING,
      versionId,
    },
    client,
  );

  return result.id;
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
  // Create a random sequence of letters to name the atlas with
  const shortNameDiscriminator = Array.from({ length: 5 }, () =>
    String.fromCodePoint(65 + randomInRange(0, 25)),
  ).join("");
  const shortName = `Files Test ${shortNameDiscriminator}`;
  const generation = randomInRange(0, 9);
  const revision = randomInRange(0, 9);
  const wave = chooseRandom(waveOptions);
  const status = chooseRandom(atlasStatusOptions);
  const integrationLead = chooseRandom(integrationLeadOptions);

  const atlas = await createAtlas(
    {
      capId: null,
      integrationLead: [integrationLead],
      network,
      shortName,
      status,
      wave,
    },
    client,
  );

  await client.query(
    "UPDATE hat.atlases SET generation = $1, revision = $2 WHERE id = $3",
    [generation, revision, atlas.id],
  );

  return atlas.id;
}

function chooseRandom<T>(arr: T[]): T {
  return arr[randomInRange(0, arr.length - 1)];
}

function randomInRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
