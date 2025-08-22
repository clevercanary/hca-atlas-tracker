import pg from "pg";
import {
  NETWORK_KEYS,
  WAVES,
} from "../app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  ATLAS_STATUS,
  FILE_STATUS,
  FILE_TYPE,
  FileEventInfo,
  HCAAtlasTrackerDBAtlas,
  HCAAtlasTrackerDBAtlasOverview,
  IntegrationLead,
  INTEGRITY_STATUS,
  NetworkKey,
  SYSTEM,
  Wave,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { doTransaction, endPgPool } from "../app/services/database";

/**
 * Usage: `npx esrun db_scripts/generate-test-files.ts`
 * Any number of existing atlas IDs can be added as arguments to the command; if none are specified, new atlases will be generated.
 * File entries will be randomly generated for the given or generated atlases.
 */

const GENERATED_ATLAS_AMOUNT = 2;

const GENERATED_MANIFEST_AMOUNT_MIN = 1;
const GENERATED_MANIFEST_AMOUNT_MAX = 2;

const GENERATED_INTEGRATED_OBJECT_AMOUNT_MIN = 1;
const GENERATED_INTEGRATED_OBJECT_AMOUNT_MAX = 4;

const GENERATED_SOURCE_DATASET_AMOUNT_MIN = 1;
const GENERATED_SOURCE_DATASET_AMOUNT_MAX = 4;

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
  let atlasIds = process.argv.slice(2);

  const generatedCounts: [string, number, number, number][] = [];

  await doTransaction(async (client) => {
    if (!atlasIds.length) {
      atlasIds = await generateAndAddAtlases(client);
      console.log(
        `No atlas IDs specified; generated ${GENERATED_ATLAS_AMOUNT} new atlases`
      );
    }

    const { rows: atlases } = await client.query<HCAAtlasTrackerDBAtlas>(
      "SELECT * FROM hat.atlases WHERE id=ANY($1)",
      [atlasIds]
    );

    const missingIds = atlasIds.filter(
      (id) => !atlases.some((a) => a.id === id)
    );
    if (missingIds.length)
      throw new Error(`Atlases don't exist: ${atlasIds.join(", ")}`);

    for (const atlas of atlases) {
      const counts = await generateAndAddFilesForAtlas(client, atlas);
      const name = `${atlas.overview.shortName} v${atlas.overview.version}`;
      generatedCounts.push([name, ...counts]);
    }
  });

  console.log("Generated files:");
  for (const info of generatedCounts) {
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

  endPgPool();
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
  for (let i = 0; i < integratedObjectAmount; i++) {
    await generateAndAddFile(
      client,
      atlas,
      bucketName,
      versioned,
      "integrated-objects",
      FILE_TYPE.INTEGRATED_OBJECT,
      ".h5ad"
    );
  }
  for (let i = 0; i < sourceDatasetAmount; i++) {
    await generateAndAddFile(
      client,
      atlas,
      bucketName,
      versioned,
      "source-datasets",
      FILE_TYPE.SOURCE_DATASET,
      ".h5ad"
    );
  }

  return [manifestAmount, integratedObjectAmount, sourceDatasetAmount];
}

async function generateAndAddFile(
  client: pg.PoolClient,
  atlas: HCAAtlasTrackerDBAtlas,
  bucketName: string,
  versioned: boolean,
  folderName: string,
  fileType: FILE_TYPE,
  extension: string
): Promise<void> {
  const fileName = crypto.randomUUID() + extension;
  const key = `${atlas.overview.network}/${
    atlas.overview.shortName
  }-v${atlas.overview.version.replaceAll(".", "-")}/${folderName}/${fileName}`;
  const versionId = versioned
    ? randomInRange(0, 999999).toString().padStart(6, "0")
    : null;
  const eTag = crypto.randomUUID().replaceAll("-", "");
  const eventInfo: FileEventInfo = {
    eventName: "ObjectCreated:*",
    eventTime: new Date(randomInRange(1755755554042, Date.now())).toISOString(),
  };

  await client.query(
    `
      INSERT INTO hat.files (bucket, key, version_id, etag, size_bytes, event_info, sha256_client, integrity_status, status, is_latest, file_type, source_study_id, atlas_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, $10, NULL, $11)
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
      FILE_STATUS.UPLOADED,
      fileType,
      fileType === FILE_TYPE.SOURCE_DATASET ? null : atlas.id,
    ]
  );
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
