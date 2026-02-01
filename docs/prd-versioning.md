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
| **Concept**           | A logical entity (SD or IO) identified by DOI + title, independent of filename                            |
| **Native SD/IO**      | An SD/IO created by upload to this atlas (originating atlas)                                              |
| **Imported SD/IO**    | An SD/IO linked from another atlas via explicit import action                                             |
| **Generation**        | Major atlas iteration (1, 2, 3...) - manually bumped when creating new version (e.g., adding new studies) |
| **Revision**          | Numbered update within a generation, representing a file version change (0, 1, 2...)                      |
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

| Entity              | Needed Columns/Changes                                |
| ------------------- | ----------------------------------------------------- |
| `concepts`          | New table: `id`, `doi`, `title`, `file_type`, `alias` |
| `files`             | `concept_id` → concepts                               |
| `source_datasets`   | `revision_number`, `published_at`                     |
| `component_atlases` | `revision_number`, `published_at`                     |
| `atlases`           | `generation`, `revision`, `draft`                     |

## Design Principles

### Partial Ledger Pattern

**Files Table:**

- New row only when AWS file is new
- File key and AWS version are immutable
- Metadata fields (validation_status, integrity_status, concept_id, etc.) are mutable

**Source Datasets / Integrated Objects:**

- New row ONLY when new file version uploaded
- **Only `file_id` is immutable** - everything else can change even after publishing
- Metadata fields (capUrl, etc.) are mutable
- Version/revision represents the FILE version, not metadata state

**Atlases:**

- Published atlas:
  - **Frozen:** SD/IO sets, file versions
  - **Mutable:** SD→IO mappings (limited to SDs already in atlas), source studies, other metadata
- Draft atlas: all changes allowed
- **New atlas version required** to add/remove SDs/IOs or upload new files

### Concept Model

Concepts provide lineage tracking independent of filename.

**Schema:**

```sql
CREATE TABLE hat.concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doi TEXT,
  title TEXT NOT NULL,
  file_type TEXT NOT NULL,  -- 'source_dataset' or 'integrated_object'
  alias UUID REFERENCES hat.concepts(id)  -- points to canonical after merge
);
CREATE UNIQUE INDEX idx_concepts_unique ON hat.concepts(doi, title, file_type) WHERE alias IS NULL;

ALTER TABLE hat.files ADD COLUMN concept_id UUID REFERENCES hat.concepts(id);
```

**Behavior:**

- On file upload: extract DOI + title from H5AD → find or create concept by (DOI, title, file_type)
- Both SDs and IOs have concepts (via their file), but they're separate due to file_type
- Alias lookup is automatic (system follows chain to canonical)
- Concept merge: update `concept_id` on affected files, set `merged.alias = canonical`

### SD/IO Shared Library

SDs and IOs exist in a shared library and can be linked to multiple atlases.

| Term         | Definition                                           |
| ------------ | ---------------------------------------------------- |
| **Native**   | Created by upload to this atlas (originating atlas)  |
| **Imported** | Linked from another atlas via explicit import action |

**Rules:**

- First upload creates SD/IO linked to uploading atlas only
- Explicit import action links existing SD/IO to another atlas
- Only originating atlas uploaders can upload new versions
- Any atlas can import any SD/IO (no restrictions)

**Originating Atlas:** Derived from first appearance (the atlas that first contained this SD/IO). No explicit column needed—query by earliest `created_at` for files with same concept.

### SD→IO Relationship (Stays on IO)

SD→IO mappings remain on the IO entity (`component_atlases.source_datasets[]`).

**Propagation:** Mapping changes propagate to all atlases using that IO version.

**Display Filtering:** When viewing an IO on atlas X, only show SDs that are in X's `source_datasets[]`. This ensures published atlases with frozen SD sets display consistently even if the underlying IO has more mappings.

**Constraint:** Can only link an SD to an IO if the SD is in the atlas's `source_datasets[]`.

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

### File Upload Matching (Concept-Based)

When a file is uploaded, the system determines whether it's a **new entity** or a **new version of existing entity**.

**Flow:**

1. File uploaded to S3 (`{network}/{atlas}/source-datasets/{filename}`)
2. System extracts DOI + title from H5AD content
3. Look up concept by (DOI, title) → find existing or create new
4. If existing concept with files: create new version of that SD/IO
5. If new concept: create new SD/IO

**S3 path** determines which atlas receives the upload; **concept** determines lineage.

### Version Update Behavior

| Scenario                                  | Behavior                              |
| ----------------------------------------- | ------------------------------------- |
| New version uploaded to originating atlas | All drafts of that atlas: auto-update |
| Other atlases with imported SD/IO         | Opt-in to new version (draft only)    |
| Published atlases                         | Frozen; must create draft first       |

**Auto-update (same atlas, all generations):**

When a new file is uploaded for an existing SD/IO, **all draft atlases** of the same (short_name, network) automatically get the new version—including drafts of different generations. For example, uploading to brain-v1.1-draft also updates brain-v2.0-draft.

**Important:** Auto-update only **replaces** existing SD/IO versions in each draft. If a draft doesn't contain that SD/IO, nothing is added. Auto-update is mandatory—no opt-out.

**Opt-in (different atlas):**

Atlases that imported an SD/IO from another atlas see a "newer version available" indicator. Users explicitly adopt the new version.

### Atlas Version Grouping

Atlas versions are grouped by **(short_name, network, generation)**:

- `brain-v1.0` and `brain-v1.1` are versions within generation 1
- `brain-v2.0` is a new generation

**Draft constraint:** Only one draft per (short_name, network, generation). Different generations CAN have concurrent drafts (e.g., `brain-v1.2-draft` and `brain-v2.0-draft`).

## Events & Actions

### File Upload Events

| Event                                 | Precondition                 | Behavior                                                       |
| ------------------------------------- | ---------------------------- | -------------------------------------------------------------- |
| **New SD file (first ever)**          | Atlas is draft               | Create concept, SD with `revision_number=1`, `wip_number=1`    |
| **New SD file (existing, draft)**     | Atlas is draft, SD draft     | Same `revision_number`, `wip_number+1`; auto-update same atlas |
| **New SD file (existing, published)** | Atlas is draft, SD published | `revision_number+1`, `wip_number=1`; auto-update same atlas    |
| **New SD file to published atlas**    | Atlas is published           | **Rejected** - must create draft atlas first                   |
| **New IO file**                       | Same as SD                   | Same patterns as SD                                            |

### Atlas Actions

| Action                       | Behavior                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| **Create atlas**             | Set `generation=1`, `revision=0`, `draft=true`                                                      |
| **Create new atlas version** | Reject if draft already exists; copy atlas, set `draft=true`; option to bump generation or revision |
| **Publish atlas**            | Set `published_at` on linked SD/IO versions (where NULL), set `draft=false`; one-way                |

### Import Actions

| Action                | Atlas State | Behavior                                                                 |
| --------------------- | ----------- | ------------------------------------------------------------------------ |
| **Import SD**         | Draft       | Add SD version_id to `source_datasets`; mark as imported                 |
| **Import SD**         | Published   | **Rejected** - must create draft first                                   |
| **Import IO**         | Draft       | Add IO version_id to `component_atlases`; mark as imported               |
| **Import IO**         | Published   | **Rejected** - must create draft first                                   |
| **Adopt new version** | Draft       | Replace old version_id with new in `source_datasets`/`component_atlases` |
| **Adopt new version** | Published   | **Rejected** - must create draft first                                   |

### Linking Actions (SD→IO)

| Action                | Behavior                                                                    |
| --------------------- | --------------------------------------------------------------------------- |
| **Link SD to IO**     | Add SD to IO's `source_datasets[]`; propagates to all atlases using that IO |
| **Unlink SD from IO** | Remove SD from IO's `source_datasets[]`; propagates to all atlases          |

**Constraints:**

- Can only link SD if it's in the viewing atlas's `source_datasets[]`
- Can only manage links on **native IOs** (not imported IOs)

**Propagation:** Both draft and published atlases can update links; changes propagate globally to all atlases using that IO version.

**Display:** Each atlas filters IO's SDs to only show those in its own `source_datasets[]`.

## API Endpoints

### New Endpoints

| Endpoint                                               | Description                               |
| ------------------------------------------------------ | ----------------------------------------- |
| `POST /atlases/{id}/publish`                           | Publish the atlas                         |
| `POST /atlases/{id}/versions`                          | Create new draft version from current     |
| `POST /atlases/{id}/source-datasets/import`            | Import SD from another atlas              |
| `POST /atlases/{id}/integrated-objects/import`         | Import IO from another atlas              |
| `POST /atlases/{id}/source-datasets/{sdId}/adopt`      | Adopt newer version of imported SD        |
| `POST /atlases/{id}/integrated-objects/{ioId}/adopt`   | Adopt newer version of imported IO        |
| `GET /atlases/{id}/source-datasets/{sdId}/versions`    | List all versions of a source dataset     |
| `GET /atlases/{id}/integrated-objects/{ioId}/versions` | List all versions of an integrated object |
| `GET /source-datasets`                                 | Browse SD library (for import)            |
| `GET /integrated-objects`                              | Browse IO library (for import)            |
| `POST /concepts/merge`                                 | Merge two concepts                        |

### Modified Endpoints

| Endpoint                               | Changes                                                                                      |
| -------------------------------------- | -------------------------------------------------------------------------------------------- |
| `GET /atlases`                         | Include `generation`, `revision`, `draft`                                                    |
| `GET /atlases/{id}/source-datasets`    | Include `revision_number`, `wip_number`, `published_at`, `imported`, `newerVersionAvailable` |
| `GET /atlases/{id}/integrated-objects` | Include `revision_number`, `wip_number`, `published_at`, `imported`, `newerVersionAvailable` |
| `GET /atlases/{id}/integrated-objects` | Filter `source_datasets` to those in atlas's SD list                                         |
| Download endpoints                     | Generate versioned filenames                                                                 |

## Data Migration

For existing data:

- `concepts`: Create concepts from existing files' DOI + title combinations
- `files`: Populate `concept_id` based on DOI + title lookup
- `source_datasets`: Set `revision_number=1`, `published_at=NULL`
- `component_atlases`: Set `revision_number=1`, `published_at=NULL`
- `atlases`: Parse `overview.version` → `generation`/`revision`, set `draft=true`

---

## Implementation Tickets

Organized as vertical slices for incremental end-to-end delivery.

### Already Implemented

- `wip_number`, `is_latest`, `version_id`, `id` columns on `source_datasets` and `component_atlases`
- Version creation logic (`createNewSourceDatasetVersion`, `createNewComponentAtlasVersion`)
- S3 notification flow creates new versions when files are uploaded
- `wip_number` increments on each new file upload

---

### Slice 1: Concept Model

**Goal:** Track SD/IO lineage independent of filename using DOI + title.

#### Ticket 1.1: [Backend] Create concepts table and file.concept_id

**Schema:**

```sql
CREATE TABLE hat.concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doi TEXT,
  title TEXT NOT NULL,
  file_type TEXT NOT NULL,  -- 'source_dataset' or 'integrated_object'
  alias UUID REFERENCES hat.concepts(id),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_concepts_unique ON hat.concepts(doi, title, file_type) WHERE alias IS NULL;

ALTER TABLE hat.files ADD COLUMN concept_id UUID REFERENCES hat.concepts(id);
```

**Migration:** Create concepts from existing files' DOI + title + file_type; populate `concept_id`.

**Acceptance Criteria:**

- [ ] Concepts table created with proper indexes
- [ ] Existing files have concept_id populated
- [ ] Alias lookup follows chain to canonical
- [ ] Uniqueness enforced on (doi, title, file_type) for non-aliased concepts

---

#### Ticket 1.2: [Backend] Extract DOI + title on file upload

**Code:**

- On S3 notification, extract DOI and title from H5AD file metadata
- Determine file_type from S3 path (source-datasets/ or integrated-objects/)
- Find or create concept by (DOI, title, file_type)
- Set `file.concept_id`

**Acceptance Criteria:**

- [ ] New uploads get concept_id assigned
- [ ] Same DOI + title + file_type reuses existing concept
- [ ] Different DOI, title, or file_type creates new concept

---

#### Ticket 1.3: [Backend] Concept merge API

**Endpoint:** `POST /concepts/merge`

**Request:** `{ "sourceConceptId": "uuid", "targetConceptId": "uuid" }`

**Logic:**

1. Update all files with `concept_id = source` to `concept_id = target`
2. Set `source.alias = target`

**Acceptance Criteria:**

- [ ] Files updated to target concept
- [ ] Source concept has alias set
- [ ] Lookups for source concept return target

---

#### Ticket 1.4: [Frontend] Concept merge UI

**Changes:**

- Admin UI to search and select concepts to merge
- Confirmation dialog showing affected files

---

### Slice 2: Atlas Generation/Revision Display

**Goal:** Show atlas version as `v{generation}.{revision}`.

#### Ticket 2.1: [Backend] Add generation/revision columns to atlases

**Schema:**

```sql
ALTER TABLE hat.atlases ADD COLUMN generation integer NOT NULL DEFAULT 1;
ALTER TABLE hat.atlases ADD COLUMN revision integer NOT NULL DEFAULT 0;
```

**Migration:** Parse `overview.version` (e.g., "1.0" → generation=1, revision=0)

**Acceptance Criteria:**

- [ ] Migration parses existing versions correctly
- [ ] API responses include generation/revision

---

#### Ticket 2.2: [Frontend] Display atlas version as v{generation}.{revision}

---

### Slice 3: SD/IO Revision Numbers

**Goal:** Track published revision numbers (`r1`, `r2`) separately from WIP numbers.

#### Ticket 3.1: [Backend] Add revision_number to source_datasets and component_atlases

**Schema:**

```sql
ALTER TABLE hat.source_datasets ADD COLUMN revision_number integer NOT NULL DEFAULT 1;
ALTER TABLE hat.component_atlases ADD COLUMN revision_number integer NOT NULL DEFAULT 1;
```

**Code:** Update version creation functions to copy `revision_number` from previous version.

---

#### Ticket 3.2: [Frontend] Display SD/IO version as r{revision}-wip-{wip}

---

### Slice 4: Publishing Workflow

**Goal:** Publish an atlas, marking linked SD/IO versions as published.

#### Ticket 4.1: [Backend] Add published_at to SD/IO and draft to atlas

**Schema:**

```sql
ALTER TABLE hat.source_datasets ADD COLUMN published_at timestamp;
ALTER TABLE hat.component_atlases ADD COLUMN published_at timestamp;
ALTER TABLE hat.atlases ADD COLUMN draft boolean NOT NULL DEFAULT true;
```

---

#### Ticket 4.2: [Backend] Implement publish atlas endpoint

**Endpoint:** `POST /atlases/{atlasId}/publish`

**Logic:**

1. Verify `draft=true`
2. Set `published_at = NOW()` on linked SD/IO versions **where NULL**
3. Set `atlas.draft = false`

---

#### Ticket 4.3: [Backend] Increment revision_number after publish

**Code:** If previous version has `published_at`, set `revision_number + 1`, `wip_number = 1`.

---

#### Ticket 4.4: [Backend] Enforce published atlas immutability and scope updates

**Logic:**

- Reject file uploads to published atlases
- Auto-update all draft atlases of the same (short_name, network) on new version
  - Note: Updates ALL drafts regardless of generation (e.g., uploading to brain-v1.1-draft also updates brain-v2.0-draft)
- Match files by concept_id (not filename)

**Fix:** Current code uses unscoped `ARRAY_REPLACE` that updates ALL atlases. Must be changed to update only drafts of the same (short_name, network).

---

#### Ticket 4.5: [Frontend] Display draft/published status and publish action

---

### Slice 5: Create New Atlas Version

**Goal:** Create new draft from published atlas.

#### Ticket 5.1: [Backend] Implement create atlas version endpoint

**Endpoint:** `POST /atlases/{atlasId}/versions`

**Logic:**

1. Calculate: `generation = max + 1` (if bump) or `revision = max + 1`
2. Reject if draft exists for target (short_name, network, generation)
3. Copy atlas with `draft = true`

---

#### Ticket 5.2: [Frontend] Add "Create New Version" action

---

### Slice 6: Import & Opt-in

**Goal:** Allow importing SDs/IOs from other atlases and opting in to new versions.

#### Ticket 6.1: [Backend] SD/IO library browse endpoints

**Endpoints:**

- `GET /source-datasets` - list all SDs (for import browsing)
- `GET /integrated-objects` - list all IOs (for import browsing)

Include: concept info, originating atlas, latest version, current atlas usage.

---

#### Ticket 6.2: [Backend] Import SD/IO endpoints

**Endpoints:**

- `POST /atlases/{id}/source-datasets/import` - body: `{ "sourceDatasetId": "uuid" }`
- `POST /atlases/{id}/integrated-objects/import` - body: `{ "integratedObjectId": "uuid" }`

**Logic:**

1. Verify atlas is draft
2. Add latest version_id to atlas's `source_datasets[]` or `component_atlases[]`
3. Track as imported (could be a flag or derived from originating atlas ≠ current)

---

#### Ticket 6.3: [Backend] Adopt new version endpoints

**Endpoints:**

- `POST /atlases/{id}/source-datasets/{sdId}/adopt`
- `POST /atlases/{id}/integrated-objects/{ioId}/adopt`

**Logic:**

1. Verify atlas is draft
2. Find latest version of the SD/IO
3. Replace old version_id with new in atlas's arrays

---

#### Ticket 6.4: [Backend] Add imported and newerVersionAvailable to API responses

**Logic:**

- `imported`: true if originating atlas ≠ current atlas
- `newerVersionAvailable`: true if latest version_id > current version_id for this concept

---

#### Ticket 6.5: [Frontend] Import SD/IO UI

**Changes:**

- Browse/search SD/IO library
- Import action adds to current atlas

---

#### Ticket 6.6: [Frontend] Display imported indicator and adopt action

**Changes:**

- Badge showing "Imported" on SD/IO
- "Newer version available" indicator
- "Adopt" button to update to latest

---

### Slice 7: Version History

**Goal:** View all previous versions of an SD/IO.

#### Ticket 7.1: [Backend] Version history endpoints

**Endpoints:**

- `GET /atlases/{id}/source-datasets/{sdId}/versions`
- `GET /atlases/{id}/integrated-objects/{ioId}/versions`

---

#### Ticket 7.2: [Frontend] Version history view

---

### Slice 8: Versioned Download Filenames

**Goal:** Downloads include version in filename.

#### Ticket 8.1: [Backend] Generate versioned download filenames

**Logic:** `{title}-r{revision}.h5ad` or `{title}-r{revision}-wip-{wip}.h5ad`

---

#### Ticket 8.2: [Frontend] Update download buttons

---

## Ticket Summary

| Slice | Ticket | Type | Description                             |
| ----- | ------ | ---- | --------------------------------------- |
| 1     | 1.1    | BE   | Concepts table + file.concept_id        |
| 1     | 1.2    | BE   | Extract DOI + title on upload           |
| 1     | 1.3    | BE   | Concept merge API                       |
| 1     | 1.4    | FE   | Concept merge UI                        |
| 2     | 2.1    | BE   | Atlas generation/revision columns       |
| 2     | 2.2    | FE   | Display atlas version                   |
| 3     | 3.1    | BE   | SD/IO revision_number columns           |
| 3     | 3.2    | FE   | Display SD/IO version                   |
| 4     | 4.1    | BE   | published_at + draft columns            |
| 4     | 4.2    | BE   | Publish atlas endpoint                  |
| 4     | 4.3    | BE   | Increment revision after publish        |
| 4     | 4.4    | BE   | Enforce immutability + scope updates    |
| 4     | 4.5    | FE   | Draft/published UI + publish action     |
| 5     | 5.1    | BE   | Create atlas version endpoint           |
| 5     | 5.2    | FE   | Create new version action               |
| 6     | 6.1    | BE   | SD/IO library browse endpoints          |
| 6     | 6.2    | BE   | Import SD/IO endpoints                  |
| 6     | 6.3    | BE   | Adopt new version endpoints             |
| 6     | 6.4    | BE   | imported + newerVersionAvailable fields |
| 6     | 6.5    | FE   | Import SD/IO UI                         |
| 6     | 6.6    | FE   | Imported indicator + adopt action       |
| 7     | 7.1    | BE   | Version history endpoints               |
| 7     | 7.2    | FE   | Version history view                    |
| 8     | 8.1    | BE   | Versioned download filenames            |
| 8     | 8.2    | FE   | Download with versioned names           |

---

## Recommended Delivery Order

1. **Slice 1** (1.1-1.4): Concept model foundation
2. **Slice 2** (2.1-2.2): Atlas shows `v1.0` format
3. **Slice 3** (3.1-3.2): SD/IO show revision numbers
4. **Slice 8** (8.1-8.2): Versioned downloads
5. **Slice 4** (4.1-4.5): Publishing workflow
6. **Slice 5** (5.1-5.2): Create new atlas versions
7. **Slice 6** (6.1-6.6): Import and opt-in (SD import first, IO import last)
8. **Slice 7** (7.1-7.2): Version history

**Note on IO Import:** Import IO should be implemented after SD import is working, as importing an IO without its mapped SDs results in an IO with no visible SDs (due to display filtering). UI should prompt users to import related SDs when importing an IO.

---

## Flow Examples

### Flow 1: Initial Creation and First Publish

| Step | Action               | Result                                                               |
| ---- | -------------------- | -------------------------------------------------------------------- |
| 1    | Create Atlas "Brain" | Atlas brain-v1.0 (draft)                                             |
| 2    | Upload IO file       | Concept created from DOI+title; IO1-r1-wip-1 created; added to atlas |
| 3    | Upload SD file       | Concept created; SD1-r1-wip-1 created; added to atlas                |
| 4    | Link SD1 to IO1      | IO1.source_datasets = [SD1] (propagates globally)                    |
| 5    | Upload new IO file   | Same concept → IO1-r1-wip-2 (wip bump); atlas auto-updated           |
| 6    | Publish v1.0         | published_at set on IO1, SD1; draft=false                            |

### Flow 2: Update SD After Publish (Same Atlas)

| Step | Action              | Result                                           |
| ---- | ------------------- | ------------------------------------------------ |
| 1    | Starting state      | brain-v1.0 (published) with SD1-r1               |
| 2    | Create draft v1.1   | brain-v1.1 (draft) copies SD1-r1                 |
| 3    | Upload new SD1 file | SD1-r2-wip-1 created (published → revision bump) |
|      |                     | v1.1 auto-updated to SD1-r2-wip-1                |
|      |                     | v1.0 unchanged (published, frozen)               |
| 4    | Publish v1.1        | SD1-r2 published                                 |

### Flow 3: Import SD from Another Atlas

| Step | Action                      | Result                                            |
| ---- | --------------------------- | ------------------------------------------------- |
| 1    | Starting state              | Brain has SD1-r1; Lung has no SDs                 |
| 2    | Lung imports SD1            | SD1-r1 added to Lung's source_datasets (imported) |
| 3    | Brain uploads new SD1 file  | SD1-r2-wip-1 created; Brain drafts auto-updated   |
|      |                             | Lung still has SD1-r1 (opt-in required)           |
| 4    | Lung sees "newer available" | UI shows SD1 has newer version                    |
| 5    | Lung adopts new version     | Lung's source_datasets updated to SD1-r2-wip-1    |

### Flow 4: SD→IO Mapping Propagation

| Step | Action                  | Result                                                 |
| ---- | ----------------------- | ------------------------------------------------------ |
| 1    | Starting state          | Brain-v1.0 has IO1 with source_datasets=[SD1, SD2]     |
|      |                         | Lung-v1.0 imported IO1, has source_datasets=[SD1] only |
| 2    | Add SD3 to IO1 on Brain | IO1.source_datasets = [SD1, SD2, SD3] (global)         |
| 3    | View IO1 on Lung        | Displays [SD1] only (filtered by Lung's SD set)        |
| 4    | View IO1 on Brain       | Displays [SD1, SD2, SD3]                               |

**Key:** Mappings propagate globally, but display is filtered per-atlas.

### Flow 5: Concurrent Drafts (Different Generations)

| Step | Action                | Result                                                   |
| ---- | --------------------- | -------------------------------------------------------- |
| 1    | Starting state        | brain-v1.0 (published), brain-v2.0 (draft)               |
| 2    | Create v1.1 from v1.0 | brain-v1.1-draft created (allowed, different generation) |
| 3    | Upload SD1 to v1.1    | SD1-r2-wip-1 created                                     |
|      |                       | v1.1 auto-updated (target of upload)                     |
|      |                       | v2.0 auto-updated (same atlas, draft)                    |
|      |                       | v1.0 unchanged (published, frozen)                       |

### Flow 6: Cross-Atlas Import with Opt-in

| Step | Action                   | Result                                                   |
| ---- | ------------------------ | -------------------------------------------------------- |
| 1    | Starting state           | Brain-v1.0 has SD1-r1; Lung-v1.0 imported SD1-r1         |
| 2    | Brain creates v1.1-draft | brain-v1.1-draft has SD1-r1                              |
| 3    | Upload SD1 to Brain v1.1 | SD1-r2-wip-1 created; Brain v1.1 auto-updated            |
|      |                          | Lung still has SD1-r1 (different atlas, opt-in required) |
| 4    | Lung creates v1.1-draft  | lung-v1.1-draft has SD1-r1, sees "newer available"       |
| 5    | Lung adopts new version  | lung-v1.1-draft now has SD1-r2-wip-1                     |
