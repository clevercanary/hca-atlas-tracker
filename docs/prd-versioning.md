# PRD: Atlas Versioning Implementation

## Overview

This document describes the versioning strategy for HCA Atlases, integrated objects, and source datasets in the HCA Atlas Tracker. The goal is to support:

1. **Versioned Atlas Releases** - Allow atlas developers to publish versioned updates
2. **Versioned Development Checkpoints** - Track work-in-progress iterations
3. **Historical Access** - Older versions remain accessible

## Glossary

| Term                  | Definition                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| **Atlas**             | A collection of integrated objects and source datasets                                                    |
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

| Entity              | Needed Columns                    |
| ------------------- | --------------------------------- |
| `source_datasets`   | `revision_number`, `published_at` |
| `component_atlases` | `revision_number`, `published_at` |
| `atlases`           | `generation`, `revision`, `draft` |

## Design Principles

### Partial Ledger Pattern

**Files Table:**

- New row only when AWS file is new
- File key and AWS version are immutable
- Metadata fields (validation_status, integrity_status, etc.) are mutable

**Source Datasets / Integrated Objects:**

- New row when new file version uploaded
- Metadata/status fields are mutable
- File pointer (`file_id`) is immutable

**Atlases:**

- Published atlas:
  - Integrated objects: set is frozen, file content (h5ad hash) cannot change
  - Source datasets: set is frozen, file content (h5ad hash) cannot change
  - Source studies: can still be added, removed, or modified (reference material)
  - Other metadata (integration leads, etc.) can change
- Draft atlas: all linked entities and content can change
- **Version bump required** if IO or SD set changes, or if any file hash changes

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

### Linking Rules

- Only one version of a source dataset links to a given integrated object version
- A source dataset version may belong to multiple integrated objects
- Atlas arrays store `version_id`s (not entity `id`s)

## Events & Actions

### File Upload Events

| Event                                      | Current Behavior                   | Target Behavior                                     |
| ------------------------------------------ | ---------------------------------- | --------------------------------------------------- |
| **New SD file (first ever)**               | Create SD with `wip_number=1`      | Also set `revision_number=1`, `published_at=NULL`   |
| **New SD file (existing SD, unpublished)** | Create version with `wip_number+1` | Keep same `revision_number`, increment `wip_number` |
| **New SD file (existing SD, published)**   | Create version with `wip_number+1` | Increment `revision_number`, set `wip_number=1`     |
| **New IO file**                            | Same pattern as SD                 | Same pattern as SD                                  |

### Atlas Actions

| Action                       | Current                   | Target                                                                                       |
| ---------------------------- | ------------------------- | -------------------------------------------------------------------------------------------- |
| **Create atlas**             | Sets `status=IN_PROGRESS` | Also set `generation=1`, `revision=0`, `draft=true`                                          |
| **Create new atlas version** | Not implemented           | Copy atlas, set `draft=true`; option to bump generation (resets revision=0) or bump revision |
| **Publish atlas**            | Not implemented           | Set `published_at` on all linked SD/IO versions, set `draft=false`; one-way operation        |

### Source Study Actions

| Action                      | Behavior                                               |
| --------------------------- | ------------------------------------------------------ |
| **Add to draft atlas**      | Adds to `source_studies` JSONB (existing)              |
| **Remove from draft atlas** | Requires no linked source datasets (existing behavior) |

### Linking Actions

| Action                           | Behavior                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Link SD to source study**      | Set `source_study_id` on SD version (existing)                                                    |
| **Link SD to integrated object** | Add SD version_id to IO's `source_datasets[]`, replacing old version if same entity ID (existing) |

## API Endpoints

### New Endpoints Needed

| Endpoint                                               | Description                               |
| ------------------------------------------------------ | ----------------------------------------- |
| `GET /atlases/{id}/source-datasets/{sdId}/versions`    | List all versions of a source dataset     |
| `GET /atlases/{id}/integrated-objects/{ioId}/versions` | List all versions of an integrated object |
| `POST /atlases/{id}/publish`                           | Publish the atlas                         |
| `POST /atlases/{id}/versions`                          | Create new draft version from current     |

### Modified Endpoints

| Endpoint                               | Changes                                                 |
| -------------------------------------- | ------------------------------------------------------- |
| `GET /atlases`                         | Include `generation`, `revision`, `draft` in response   |
| `GET /atlases/{id}/source-datasets`    | Include `revision_number`, `wip_number`, `published_at` |
| `GET /atlases/{id}/integrated-objects` | Include `revision_number`, `wip_number`, `published_at` |
| Download endpoints                     | Generate versioned filenames                            |

## Data Migration

For existing data:

- `source_datasets`: Set `revision_number=1`, `published_at=NULL`
- `component_atlases`: Set `revision_number=1`, `published_at=NULL`
- `atlases`: Parse `overview.version` → `generation`/`revision`, set `draft=true`

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
2. Set `published_at = NOW()` on all linked SD and IO versions
3. Set `atlas.draft = false`
4. Return updated atlas

**Notes:**

- One-way operation (no unpublish)
- No validation requirements

**Acceptance Criteria:**

- [ ] All linked SD/IO versions have `published_at` set
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

**Acceptance Criteria:**

- [ ] New file upload for SD/IO on published atlas returns error
- [ ] Error message instructs user to create new atlas version
- [ ] Draft atlases still accept uploads normally

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

1. Create new atlas row copying from source
2. If `bumpGeneration`: `generation + 1`, `revision = 0`
3. Else: same `generation`, `revision + 1`
4. Set `draft = true`
5. Copy `source_datasets[]`, `component_atlases[]` arrays and relevant overview fields

**Acceptance Criteria:**

- [ ] New atlas with correct generation/revision
- [ ] Both SD and IO arrays copied
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

### Slice 5: Version History

**Goal:** View all previous versions of a source dataset or integrated object.

#### Ticket 5.1: [Backend] Add SD version history endpoint

**Endpoint:** `GET /atlases/{atlasId}/source-datasets/{sdId}/versions`

**Response:** Array of all versions for the entity ID, ordered by recency, with:

- `version_id`, `revision_number`, `wip_number`, `published_at`, `created_at`
- File info (size, key, validation_status)

**Acceptance Criteria:**

- [ ] Returns all versions for the entity ID
- [ ] Ordered by recency

**Dependencies:** Ticket 2.1

---

#### Ticket 5.2: [Backend] Add IO version history endpoint

**Endpoint:** `GET /atlases/{atlasId}/integrated-objects/{ioId}/versions`

**Response:** Same pattern as SD version history.

**Dependencies:** Ticket 2.2

---

#### Ticket 5.3: [Frontend] Add version history view for SD/IO

**Changes:**

- Add "View History" link/button on SD/IO detail pages
- Display list of previous versions with version info
- Allow viewing/downloading previous versions

**Acceptance Criteria:**

- [ ] Can view all versions of an SD or IO
- [ ] Shows version metadata (revision, wip, dates)
- [ ] Can download previous versions

---

### Slice 6: Versioned Download Filenames

**Goal:** Downloads include version in filename for provenance tracking.

#### Ticket 6.1: [Backend] Generate versioned download filenames

**Logic:**

- If `published_at` is set: `{filename}-r{revision}.h5ad`
- If `published_at` is null (or column doesn't exist yet): `{filename}-r{revision}-wip-{wip}.h5ad`

**Acceptance Criteria:**

- [ ] Draft files get `rN-wip-M` suffix
- [ ] Published files get `rN` suffix (once publishing exists)
- [ ] Original S3 key unchanged, only download filename affected

**Dependencies:** Tickets 2.1, 2.2 (can deploy before Slice 3)

---

#### Ticket 6.2: [Frontend] Update download buttons to use versioned filenames

**Changes:**

- Download links/buttons use new versioned filename from API

**Acceptance Criteria:**

- [ ] Downloaded files have versioned names

---

## Ticket Summary

| Slice | Ticket | Type | Description                                        |
| ----- | ------ | ---- | -------------------------------------------------- |
| 1     | 1.1    | BE   | Atlas generation/revision columns + API            |
| 1     | 1.2    | FE   | Display atlas version                              |
| 2     | 2.1    | BE   | SD revision_number column + API                    |
| 2     | 2.2    | BE   | IO revision_number column + API                    |
| 2     | 2.3    | FE   | Display SD/IO version                              |
| 3     | 3.1    | BE   | published_at (SD/IO) + draft (atlas) columns + API |
| 3     | 3.2    | BE   | Publish atlas endpoint                             |
| 3     | 3.3    | BE   | Increment revision_number after publish            |
| 3     | 3.4    | BE   | Enforce published atlas immutability               |
| 3     | 3.5    | FE   | Display draft/published + publish action           |
| 4     | 4.1    | BE   | Create new atlas version endpoint                  |
| 4     | 4.2    | FE   | Create new version action                          |
| 5     | 5.1    | BE   | SD version history endpoint                        |
| 5     | 5.2    | BE   | IO version history endpoint                        |
| 5     | 5.3    | FE   | Version history view                               |
| 6     | 6.1    | BE   | Versioned download filenames                       |
| 6     | 6.2    | FE   | Download with versioned names                      |

---

## Recommended Delivery Order

Each slice is deployable end-to-end:

1. **Slice 1** (1.1-1.2): Atlas shows `v1.0` format
2. **Slice 2** (2.1-2.3): SD/IO show revision numbers
3. **Slice 6** (6.1-6.2): Versioned downloads (WIP format: `file-r1-wip-3.h5ad`)
4. **Slice 3** (3.1-3.5): Publishing workflow complete (downloads now show `file-r1.h5ad` when published)
5. **Slice 4** (4.1-4.2): Can create new atlas versions
6. **Slice 5** (5.1-5.3): Version history viewable
