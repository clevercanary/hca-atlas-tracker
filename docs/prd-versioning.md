# PRD: Atlas Versioning Implementation

## Overview

This document describes the versioning strategy for HCA Atlases, integrated objects, and source datasets in the HCA Atlas Tracker. The goal is to support:

1. **Versioned Atlas Releases** - Allow atlas developers to publish versioned updates
2. **Versioned Development Checkpoints** - Track work-in-progress iterations
3. **Historical Access** - Older versions remain accessible

## Glossary

| Term                  | Definition                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| **Atlas**             | A container holding IOs and SDs with their mappings                                                       |
| **Integrated Object** | An anndata file combining cells/metadata from multiple source datasets                                    |
| **Source Dataset**    | A dataset from a source study selected for integration                                                    |
| **Source Study**      | A publication that generated datasets                                                                     |
| **Generation**        | Major atlas iteration (1, 2, 3...) - manually bumped when creating new version (e.g., adding new studies) |
| **Revision**          | Published update within a generation (0, 1, 2...)                                                         |
| **WIP Number**        | Work-in-progress checkpoint counter within a revision                                                     |

## Versioning Scheme

### Published Atlas Naming

- Atlas: `atlas-name-v{generation}.{revision}` (e.g., `my-atlas-v1.1`)
- Files: `file-name-r{revision}.h5ad` (e.g., `my-dataset-r2.h5ad`)

### Draft Atlas Naming

- Atlas: `atlas-name-v{generation}.{revision}-draft` (e.g., `my-atlas-v1.2-draft`)
- Files: `file-name-r{revision}-wip-{checkpoint}.h5ad` (e.g., `my-dataset-r2-wip-3.h5ad`)

### Example Lifecycle

```
Initial development (generation 1, revision 0):
  my-atlas-v1.0-draft
    integrated-object-a-r1-wip-1.h5ad
    integrated-object-a-r1-wip-2.h5ad  (new upload)
    integrated-object-a-r1-wip-3.h5ad  (new upload)

First publish:
  my-atlas-v1.0
    integrated-object-a-r1.h5ad  (same file, wip hidden)

Post-publish update (generation 1, revision 1):
  my-atlas-v1.1-draft
    integrated-object-a-r2-wip-1.h5ad  (new upload → revision increments)

Second publish:
  my-atlas-v1.1
    integrated-object-a-r2.h5ad
```

## Current Implementation State

### What Exists

| Entity              | Columns                                                  | Behavior                                   |
| ------------------- | -------------------------------------------------------- | ------------------------------------------ |
| `files`             | `is_latest`, `version_id` (S3)                           | New row per S3 upload                      |
| `source_datasets`   | `id`, `version_id`, `is_latest`, `wip_number`, `file_id` | New row per file version; metadata mutable |
| `component_atlases` | `id`, `version_id`, `is_latest`, `wip_number`, `file_id` | New row per file version; metadata mutable |
| `atlases`           | `status`, `overview.version`                             | No versioning; arrays store version_ids    |

### What's Missing

| Entity              | Needed Columns/Changes                                                                  |
| ------------------- | --------------------------------------------------------------------------------------- |
| `source_datasets`   | `revision_number`, `published_at`                                                       |
| `component_atlases` | `revision_number`, `published_at`; REMOVE `source_datasets[]` array                     |
| `atlases`           | `generation`, `revision`, `draft`; MIGRATE `component_atlases` from `uuid[]` to `jsonb` |

## Design Principles

### Partial Ledger Pattern

**Files Table:**

- New row only when AWS file is new
- File key and AWS version are immutable
- Metadata fields (validation_status, integrity_status, etc.) are mutable

**Source Datasets / Integrated Objects:**

- New row ONLY when new file version uploaded
- **Only `file_id` is immutable** - everything else can change even after publishing
- Metadata fields (capUrl, etc.) are mutable
- Version/revision represents the FILE version, not metadata state

**Atlases:**

- Published atlas:
  - **Frozen (cannot change):**
    - Set of IOs in the atlas (cannot add/remove IOs)
    - Set of SDs in the atlas (cannot add/remove SDs)
    - File versions (cannot upload new files for existing SDs/IOs)
  - **Mutable:**
    - SD→IO mappings (can link/unlink existing SDs to existing IOs)
    - Source studies (reference material)
    - Other atlas metadata (integration leads, etc.)
- Draft atlas: all changes allowed (add/remove SDs/IOs, new file uploads, change mappings)
- **New atlas version required** to add/remove SDs/IOs or upload new files

### SD→IO Relationship Lives on Atlas (Key Architecture Decision)

**Problem:** If SD→IO mappings are stored on the IO entity itself, then editing mappings on a draft atlas would also affect any published atlas sharing that IO version.

**Solution:** Store SD→IO mappings at the Atlas level, not on the IO.

**Schema Change:** Migrate existing `component_atlases` column from `uuid[]` to `jsonb`:

```typescript
// Before (current):
component_atlases: uuid[]  // ["io1-version-id", "io2-version-id"]

// After (migrated):
component_atlases: jsonb   // with SD mappings embedded
```

**New Atlas Structure:**

```typescript
{
  id: "atlas-uuid",
  // ... other fields ...
  source_datasets: ["sd1-version-id", "sd2-version-id"],  // flat list (unchanged)
  component_atlases: [  // migrated from uuid[] to jsonb
    {
      io_version_id: "io1-version-id",
      source_datasets: ["sd1-version-id"]
    },
    {
      io_version_id: "io2-version-id",
      source_datasets: ["sd2-version-id"]
    }
  ]
}
```

**Constraint:** Any SD in an IO's `source_datasets` within the atlas must also exist in the atlas's flat `source_datasets` list.

**Benefits:**

- Complete isolation between atlas versions
- Draft and published can share IO versions without affecting each other's mappings
- No copy-on-write complexity needed

### Version Numbering Rules

**WIP Number:**

- Increments on each new file upload within a draft revision
- Stays on the record after publish (just hidden from display)

**Revision Number:**

- Set to 1 on first file upload
- Increments only when uploading a new file AFTER the previous version was published
- Represents the "r" in `filename-r{revision}.h5ad`

**Published At:**

- `NULL` while draft
- Set to timestamp when atlas is published
- Used to determine display format (show/hide wip)
- **Publishing is one-way** - cannot unpublish

### Version Bump Triggers

| Event                              | SD Version? | IO Version? | Atlas Version?      |
| ---------------------------------- | ----------- | ----------- | ------------------- |
| New SD file uploaded to draft      | wip bump    | No          | No                  |
| New IO file uploaded to draft      | N/A         | wip bump    | No                  |
| SD linked to/removed from IO       | No          | No          | No (metadata only)  |
| IO added to/removed from Atlas     | N/A         | No          | No (metadata only)  |
| Publish Atlas                      | No          | No          | Freezes, wip hidden |
| Any file change to published atlas | N/A         | N/A         | Must create draft   |

### No Cascade on File Upload

**Important:** File uploads do NOT automatically create draft atlases.

- To upload a new file for an SD/IO on a published atlas, the user must first create a new draft atlas version
- The file upload is then made to the draft atlas
- This prevents accidental modifications and makes versioning explicit

### Automatic Version Updates in Draft Atlas

When a new SD/IO file is uploaded to a **draft** atlas for an existing entity (same filename within same bionetwork):

1. **New version created** with appropriate revision/wip numbers
2. **Atlas `source_datasets[]` updated:** Old version_id replaced with new version_id
3. **Atlas `component_atlases` jsonb updated:**
   - For SD uploads: All references to old SD version_id replaced with new version_id in all IO mappings
   - For IO uploads: The IO entry's `io_version_id` is replaced; `source_datasets` array is preserved
4. **Only the target atlas is modified** - other atlases sharing the same SD/IO version are NOT affected

**Example (SD upload):**

```
Before upload to v1.1 (draft):
  v1.0 (published): source_datasets = [SD1-r1]
  v1.1 (draft):     source_datasets = [SD1-r1]

After uploading new SD1 file to v1.1:
  v1.0 (published): source_datasets = [SD1-r1]     ← unchanged
  v1.1 (draft):     source_datasets = [SD1-r2-wip-1] ← updated
```

**Example (IO upload):**

```
Before upload to v1.1 (draft):
  v1.1: component_atlases = [{io: IO1-r1, sds: [SD1-r1, SD2-r1]}]

After uploading new IO1 file to v1.1:
  v1.1: component_atlases = [{io: IO1-r2-wip-1, sds: [SD1-r1, SD2-r1]}]
  (SD mappings preserved)
```

**Note:** This behavior is already implemented but currently updates ALL atlases. Ticket 3.4 fixes this to scope updates to the target atlas only.

### Linking Rules

- SD→IO mappings are stored per-atlas in `component_atlases` jsonb
- A source dataset version may belong to multiple integrated objects (within same atlas)
- An IO version may be shared across multiple atlas versions (with different SD mappings)
- Atlas arrays/jsonb store `version_id`s (not entity `id`s)

### Atlas Version Grouping

Atlas versions are grouped by **(short_name, network, generation)**. For example:

- `brain-v1.0` and `brain-v1.1` are versions within generation 1 of the Brain atlas
- `brain-v2.0` is a new generation (major iteration)

This grouping is used for:

1. **Draft constraint:** Only one draft per (short_name, network, generation)
2. **SD/IO matching:** When uploading, find existing entities across all versions of the same atlas

### Atlas Draft Constraint

**Only one draft version per atlas at a time.** Creating a new draft from a published atlas is only allowed if no other draft exists for that atlas (same short_name, network, generation). This prevents conflicts and simplifies the versioning model.

### SD/IO Scope: Per-Atlas, Not Shared

**SDs and IOs belong to exactly one atlas.** They cannot be shared across different atlases.

- If you need the same dataset in two atlases (e.g., Brain and Lung), you upload separate copies
- Each copy is an independent SD with its own `id`, revision numbers, and version history
- Same applies to IOs

**Rationale:** This simplifies versioning since each atlas has full ownership of its SDs/IOs. Cross-atlas sharing would create complex dependency chains.

### File Upload Matching Logic

When a file is uploaded, the system determines whether it's a **new entity** or a **new version of existing entity**.

**Matching criteria:** (network, filename, atlas entity)

- **Network:** First segment of S3 key (e.g., `brain_network`)
- **Filename:** Last segment of S3 key (e.g., `my-dataset.h5ad`)
- **Atlas entity:** Same (short_name, network, generation)

**Example:**

```
Existing: brain_network/brain-v1/source-datasets/my-dataset.h5ad → SD1-r1
Upload:   brain_network/brain-v1-1/source-datasets/my-dataset.h5ad

Match: Same network (brain_network), same filename (my-dataset.h5ad),
       same atlas entity (brain, brain_network, generation 1)
Result: New version of SD1 → SD1-r2-wip-1
```

**Implementation Note:** The current code matches by full S3 key. This needs to be updated to match by (network, filename) within the same atlas entity. See Ticket 3.4.

### SD→IO Mapping Constraint

**An SD can only be linked to an IO if the SD is already in the atlas's `source_datasets` list.**

- Enforced at API level (required)
- Enforced at DB level via trigger or check constraint (if feasible)

For draft atlases, when linking an SD to an IO:

1. Check if SD version is in atlas's `source_datasets`
2. If not, reject the operation (user must add SD to atlas first)

## Events & Actions

### File Upload Events

| Event                                 | Precondition                 | Behavior                                           |
| ------------------------------------- | ---------------------------- | -------------------------------------------------- |
| **New SD file (first ever)**          | Atlas is draft               | Create SD with `revision_number=1`, `wip_number=1` |
| **New SD file (existing, draft)**     | Atlas is draft, SD draft     | Same `revision_number`, `wip_number+1`             |
| **New SD file (existing, published)** | Atlas is draft, SD published | `revision_number+1`, `wip_number=1`                |
| **New SD file to published atlas**    | Atlas is published           | **Rejected** - must create draft atlas first       |
| **New IO file**                       | Same as SD                   | Same patterns as SD                                |

### Atlas Actions

| Action                       | Current                   | Target                                                                                              |
| ---------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------- |
| **Create atlas**             | Sets `status=IN_PROGRESS` | Also set `generation=1`, `revision=0`, `draft=true`                                                 |
| **Create new atlas version** | Not implemented           | Reject if draft already exists; copy atlas, set `draft=true`; option to bump generation or revision |
| **Publish atlas**            | Not implemented           | Set `published_at` on all linked SD/IO versions, set `draft=false`; one-way operation               |

### Source Study Actions

| Action                      | Behavior                                               |
| --------------------------- | ------------------------------------------------------ |
| **Add to draft atlas**      | Adds to `source_studies` JSONB (existing)              |
| **Remove from draft atlas** | Requires no linked source datasets (existing behavior) |

### Linking Actions (SD→IO)

| Action                | Atlas State | Behavior                                                       |
| --------------------- | ----------- | -------------------------------------------------------------- |
| **Link SD to IO**     | Draft       | Add SD version_id to IO's entry in `component_atlases` jsonb   |
| **Link SD to IO**     | Published   | Allowed (SD must already be in atlas's `source_datasets` list) |
| **Unlink SD from IO** | Draft       | Remove SD version_id from IO's entry                           |
| **Unlink SD from IO** | Published   | Allowed (just removes mapping, SD stays in atlas)              |

## API Endpoints

### New Endpoints Needed

| Endpoint                                               | Description                               |
| ------------------------------------------------------ | ----------------------------------------- |
| `GET /atlases/{id}/source-datasets/{sdId}/versions`    | List all versions of a source dataset     |
| `GET /atlases/{id}/integrated-objects/{ioId}/versions` | List all versions of an integrated object |
| `POST /atlases/{id}/publish`                           | Publish the atlas                         |
| `POST /atlases/{id}/versions`                          | Create new draft version from current     |

### Modified Endpoints

| Endpoint                               | Changes                                                     |
| -------------------------------------- | ----------------------------------------------------------- |
| `GET /atlases`                         | Include `generation`, `revision`, `draft` in response       |
| `GET /atlases/{id}/source-datasets`    | Include `revision_number`, `wip_number`, `published_at`     |
| `GET /atlases/{id}/integrated-objects` | Include `revision_number`, `wip_number`, `published_at`     |
| `GET /atlases/{id}/integrated-objects` | Include `source_datasets` from atlas mappings (not from IO) |
| Download endpoints                     | Generate versioned filenames                                |

## Data Migration

For existing data:

- `source_datasets`: Set `revision_number=1`, `published_at=NULL`
- `component_atlases`: Set `revision_number=1`, `published_at=NULL`; remove `source_datasets[]` column after migrating to atlas
- `atlases`: Parse `overview.version` → `generation`/`revision`, set `draft=true`; migrate `component_atlases` from `uuid[]` to `jsonb` with embedded SD mappings

---

## Implementation Tickets

Organized as vertical slices for incremental end-to-end delivery.

### Already Implemented

The following is already in place:

- `wip_number`, `is_latest`, `version_id`, `id` columns on `source_datasets` and `component_atlases`
- Version creation logic (`createNewSourceDatasetVersion`, `createNewComponentAtlasVersion`)
- S3 notification flow creates new versions when files are uploaded
- `wip_number` increments on each new file upload

---

### Slice 1: Atlas Generation/Revision Display

**Goal:** Show atlas version as `v{generation}.{revision}` instead of free-text `overview.version`.

#### Ticket 1.1: [Backend] Add generation/revision columns to atlases and display in API

**Schema:**

```sql
ALTER TABLE hat.atlases ADD COLUMN generation integer NOT NULL DEFAULT 1;
ALTER TABLE hat.atlases ADD COLUMN revision integer NOT NULL DEFAULT 0;
```

**Migration:** Parse `overview.version` (e.g., "1.0" → generation=1, revision=0)

**Code:** Include `generation`, `revision` in atlas list/detail API responses.

**Acceptance Criteria:**

- [ ] Migration parses existing versions correctly
- [ ] API responses include generation/revision
- [ ] Existing tests pass

---

#### Ticket 1.2: [Frontend] Display atlas version as v{generation}.{revision}

**Changes:** Update atlas list/detail views to show formatted version.

**Acceptance Criteria:**

- [ ] Atlas displays as "v1.0" format
- [ ] Replaces or supplements existing version display

---

### Slice 2: SD/IO Revision Numbers

**Goal:** Track published revision numbers (`r1`, `r2`) separately from WIP numbers.

#### Ticket 2.1: [Backend] Add revision_number to source_datasets with API display

**Schema:**

```sql
ALTER TABLE hat.source_datasets ADD COLUMN revision_number integer NOT NULL DEFAULT 1;
```

**Migration:** All existing rows get `revision_number=1`

**Code:**

- Update `createNewSourceDatasetVersion()`: copy `revision_number` from previous version
- Include `revision_number` in SD list/detail API responses

**Acceptance Criteria:**

- [ ] New SD versions inherit revision_number
- [ ] API responses include revision_number
- [ ] Existing tests pass

---

#### Ticket 2.2: [Backend] Add revision_number to component_atlases with API display

**Schema:**

```sql
ALTER TABLE hat.component_atlases ADD COLUMN revision_number integer NOT NULL DEFAULT 1;
```

**Migration:** All existing rows get `revision_number=1`

**Code:**

- Update `createNewComponentAtlasVersion()`: copy `revision_number` from previous version
- Include `revision_number` in IO list/detail API responses

**Acceptance Criteria:**

- [ ] New IO versions inherit revision_number
- [ ] API responses include revision_number
- [ ] Existing tests pass

---

#### Ticket 2.3: [Frontend] Display SD/IO version as r{revision}-wip-{wip}

**Changes:** Update SD/IO list/detail views to show version info.

**Acceptance Criteria:**

- [ ] SD/IO displays version like "r1-wip-3"
- [ ] Shows revision_number and wip_number

---

### Slice 3: Publishing Workflow

**Goal:** Publish an atlas, marking all linked SD/IO versions as published and freezing the atlas.

#### Ticket 3.1: [Backend] Add published_at to SD/IO and draft to atlas

**Schema:**

```sql
ALTER TABLE hat.source_datasets ADD COLUMN published_at timestamp;
ALTER TABLE hat.component_atlases ADD COLUMN published_at timestamp;
ALTER TABLE hat.atlases ADD COLUMN draft boolean NOT NULL DEFAULT true;
```

**Migration:** All existing rows get `published_at=NULL`, `draft=true`

**Code:** Include `published_at` in SD/IO responses, `draft` in atlas responses.

**Acceptance Criteria:**

- [ ] New columns added
- [ ] API responses include new fields
- [ ] Existing tests pass

---

#### Ticket 3.2: [Backend] Implement publish atlas endpoint

**Endpoint:** `POST /atlases/{atlasId}/publish`

**Logic:**

1. Verify atlas exists and `draft=true`
2. Set `published_at = NOW()` on all linked SD and IO versions **where published_at IS NULL**
3. Set `atlas.draft = false`
4. Return updated atlas

**Notes:**

- One-way operation (no unpublish)
- No validation requirements
- Only sets `published_at` on versions not already published (preserves original publish date for shared versions)

**Acceptance Criteria:**

- [ ] All linked SD/IO versions have `published_at` set (new or existing)
- [ ] Already-published versions keep their original `published_at` timestamp
- [ ] Atlas `draft` is false
- [ ] Returns 409 if already published
- [ ] Proper authorization

---

#### Ticket 3.3: [Backend] Increment revision_number on new version after publish

**Code:**

- Update `createNewSourceDatasetVersion()`:
  - If previous has `published_at`: set `revision_number + 1`, `wip_number = 1`
  - If not published: same `revision_number`, `wip_number + 1`
- Same for `createNewComponentAtlasVersion()`

**Acceptance Criteria:**

- [ ] New version after unpublished: same revision, wip+1
- [ ] New version after published: revision+1, wip=1
- [ ] Unit tests for both scenarios

**Dependencies:** Tickets 2.1, 2.2, 3.1

---

#### Ticket 3.4: [Backend] Enforce published atlas immutability

**Logic:**

- On S3 notification for new file version: check if atlas is `draft=false`
- If published, reject with error (user must create new atlas version first)

**Critical Implementation Note - Scope Updates to Target Atlas:**

The current implementation has a bug where version updates affect ALL atlases:

```typescript
// Current (WRONG for versioning):
"UPDATE hat.atlases SET source_datasets = ARRAY_REPLACE(source_datasets, $1, $2)";
// This updates ALL atlases that contain the old version!
```

This must be fixed to scope updates to the specific target atlas:

```typescript
// Correct:
"UPDATE hat.atlases SET source_datasets = ARRAY_REPLACE(source_datasets, $1, $2) WHERE id = $3";
```

**Functions requiring this fix:**

- `updateSourceDatasetVersionInAtlases()` in `app/data/atlases.ts`
- `updateComponentAtlasVersionInAtlases()` in `app/data/atlases.ts`
- `updateSourceDatasetVersionInComponentAtlases()` in `app/data/component-atlases.ts`

**Critical Implementation Note - Matching Logic:**

The current `getExistingMetadataObjectId()` matches by full S3 key. This must be changed to match by (network, filename) within the same atlas entity (short_name, network, generation).

```typescript
// Current (WRONG for cross-version matching):
SELECT ... FROM hat.files WHERE bucket = $1 AND key = $2

// Correct: Match by network + filename within atlas entity
// (requires joining to find SDs/IOs belonging to any version of the same atlas)
```

**Acceptance Criteria:**

- [ ] New file upload for SD/IO on published atlas returns error
- [ ] Error message instructs user to create new atlas version
- [ ] Draft atlases still accept uploads normally
- [ ] Version updates only affect the target atlas, not other atlases sharing the same SD/IO version
- [ ] File matching works across atlas versions (same filename in brain-v1-1 matches existing SD from brain-v1)

**Dependencies:** Ticket 3.1

---

#### Ticket 3.5: [Frontend] Display draft/published status and add publish action

**Changes:**

- Show draft/published badge on atlas
- Show published date on SD/IO when published
- Add "Publish Atlas" button for draft atlases

**Acceptance Criteria:**

- [ ] Draft atlases show "Draft" indicator
- [ ] Published atlases show published status
- [ ] Publish button calls API and updates UI

---

### Slice 4: Create New Atlas Version

**Goal:** Allow creating a new draft atlas version from a published atlas.

#### Ticket 4.1: [Backend] Implement create atlas version endpoint

**Endpoint:** `POST /atlases/{atlasId}/versions`

**Request Body:**

```json
{ "bumpGeneration": false }
```

**Logic:**

1. **Check no draft exists** - reject with 409 Conflict if a draft version already exists for this atlas
2. Create new atlas row copying from source
3. If `bumpGeneration`: `generation + 1`, `revision = 0`
4. Else: same `generation`, `revision + 1`
5. Set `draft = true`
6. Copy `source_datasets[]`, `component_atlases` jsonb, and relevant overview fields

**Acceptance Criteria:**

- [ ] Rejects if draft already exists (409 Conflict)
- [ ] New atlas with correct generation/revision
- [ ] SD list and IO mappings copied
- [ ] New atlas is draft
- [ ] Proper authorization

**Dependencies:** Tickets 1.1, 3.1

---

#### Ticket 4.2: [Frontend] Add "Create New Version" action

**Changes:**

- Add "Create New Version" button on published atlas
- Modal/form to choose bump revision vs bump generation
- Navigate to new draft atlas after creation

**Acceptance Criteria:**

- [ ] Button visible on published atlases
- [ ] Can choose revision or generation bump
- [ ] New atlas opens after creation

---

### Slice 5: Migrate SD→IO Mappings to Atlas

**Goal:** Move SD→IO relationship from IO entity to Atlas, enabling independent mappings per atlas version.

#### Ticket 5.1: [Backend] Migrate component_atlases from uuid[] to jsonb

**Schema:**

```sql
-- Migrate component_atlases from uuid[] to jsonb with embedded SD mappings
ALTER TABLE hat.atlases ADD COLUMN component_atlases_new jsonb NOT NULL DEFAULT '[]';

-- Migration populates new column from old array + IO source_datasets
UPDATE hat.atlases SET component_atlases_new = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'io_version_id', ca_version,
      'source_datasets', COALESCE(
        (SELECT source_datasets FROM hat.component_atlases WHERE version_id = ca_version),
        '{}'::uuid[]
      )
    )
  )
  FROM unnest(component_atlases) AS ca_version
);

-- Swap columns
ALTER TABLE hat.atlases DROP COLUMN component_atlases;
ALTER TABLE hat.atlases RENAME COLUMN component_atlases_new TO component_atlases;
```

**Structure:**

```json
[
  { "io_version_id": "uuid", "source_datasets": ["sd-version-uuid", ...] },
  ...
]
```

**Code:**

- Update IO list API to read SD associations from atlas `component_atlases` jsonb instead of IO table
- Update SD→IO link/unlink operations to modify atlas `component_atlases` jsonb
- Update all code that reads/writes `component_atlases` to handle new jsonb structure

**Acceptance Criteria:**

- [ ] Migration populates mappings correctly from existing data
- [ ] IO API returns SDs from atlas mappings
- [ ] Link/unlink operations work on mappings
- [ ] All existing atlas operations continue to work

---

#### Ticket 5.2: [Backend] Remove source_datasets column from component_atlases

**Schema:**

```sql
ALTER TABLE hat.component_atlases DROP COLUMN source_datasets;
```

**Code:**

- Remove all code that reads/writes `component_atlases.source_datasets`
- Ensure all SD→IO operations use atlas mappings

**Acceptance Criteria:**

- [ ] Column removed
- [ ] No code references old column
- [ ] All tests pass

**Dependencies:** Ticket 5.1 (must be fully deployed and verified first)

---

#### Ticket 5.3: [Frontend] Update IO detail to show SDs from atlas mappings

**Changes:**

- IO detail page reads SD associations from atlas context, not IO entity
- Ensure proper display when same IO version appears in multiple atlas versions with different SDs

**Acceptance Criteria:**

- [ ] IO shows correct SDs for the atlas being viewed
- [ ] Different atlas versions can show different SD mappings for same IO

---

### Slice 6: Version History

**Goal:** View all previous versions of a source dataset or integrated object.

#### Ticket 6.1: [Backend] Add SD version history endpoint

**Endpoint:** `GET /atlases/{atlasId}/source-datasets/{sdId}/versions`

**Response:** Array of all versions for the entity ID, ordered by recency, with:

- `version_id`, `revision_number`, `wip_number`, `published_at`, `created_at`
- File info (size, key, validation_status)

**Acceptance Criteria:**

- [ ] Returns all versions for the entity ID
- [ ] Ordered by recency

**Dependencies:** Ticket 2.1

---

#### Ticket 6.2: [Backend] Add IO version history endpoint

**Endpoint:** `GET /atlases/{atlasId}/integrated-objects/{ioId}/versions`

**Response:** Same pattern as SD version history.

**Dependencies:** Ticket 2.2

---

#### Ticket 6.3: [Frontend] Add version history view for SD/IO

**Changes:**

- Add "View History" link/button on SD/IO detail pages
- Display list of previous versions with version info
- Allow viewing/downloading previous versions

**Acceptance Criteria:**

- [ ] Can view all versions of an SD or IO
- [ ] Shows version metadata (revision, wip, dates)
- [ ] Can download previous versions

---

### Slice 7: Versioned Download Filenames

**Goal:** Downloads include version in filename for provenance tracking.

#### Ticket 7.1: [Backend] Generate versioned download filenames

**Logic:**

- If `published_at` is set: `{filename}-r{revision}.h5ad`
- If `published_at` is null (or column doesn't exist yet): `{filename}-r{revision}-wip-{wip}.h5ad`

**Acceptance Criteria:**

- [ ] Draft files get `rN-wip-M` suffix
- [ ] Published files get `rN` suffix (once publishing exists)
- [ ] Original S3 key unchanged, only download filename affected

**Dependencies:** Tickets 2.1, 2.2 (can deploy before Slice 3)

---

#### Ticket 7.2: [Frontend] Update download buttons to use versioned filenames

**Changes:**

- Download links/buttons use new versioned filename from API

**Acceptance Criteria:**

- [ ] Downloaded files have versioned names

---

## Ticket Summary

| Slice | Ticket | Type | Description                                         |
| ----- | ------ | ---- | --------------------------------------------------- |
| 1     | 1.1    | BE   | Atlas generation/revision columns + API             |
| 1     | 1.2    | FE   | Display atlas version                               |
| 2     | 2.1    | BE   | SD revision_number column + API                     |
| 2     | 2.2    | BE   | IO revision_number column + API                     |
| 2     | 2.3    | FE   | Display SD/IO version                               |
| 3     | 3.1    | BE   | published_at (SD/IO) + draft (atlas) columns + API  |
| 3     | 3.2    | BE   | Publish atlas endpoint                              |
| 3     | 3.3    | BE   | Increment revision_number after publish             |
| 3     | 3.4    | BE   | Enforce published atlas immutability                |
| 3     | 3.5    | FE   | Display draft/published + publish action            |
| 4     | 4.1    | BE   | Create new atlas version endpoint                   |
| 4     | 4.2    | FE   | Create new version action                           |
| 5     | 5.1    | BE   | Migrate component_atlases to jsonb with SD mappings |
| 5     | 5.2    | BE   | Remove source_datasets from component_atlases       |
| 5     | 5.3    | FE   | Update IO detail for atlas-scoped SD mappings       |
| 6     | 6.1    | BE   | SD version history endpoint                         |
| 6     | 6.2    | BE   | IO version history endpoint                         |
| 6     | 6.3    | FE   | Version history view                                |
| 7     | 7.1    | BE   | Versioned download filenames                        |
| 7     | 7.2    | FE   | Download with versioned names                       |

---

## Recommended Delivery Order

Each slice is deployable end-to-end:

1. **Slice 1** (1.1-1.2): Atlas shows `v1.0` format
2. **Slice 2** (2.1-2.3): SD/IO show revision numbers
3. **Slice 7** (7.1-7.2): Versioned downloads (WIP format: `file-r1-wip-3.h5ad`)
4. **Slice 3** (3.1-3.5): Publishing workflow complete (downloads now show `file-r1.h5ad` when published)
5. **Slice 4** (4.1-4.2): Can create new atlas versions
6. **Slice 5** (5.1-5.3): Migrate SD→IO mappings to atlas level
7. **Slice 6** (6.1-6.3): Version history viewable

**Note on Slice 5:** This is a significant architectural change that provides isolation between atlas versions. It can be done earlier if the isolation is needed sooner, but placing it after basic publishing gives a working system first.

---

## Flow Examples

### Flow 1: Initial Creation and First Publish

| Step | Action               | Result                                                      |
| ---- | -------------------- | ----------------------------------------------------------- |
| 1    | Create Atlas "Brain" | Atlas v1.0 (draft)                                          |
| 2    | Upload IO file       | IO1-r1-wip-1 created; atlas mappings = [{io: IO1, sds: []}] |
| 3    | Upload SD file       | SD1-r1-wip-1 created; atlas source_datasets = [SD1]         |
| 4    | Link SD1 to IO1      | atlas mappings = [{io: IO1, sds: [SD1]}]                    |
| 5    | Upload new IO file   | IO1-r1-wip-2 created (wip bump); atlas uses latest          |
| 6    | Publish Atlas v1.0   | Atlas published; IO1-r1, SD1-r1 published (wip hidden)      |

### Flow 2: Update IO After Publish

| Step | Action              | Result                                                    |
| ---- | ------------------- | --------------------------------------------------------- |
| 1    | Starting state      | Atlas v1.0 (published) → [{io: IO1-r1, sds: [SD1-r1]}]    |
| 2    | Create draft v1.1   | Atlas v1.1 (draft) copies v1.0's structure                |
| 3    | Upload new IO1 file | IO1-r2-wip-1 created; v1.1 mappings updated to use IO1-r2 |
| 4    | Publish Atlas v1.1  | Atlas v1.1 published; IO1-r2 published                    |

**Result:** v1.0 still points to IO1-r1; v1.1 points to IO1-r2

### Flow 3: Different SD Mappings Per Atlas Version

| Step | Action                      | Result                                                         |
| ---- | --------------------------- | -------------------------------------------------------------- |
| 1    | Starting state              | Atlas v1.0 (published) → [{io: IO1-r1, sds: [SD1-r1, SD2-r1]}] |
| 2    | Create draft v1.1           | v1.1 copies mappings from v1.0                                 |
| 3    | Remove SD2 from IO1 on v1.1 | v1.1 mappings = [{io: IO1-r1, sds: [SD1-r1]}]                  |
|      |                             | v1.0 unchanged: [{io: IO1-r1, sds: [SD1-r1, SD2-r1]}]          |
| 4    | Remove SD1 from IO1 on v1.0 | v1.0 mappings = [{io: IO1-r1, sds: [SD2-r1]}] (allowed)        |
|      |                             | v1.1 unchanged: [{io: IO1-r1, sds: [SD1-r1]}] (isolated)       |

**Result:** Same IO version (IO1-r1), completely different SD mappings per atlas version. Editing v1.0 does not affect v1.1 and vice versa.
