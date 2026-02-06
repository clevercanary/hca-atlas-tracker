# PRD: Atlas Versioning Implementation

## Overview

This document describes the versioning strategy for HCA Atlases, integrated objects, and source datasets in the HCA Atlas Tracker. The goal is to support:

1. **Versioned Atlas Releases** - Allow atlas developers to publish versioned updates
2. **Versioned Development Checkpoints** - Track work-in-progress iterations
3. **Historical Access** - Older versions remain accessible

## Glossary

| Term                  | Definition                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Atlas**             | A container holding IOs and SDs with their mappings                                                        |
| **Integrated Object** | An anndata file combining cells/metadata from multiple source datasets                                     |
| **Source Dataset**    | A dataset from a source study selected for integration                                                     |
| **Source Study**      | A publication that generated datasets                                                                      |
| **Concept**           | A logical entity (SD or IO) identified by atlas family (short_name + network) + generation + base filename |
| **Base Filename**     | Filename with version suffix stripped (e.g., `brain-cells.h5ad` from `brain-cells-r1-wip-2.h5ad`)          |
| **Native SD/IO**      | An SD/IO created by upload to this atlas (originating atlas)                                               |
| **Imported SD/IO**    | An SD/IO linked from another atlas via explicit import action                                              |
| **Generation**        | Major atlas iteration (1, 2, 3...) - manually bumped when creating new version (e.g., adding new studies)  |
| **Revision**          | Numbered update within a generation, representing a file version change (1, 2, 3...)                       |
| **WIP Number**        | Work-in-progress checkpoint counter within a revision                                                      |

## Versioning Scheme

### Published Atlas Naming

- Atlas: `atlas-name-v{generation}.{revision}` (e.g., `my-atlas-v1.1`)
- Files: `file-name-r{revision}.h5ad` (e.g., `my-dataset-r2.h5ad`)

### Draft Atlas Naming

- Atlas: `atlas-name-v{generation}.{revision}-draft` (e.g., `my-atlas-v1.2-draft`)
- Files: `file-name-r{revision}-wip-{checkpoint}.h5ad` (e.g., `my-dataset-r2-wip-3.h5ad`)

## Key Behaviors

### Concepts (Lineage Tracking)

Each SD/IO has a **concept** that tracks its identity across versions. Concepts are identified by **(atlas family + generation + base filename)**.

- **Base filename** = filename with version suffix stripped (`brain-cells.h5ad` from `brain-cells-r1-wip-2.h5ad`)
- **Atlas family** = (short_name, network), e.g., all versions of "Brain" atlas
- **Generation** = major atlas iteration (1, 2, 3...); concepts are scoped per generation
- Same filename uploaded within the same generation → same concept → new version
- Same filename in a different generation → new concept (see note below)
- Different filename → new concept → new SD/IO

**Cross-generation sharing:** To use a concept from generation 1 in generation 2, import it. Imports opt-in to newer versions as they're uploaded to the home generation.

**Same filename uploaded to wrong generation:** If someone uploads a filename that already exists as a concept in another generation:

- **Archive + rename** — if it's a different dataset, archive the mistaken upload, rename, re-upload
- **Archive + upload to correct generation** — if it's the same dataset, archive and upload to the home generation
- **Leave as duplicate** — technically possible but creates confusion; not recommended

### Native vs Imported

- **Native:** SD/IO created by uploading to this atlas generation. Only the home generation can upload new versions.
- **Imported:** SD/IO linked from another atlas OR another generation via explicit import action. Can opt-in to newer versions.

Imports work the same way whether cross-atlas or cross-generation. The UI shows home atlas/generation on SD/IO lists and tags imports distinctly.

### Auto-Update (Same Generation Only)

When a new file is uploaded for an existing concept, **draft atlases in the same generation** automatically get the new version.

- Only replaces existing SD/IO versions; doesn't add new ones
- Published atlases are frozen; must create a new draft first
- Mandatory within the generation—no opt-out
- **Cross-generation:** Other generations that imported the concept see "newer version available" and opt-in explicitly

### Merge ("Mark as new version of...")

When a user renames a file, it creates a new concept. To preserve lineage:

1. User selects the new SD/IO and chooses **"Mark as new version of..."**
2. System reassigns files to the target concept, renumbers versions
3. Target concept adopts the new filename as canonical
4. Future uploads with the new filename match the merged concept

### Archive (Already Implemented)

Archive is a **soft-delete** for removing SD/IOs from an atlas without destroying data.

- Sets `is_archived = true` on the file record
- Archived items remain in atlas arrays but are **filtered out** of counts and active views
- Can be **unarchived** to restore visibility
- Only works on latest versions (`is_latest = true`)
- **Only works on unpublished SD/IOs** (`published_at IS NULL`)

**Removing Published SD/IOs:**

Once an SD/IO is published, archive is not allowed. To remove a published SD/IO from an atlas:

1. Create a new draft version of the atlas
2. Remove the SD/IO from the draft (removes from atlas's arrays)
3. Publish the new version

This preserves the historical record—v1.0 still shows the SD/IO; v1.1 does not.

**Current workflow for filename changes (without lineage):**

1. Archive the old SD/IO
2. Upload with new filename (creates new concept)
3. Re-link source study (for SD) or source datasets (for IO)

This works but **breaks lineage**—the new SD/IO has no version history connection to the old one.

### Archive vs Merge: When to Use What

| Scenario                        | Use Archive           | Use Merge                         |
| ------------------------------- | --------------------- | --------------------------------- |
| File was uploaded by mistake    | ✅ Archive it         | —                                 |
| Wrong file, need to remove      | ✅ Archive it         | —                                 |
| Filename changed, same data     | —                     | ✅ Merge to preserve lineage      |
| Renamed for clarity/consistency | —                     | ✅ Merge to preserve lineage      |
| Duplicate accidentally created  | Archive the duplicate | Or merge if it has useful history |
| Need to undo an archive         | ✅ Unarchive it       | —                                 |

**Rule of thumb:** Use **archive** for mistakes; use **merge** for intentional filename changes where you want to keep version history.

**Note:** Archive only works on unpublished SD/IOs. For published SD/IOs, create a draft and use **remove** instead.

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
| `files`             | `is_latest`, `version_id` (S3), `is_archived`            | New row per S3 upload                      |
| `source_datasets`   | `id`, `version_id`, `is_latest`, `wip_number`, `file_id` | New row per file version; metadata mutable |
| `component_atlases` | `id`, `version_id`, `is_latest`, `wip_number`, `file_id` | New row per file version; metadata mutable |
| `atlases`           | `status`, `overview.version`                             | No versioning; arrays store version_ids    |

### What's Missing

| Entity              | Needed Columns/Changes                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `concepts`          | New table: `id`, `atlas_short_name`, `network`, `generation`, `base_filename`, `file_type` |
| `files`             | `concept_id` → concepts                                                                    |
| `source_datasets`   | `id` → concepts (FK), `revision_number`, `published_at`                                    |
| `component_atlases` | `id` → concepts (FK), `revision_number`, `published_at`                                    |
| `atlases`           | `generation`, `revision`, `draft`                                                          |

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

Concepts provide lineage tracking using filename as identity. When a new file is uploaded, the system strips any version suffix from the filename to find the base filename, then matches to an existing concept or creates a new one.

**Why (short_name, network, generation) instead of atlas_id?**

Atlas versioning creates separate atlas records (v1.0, v1.1, v2.0 each have different IDs). Tying concepts to a specific atlas_id would break lineage across revisions within a generation. Using (short_name, network, generation) ensures all revisions within a generation share the same concepts, while keeping generations separate.

**Why include generation?**

Including generation in the concept key ensures there's only ONE place to upload new versions of a concept (the home generation). Without generation, uploading to any generation's draft would update all generations, which is confusing. With generation scoping, cross-generation sharing is explicit via import.

**Concept ID = SD/IO ID**

The concept's UUID is used as the SD/IO's `id`. All version rows for the same SD/IO share the same `id` (the concept ID), while `version_id` remains unique per row. This makes the concept the stable identity across versions.

| Field                          | Meaning                                      |
| ------------------------------ | -------------------------------------------- |
| `source_datasets.id`           | = concept ID (stable across all versions)    |
| `source_datasets.version_id`   | Unique per row (identifies specific version) |
| `component_atlases.id`         | = concept ID (stable across all versions)    |
| `component_atlases.version_id` | Unique per row (identifies specific version) |

**Schema:**

```sql
CREATE TABLE hat.concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atlas_short_name TEXT NOT NULL,
  network TEXT NOT NULL,
  generation INTEGER NOT NULL,   -- home generation for this concept
  base_filename TEXT NOT NULL,   -- filename with version suffix stripped
  file_type TEXT NOT NULL,       -- 'source_dataset' or 'integrated_object'
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_concepts_unique
  ON hat.concepts(atlas_short_name, network, generation, base_filename, file_type);

-- SD/IO id references concept id (stable identity across versions)
ALTER TABLE hat.source_datasets
  ADD CONSTRAINT fk_sd_concept FOREIGN KEY (id) REFERENCES hat.concepts(id);
ALTER TABLE hat.component_atlases
  ADD CONSTRAINT fk_io_concept FOREIGN KEY (id) REFERENCES hat.concepts(id);

-- Files also reference concept for direct lookup
ALTER TABLE hat.files ADD COLUMN concept_id UUID REFERENCES hat.concepts(id);
```

**Version Suffix Stripping:**

On upload, the system strips version suffixes to determine the base filename:

| Uploaded Filename           | Base Filename      | Version Detected |
| --------------------------- | ------------------ | ---------------- |
| `brain-cells.h5ad`          | `brain-cells.h5ad` | (none)           |
| `brain-cells-r1-wip-2.h5ad` | `brain-cells.h5ad` | r1-wip-2         |
| `brain-cells-r2.h5ad`       | `brain-cells.h5ad` | r2               |

**Regex pattern:** `-r\d+(-wip-\d+)?(?=\.h5ad$)`

**Behavior:**

- On file upload: strip version suffix → find or create concept by (short_name, network, generation, base_filename, file_type) → set `file.concept_id`
- Same base filename in same generation → same concept → new version
- Same base filename in different generation → new concept (cross-generation sharing requires import)
- Different base filename → different concept → new SD/IO
- Version in uploaded filename is informational only; system assigns the next version number

**Duplicate filename warning:** If uploading a filename that exists as a concept in another generation of the same atlas family, the system should warn the user and suggest importing from the existing concept instead. Options to consider for implementation:

- Post-upload notification in the tracker UI
- Pre-upload check via smart-sync CLI + new API endpoint

**Why Filename-Based:**

- Works for both SDs and IOs (IOs don't have source studies)
- Immediate concept assignment on upload (no waiting for source study link)
- Users naturally keep filenames stable; version suffix allows external version visibility
- Simple mental model: "same filename = same thing"

**Escape Hatch - Merge:**

When a filename changes (user renamed the file), the system creates a new concept. Users can merge concepts to preserve lineage. See [Merge Concepts](#merge-concepts) section.

### SD/IO Shared Library

SDs and IOs exist in a shared library and can be linked to multiple atlases.

| Term         | Definition                                           |
| ------------ | ---------------------------------------------------- |
| **Native**   | Created by upload to this atlas (originating atlas)  |
| **Imported** | Linked from another atlas via explicit import action |

**Rules:**

- First upload creates SD/IO linked to uploading atlas generation only
- Explicit import action links existing SD/IO to another atlas or generation
- Only the home generation can upload new versions (enforced by concept model: upload to different generation = different concept)
- Any atlas/generation can import any SD/IO (no restrictions)

**Home Generation:** Determined by the concept's `generation` field. Since concepts are scoped to (short_name, network, generation), the home generation is inherent in the concept itself—no separate tracking needed.

### SD→IO Relationship (Stays on IO)

SD→IO mappings remain on the IO entity (`component_atlases.source_datasets[]`).

**Propagation:** Mapping changes propagate to all atlases using that IO version.

**Display Filtering:** When viewing an IO on atlas X, only show SDs that are in X's `source_datasets[]`. This ensures published atlases with frozen SD sets display consistently even if the underlying IO has more mappings.

**Constraint:** Can only link an SD to an IO if the SD is in the viewing atlas's `source_datasets[]`. This is enforced at link creation time.

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

### File Upload Flow

**Upload Process (via hca-smart-sync CLI):**

1. User runs `hca-smart-sync` which compares local files with S3 by filename + sha256
2. New/changed files are uploaded to S3 (`{network}/{short_name}_v{generation}_{revision}/source-datasets/{filename}`, e.g., `gut/gut_v1_0/source-datasets/cells.h5ad`)
3. S3 triggers SNS notification → AppRunner API endpoint
4. System determines (short_name, network, generation) and file_type from S3 path
5. System strips version suffix from filename to get base_filename
6. System finds or creates concept by (short_name, network, generation, base_filename, file_type)
7. Creates file record with concept_id set
8. Creates SD/IO record linked to the file (new version if concept exists, new SD/IO if new concept)
9. Auto-updates other drafts in the same generation
10. Triggers validation

**Version Suffix Stripping Examples:**

| S3 Key                                               | short_name | network | gen | Base Filename  | Concept Match           |
| ---------------------------------------------------- | ---------- | ------- | --- | -------------- | ----------------------- |
| `bio/brain_v1_0/source-datasets/cells.h5ad`          | brain      | bio     | 1   | `cells.h5ad`   | Find/create             |
| `bio/brain_v1_1/source-datasets/cells-r1-wip-2.h5ad` | brain      | bio     | 1   | `cells.h5ad`   | Same concept (same gen) |
| `bio/brain_v1_2/source-datasets/cells-r2.h5ad`       | brain      | bio     | 1   | `cells.h5ad`   | Same concept (same gen) |
| `bio/brain_v2_0/source-datasets/cells.h5ad`          | brain      | bio     | 2   | `cells.h5ad`   | New concept (diff gen)  |
| `bio/brain_v1_0/source-datasets/neurons.h5ad`        | brain      | bio     | 1   | `neurons.h5ad` | New concept (diff name) |

**Key Points:**

- **S3 path** determines (short_name, network) and file_type
- **Base filename** (version suffix stripped) determines concept
- Concept assignment is **immediate** on upload (no waiting for source study link)
- Version in uploaded filename is ignored for matching; system assigns next version number

**CAP Team Workflow:**

1. CAP downloads `SD1-r1-wip-1.h5ad` (versioned filename)
2. CAP annotates the file locally
3. CAP uploads `SD1-r1-wip-1.h5ad` (same filename they downloaded)
4. System strips suffix → base filename `SD1.h5ad` → matches existing concept
5. System creates `SD1-r1-wip-2` (next wip number)

The uploaded filename's version suffix is informational—it tells the system what version CAP _had_, but the system assigns the _next_ version.

### Merge Concepts

When a user renames a file, the system creates a new concept (different base filename). To preserve version lineage, users can merge concepts using **"Mark as new version of..."**.

**Scenario:**

1. User uploads `brain-cells.h5ad` → Concept A created (wip-1, wip-2)
2. User renames file to `brain-cells-final.h5ad` and uploads → Concept B created (wip-1)
3. User realizes B should continue A's lineage
4. User selects B and chooses "Mark as new version of A"

**Merge Operation:**

1. Reassign Concept B's files to Concept A (`file.concept_id = A`)
2. Renumber versions (B's wip-1 becomes A's wip-3)
3. Update Concept A's `base_filename` to `brain-cells-final.h5ad` (new canonical name)
4. Delete Concept B (now empty)
5. Future uploads of `brain-cells-final.h5ad` match Concept A

**UI:**

- Action appears on SD/IO detail view: **"Mark as new version of..."**
- Opens picker showing other SDs/IOs in the same atlas family
- Confirms the merge with preview of version renumbering

**Constraints:**

- Can only merge concepts within the same atlas family and generation (short_name, network, generation)
- Can only merge concepts of the same file_type (SD→SD, IO→IO)
- Source concept (being merged away) should have no published versions, or user must confirm

**Real-World Analogy:**

Similar to Jira's "Mark as duplicate" or Zenodo's "new version of existing record"—explicitly linking two things that are actually the same.

### Version Update Behavior

| Scenario                                | Behavior                                   |
| --------------------------------------- | ------------------------------------------ |
| New version uploaded to home generation | All drafts in that generation: auto-update |
| Other generations with imported SD/IO   | Opt-in to new version (draft only)         |
| Other atlases with imported SD/IO       | Opt-in to new version (draft only)         |
| Published atlases                       | Frozen; must create draft first            |

**Auto-update (same generation only):**

When a new file is uploaded for an existing SD/IO, **draft atlases in the same generation** automatically get the new version. For example, uploading to brain-v1.1-draft updates brain-v1.2-draft (same generation), but NOT brain-v2.0-draft (different generation).

**Important:** Auto-update only **replaces** existing SD/IO versions in each draft. If a draft doesn't contain that SD/IO, nothing is added. Auto-update is mandatory within the generation—no opt-out.

**Opt-in (different generation or atlas):**

Atlases/generations that imported an SD/IO see a "newer version available" indicator. Users explicitly adopt the new version. This applies to both cross-atlas and cross-generation imports.

### Atlas Version Grouping

Atlas versions are grouped by **(short_name, network, generation)**:

- `brain-v1.0` and `brain-v1.1` are versions within generation 1
- `brain-v2.0` is a new generation

**Draft constraints:**

- Only one draft per (short_name, network, generation)
  - ✅ Allowed: `brain-v1.2-draft` and `brain-v2.0-draft` (different generations)
  - ❌ Not allowed: `brain-v1.1-draft` and `brain-v1.2-draft` (same generation)
- Can only create a new draft from the **latest published version** in that generation
  - If v1.1 is published, new draft must be created from v1.1 (not v1.0)
  - Cannot create from older versions to avoid SD/IO version divergence

## Events & Actions

### File Upload Events

| Event                                 | Precondition                 | Behavior                                                                           |
| ------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| **New SD file (new concept)**         | Atlas is draft               | Strip suffix → new concept → Create SD with `revision_number=1`, `wip_number=1`    |
| **New SD file (existing, draft)**     | Atlas is draft, SD draft     | Strip suffix → match concept → Same `revision_number`, `wip_number+1`; auto-update |
| **New SD file (existing, published)** | Atlas is draft, SD published | Strip suffix → match concept → `revision_number+1`, `wip_number=1`; auto-update    |
| **New SD file to published atlas**    | Atlas is published           | **Rejected** - must create draft atlas first                                       |
| **New IO file**                       | Same as SD                   | Same patterns as SD                                                                |

### Merge Actions

| Action                        | Precondition                              | Behavior                                                                                         |
| ----------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Mark as new version of...** | Source has no published versions (or ack) | Reassign files to target concept, renumber versions, update base_filename, delete source concept |

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

### Archive & Remove Actions

| Action                      | Precondition                             | Behavior                                           |
| --------------------------- | ---------------------------------------- | -------------------------------------------------- |
| **Archive SD/IO**           | `is_latest=true`, `published_at IS NULL` | Set `is_archived=true`; filtered from active views |
| **Unarchive SD/IO**         | `is_latest=true`, `is_archived=true`     | Set `is_archived=false`; visible again             |
| **Archive published SD/IO** | `published_at IS NOT NULL`               | **Rejected** - must create draft and remove        |
| **Remove SD/IO from atlas** | Atlas is draft                           | Remove version_id from atlas's arrays              |
| **Remove SD/IO from atlas** | Atlas is published                       | **Rejected** - must create draft first             |

### Linking Actions (SD→IO)

| Action                | Behavior                                                                    |
| --------------------- | --------------------------------------------------------------------------- |
| **Link SD to IO**     | Add SD to IO's `source_datasets[]`; propagates to all atlases using that IO |
| **Unlink SD from IO** | Remove SD from IO's `source_datasets[]`; propagates to all atlases          |

**Constraints:**

- Can only link SD if it's in the viewing atlas's `source_datasets[]`
- Can only manage links on **native IOs** (not imported IOs)

**Propagation:** For native IOs, both draft and published atlases of the originating atlas family can update SD→IO links; changes propagate globally to all atlases using that IO version. Imported IOs cannot have their links modified directly.

**Display:** Each atlas filters IO's SDs to only show those in its own `source_datasets[]`.

## API Endpoints

### New Endpoints

| Endpoint                                               | Description                                    |
| ------------------------------------------------------ | ---------------------------------------------- |
| `POST /atlases/{id}/publish`                           | Publish the atlas                              |
| `POST /atlases/{id}/versions`                          | Create new draft version from current          |
| `POST /atlases/{id}/source-datasets/import`            | Import SD from another atlas                   |
| `POST /atlases/{id}/integrated-objects/import`         | Import IO from another atlas                   |
| `DELETE /atlases/{id}/source-datasets/{sdId}`          | Remove SD from draft atlas                     |
| `DELETE /atlases/{id}/integrated-objects/{ioId}`       | Remove IO from draft atlas                     |
| `POST /atlases/{id}/source-datasets/{sdId}/adopt`      | Adopt newer version of imported SD             |
| `POST /atlases/{id}/integrated-objects/{ioId}/adopt`   | Adopt newer version of imported IO             |
| `POST /atlases/{id}/source-datasets/{sdId}/merge`      | Merge SD into another (mark as new version of) |
| `POST /atlases/{id}/integrated-objects/{ioId}/merge`   | Merge IO into another (mark as new version of) |
| `GET /atlases/{id}/source-datasets/{sdId}/versions`    | List all versions of a source dataset          |
| `GET /atlases/{id}/integrated-objects/{ioId}/versions` | List all versions of an integrated object      |
| `GET /source-datasets`                                 | Browse SD library (for import)                 |
| `GET /integrated-objects`                              | Browse IO library (for import)                 |

### Modified Endpoints

| Endpoint                               | Changes                                                                                      |
| -------------------------------------- | -------------------------------------------------------------------------------------------- |
| `GET /atlases`                         | Include `generation`, `revision`, `draft`                                                    |
| `GET /atlases/{id}/source-datasets`    | Include `revision_number`, `wip_number`, `published_at`, `imported`, `newerVersionAvailable` |
| `GET /atlases/{id}/integrated-objects` | Include `revision_number`, `wip_number`, `published_at`, `imported`, `newerVersionAvailable` |
| `GET /atlases/{id}/integrated-objects` | Filter `source_datasets` to those in atlas's SD list                                         |
| `PATCH /atlases/{id}/files/archive`    | Reject if any file has `published_at IS NOT NULL`                                            |
| Download endpoints                     | Generate versioned filenames via Content-Disposition header or presigned URL parameter       |

## Data Migration

For existing data:

- `concepts`: Create concepts from existing files using (short_name, network, generation, base_filename, file_type); strip any version suffixes from existing filenames; generation derived from S3 key
- `files`: Populate `concept_id` based on (short_name, network, generation, base_filename, file_type) lookup
- `source_datasets`: Set `revision_number=1`, `published_at=NULL`
- `component_atlases`: Set `revision_number=1`, `published_at=NULL`
- `atlases`: Parse `overview.version` (e.g., "1.0" → generation=1, revision=0), set `draft=true`. If unparseable or NULL, default to generation=1, revision=0.

**Note:** All existing files will get concept_id assigned immediately based on their filename and atlas generation. No manual linking required.

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

**Goal:** Track SD/IO lineage using filename as identity, with version suffix stripping.

#### Ticket 1.1: [Backend] Create concepts table and link SD/IO id

**Schema:**

```sql
CREATE TABLE hat.concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atlas_short_name TEXT NOT NULL,
  network TEXT NOT NULL,
  generation INTEGER NOT NULL,   -- home generation for this concept
  base_filename TEXT NOT NULL,   -- filename with version suffix stripped
  file_type TEXT NOT NULL,       -- 'source_dataset' or 'integrated_object'
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_concepts_unique
  ON hat.concepts(atlas_short_name, network, generation, base_filename, file_type);

-- SD/IO id references concept id (stable identity across versions)
ALTER TABLE hat.source_datasets
  ADD CONSTRAINT fk_sd_concept FOREIGN KEY (id) REFERENCES hat.concepts(id);
ALTER TABLE hat.component_atlases
  ADD CONSTRAINT fk_io_concept FOREIGN KEY (id) REFERENCES hat.concepts(id);

-- Files also reference concept for direct lookup
ALTER TABLE hat.files ADD COLUMN concept_id UUID REFERENCES hat.concepts(id);
```

**Migration:**

1. Create concepts from existing SD/IO records using (short_name, network, generation, base_filename, file_type)
2. Update SD/IO `id` to match concept `id` (requires updating FK references in atlases arrays)
3. Populate `file.concept_id` based on linked SD/IO
4. Generation is derived from S3 key (e.g., `gut/gut_v1_0/...` → generation 1)

**Acceptance Criteria:**

- [ ] Concepts table created with proper indexes
- [ ] Existing SD/IO ids updated to reference concepts
- [ ] Existing files have concept_id populated
- [ ] Uniqueness enforced on (atlas_short_name, network, generation, base_filename, file_type)
- [ ] All version rows for same SD/IO share the same `id` (concept ID)

---

#### Ticket 1.2: [Backend] Version suffix stripping and concept assignment on upload

**Code:**

- Implement `stripVersionSuffix(filename)` function:
  - Pattern: `-r\d+(-wip-\d+)?(?=\.h5ad$)`
  - Examples: `foo-r1-wip-2.h5ad` → `foo.h5ad`, `foo-r2.h5ad` → `foo.h5ad`
- On file upload:
  - Extract (short_name, network, generation) and file_type from S3 path
  - Strip version suffix from filename → base_filename
  - Find or create concept by (short_name, network, generation, base_filename, file_type)
  - Set `file.concept_id`
  - Create SD/IO version row with `id` = concept id (same id for all versions)

**Acceptance Criteria:**

- [ ] Version suffix correctly stripped from various filename patterns
- [ ] New uploads immediately get concept_id assigned
- [ ] SD/IO version row created with `id` = concept id
- [ ] Same base filename in same generation → same concept (new version row with same id)
- [ ] Same base filename in different generation → new concept (new id)
- [ ] Different base filename → different concept (new SD/IO with new id)
- [ ] Version in uploaded filename is ignored for matching

---

#### Ticket 1.3: [Backend] Merge concepts endpoint

**Endpoint:** `POST /atlases/{atlasId}/source-datasets/{sdId}/merge`

**Body:** `{ "targetSdId": "uuid" }` (target SD/IO id, which equals target concept id)

**Logic:**

1. Validate source and target are in same atlas family and generation (short_name, network, generation), same file_type
2. Warn if source has published versions (require `force: true`)
3. Update source SD/IO version rows: set `id` = target concept id
4. Reassign source concept's files to target concept (`file.concept_id` = target)
5. Renumber versions (append to target's version sequence)
6. Update target concept's `base_filename` to source's base_filename (new canonical name)
7. Update atlas arrays to replace source id with target id
8. Delete source concept
9. Return updated target SD/IO

**Acceptance Criteria:**

- [ ] Source SD/IO version rows now have target's id
- [ ] Files reassigned to target concept
- [ ] Versions renumbered correctly
- [ ] Target's base_filename updated
- [ ] Atlas arrays updated to reference target id
- [ ] Source concept deleted
- [ ] Rejects cross-generation, cross-atlas-family, or cross-type merges
- [ ] Warns/rejects if source has published versions (unless forced)

---

#### Ticket 1.4: [Frontend] "Mark as new version of..." UI

**Changes:**

- Add action to SD/IO detail view: "Mark as new version of..."
- Picker showing other SDs/IOs in same atlas family and generation (same type)
- Confirmation dialog with version renumbering preview
- Warning if source has published versions

**Acceptance Criteria:**

- [ ] Action visible on SD/IO detail view
- [ ] Picker filters to same atlas family and generation (short_name, network, generation), same file_type
- [ ] Preview shows how versions will be renumbered
- [ ] Merge completes and UI updates

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
- Auto-update draft atlases of the same (short_name, network, generation) on new version
  - Note: Only updates drafts in the SAME generation; cross-generation requires opt-in
- Match files by concept_id

**Fix:** Current code uses unscoped `ARRAY_REPLACE` that updates ALL atlases. Must be changed to update only drafts of the same (short_name, network, generation).

---

#### Ticket 4.5: [Frontend] Display draft/published status and publish action

---

#### Ticket 4.6: [Backend] Enforce archive only on unpublished SD/IOs

**Code:** Update `updateAtlasFilesArchiveStatus` to reject if any file's linked SD/IO has `published_at IS NOT NULL`. Requires joining files → source_datasets/component_atlases to check.

**Acceptance Criteria:**

- [ ] Archive action rejected for published SD/IOs with clear error message
- [ ] Unarchive action still works on any unpublished SD/IO
- [ ] Tests verify archive blocked on published SD/IOs

---

#### Ticket 4.7: [Backend] Remove SD/IO from draft atlas endpoint

**Endpoints:**

- `DELETE /atlases/{atlasId}/source-datasets/{sdId}` - Remove SD from draft atlas
- `DELETE /atlases/{atlasId}/integrated-objects/{ioId}` - Remove IO from draft atlas

**Logic:**

1. Verify atlas is draft
2. Remove version_id from atlas's `source_datasets[]` or `component_atlases[]` array
3. Does NOT delete the SD/IO—just removes from this atlas

**Acceptance Criteria:**

- [ ] SD/IO removed from atlas arrays
- [ ] SD/IO still exists in database (can be re-imported)
- [ ] Rejected on published atlases
- [ ] Rejected if SD/IO not in atlas

---

#### Ticket 4.8: [Frontend] Remove SD/IO action on draft atlases

**Changes:**

- Add "Remove from atlas" action on SD/IO detail view (draft atlases only)
- Confirmation dialog explaining the SD/IO can be re-imported later
- Hidden on published atlases

---

### Slice 5: Create New Atlas Version

**Goal:** Create new draft from published atlas.

#### Ticket 5.1: [Backend] Implement create atlas version endpoint

**Endpoint:** `POST /atlases/{atlasId}/versions`

**Logic:**

1. Reject if source atlas is not the latest published in its generation
2. Calculate version numbers from atlases with same (short_name, network):
   - If bumping generation: `generation = max(generation) + 1`, `revision = 0`
   - If bumping revision: keep generation, `revision = max(revision within generation) + 1`
3. Reject if draft exists for target (short_name, network, generation)
4. Copy atlas with `draft = true`

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

- `imported`: true if originating atlas family ≠ current atlas family
- `newerVersionAvailable`: true if a newer version exists for this concept (compare by created_at or wip_number)

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

**Logic:** Strip `.h5ad` extension from base_filename, append version, re-add extension:

- Published: `{name}-r{revision}.h5ad`
- Draft: `{name}-r{revision}-wip-{wip}.h5ad`

Example: base_filename `cells.h5ad` → download as `cells-r1-wip-2.h5ad`

---

#### Ticket 8.2: [Frontend] Update download buttons

---

## Ticket Summary

| Slice | Ticket | Type | Description                                   |
| ----- | ------ | ---- | --------------------------------------------- |
| 1     | 1.1    | BE   | Concepts table + SD/IO id linkage             |
| 1     | 1.2    | BE   | Version suffix stripping + concept assignment |
| 1     | 1.3    | BE   | Merge concepts endpoint                       |
| 1     | 1.4    | FE   | "Mark as new version of..." UI                |
| 2     | 2.1    | BE   | Atlas generation/revision columns             |
| 2     | 2.2    | FE   | Display atlas version                         |
| 3     | 3.1    | BE   | SD/IO revision_number columns                 |
| 3     | 3.2    | FE   | Display SD/IO version                         |
| 4     | 4.1    | BE   | published_at + draft columns                  |
| 4     | 4.2    | BE   | Publish atlas endpoint                        |
| 4     | 4.3    | BE   | Increment revision after publish              |
| 4     | 4.4    | BE   | Enforce immutability + scope updates          |
| 4     | 4.5    | FE   | Draft/published UI + publish action           |
| 4     | 4.6    | BE   | Enforce archive only on unpublished SD/IOs    |
| 4     | 4.7    | BE   | Remove SD/IO from draft atlas endpoint        |
| 4     | 4.8    | FE   | Remove SD/IO action on draft atlases          |
| 5     | 5.1    | BE   | Create atlas version endpoint                 |
| 5     | 5.2    | FE   | Create new version action                     |
| 6     | 6.1    | BE   | SD/IO library browse endpoints                |
| 6     | 6.2    | BE   | Import SD/IO endpoints                        |
| 6     | 6.3    | BE   | Adopt new version endpoints                   |
| 6     | 6.4    | BE   | imported + newerVersionAvailable fields       |
| 6     | 6.5    | FE   | Import SD/IO UI                               |
| 6     | 6.6    | FE   | Imported indicator + adopt action             |
| 7     | 7.1    | BE   | Version history endpoints                     |
| 7     | 7.2    | FE   | Version history view                          |
| 8     | 8.1    | BE   | Versioned download filenames                  |
| 8     | 8.2    | FE   | Download with versioned names                 |

---

## Recommended Delivery Order

1. **Slice 1** (1.1-1.2): Concept model foundation (filename-based, immediate assignment)
2. **Slice 2** (2.1-2.2): Atlas shows `v1.0` format
3. **Slice 3** (3.1-3.2): SD/IO show revision numbers
4. **Slice 8** (8.1-8.2): Versioned downloads
5. **Slice 4** (4.1-4.8): Publishing workflow, archive constraints, remove from draft
6. **Slice 5** (5.1-5.2): Create new atlas versions
7. **Slice 1 continued** (1.3-1.4): Merge concepts (can be deferred until needed)
8. **Slice 6** (6.1-6.6): Import and opt-in (SD import first, IO import last)
9. **Slice 7** (7.1-7.2): Version history

**Note on IO Import:** Import IO should be implemented after SD import is working, as importing an IO without its mapped SDs results in an IO with no visible SDs (due to display filtering). UI should prompt users to import related SDs when importing an IO.

**Note on Merge:** The merge functionality (1.3-1.4) can be deferred until users actually need it. Most users will keep filenames stable; merge is the escape hatch for when they don't.

---

## Flow Examples

### Flow 1: Initial Creation and First Publish

| Step | Action                   | Result                                                          |
| ---- | ------------------------ | --------------------------------------------------------------- |
| 1    | Create Atlas "Brain"     | Atlas brain-v1.0 (draft)                                        |
| 2    | Upload `IO1.h5ad`        | Concept created (brain, IO1.h5ad, IO); IO1-r1-wip-1 added       |
| 3    | Upload `SD1.h5ad`        | Concept created (brain, SD1.h5ad, SD); SD1-r1-wip-1 added       |
| 4    | Link SD1 to source study | Source study linked (concept already assigned from filename)    |
| 5    | Link SD1 to IO1          | IO1.source_datasets = [SD1] (propagates globally)               |
| 6    | Upload `IO1.h5ad` again  | Same filename → same concept → IO1-r1-wip-2; atlas auto-updated |
| 7    | Publish v1.0             | published_at set on IO1, SD1; draft=false                       |

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

| Step | Action                | Result                                                             |
| ---- | --------------------- | ------------------------------------------------------------------ |
| 1    | Starting state        | brain-v1.0 (published), brain-v2.0-draft (imported SD1 from gen 1) |
| 2    | Create v1.1 from v1.0 | brain-v1.1-draft created (allowed, different generation)           |
| 3    | Upload SD1 to v1.1    | SD1-r2-wip-1 created in gen 1 concept                              |
|      |                       | v1.1 auto-updated (same generation)                                |
|      |                       | v2.0-draft sees "newer version available" (cross-gen, opt-in)      |
|      |                       | v1.0 unchanged (published, frozen)                                 |
| 4    | v2.0 adopts new ver   | v2.0-draft now has SD1-r2-wip-1                                    |

**Key:** Cross-generation updates require explicit opt-in, just like cross-atlas imports.

### Flow 6: Cross-Atlas Import with Opt-in

| Step | Action                   | Result                                                   |
| ---- | ------------------------ | -------------------------------------------------------- |
| 1    | Starting state           | Brain-v1.0 has SD1-r1; Lung-v1.0 imported SD1-r1         |
| 2    | Brain creates v1.1-draft | brain-v1.1-draft has SD1-r1                              |
| 3    | Upload SD1 to Brain v1.1 | SD1-r2-wip-1 created; Brain v1.1 auto-updated            |
|      |                          | Lung still has SD1-r1 (different atlas, opt-in required) |
| 4    | Lung creates v1.1-draft  | lung-v1.1-draft has SD1-r1, sees "newer available"       |
| 5    | Lung adopts new version  | lung-v1.1-draft now has SD1-r2-wip-1                     |

### Flow 7: CAP Annotation Workflow

| Step | Action                            | Result                                        |
| ---- | --------------------------------- | --------------------------------------------- |
| 1    | Atlas dev uploads `cells.h5ad`    | Concept created; cells-r1-wip-1               |
| 2    | CAP downloads cells-r1-wip-1      | Gets file named `cells-r1-wip-1.h5ad`         |
| 3    | CAP annotates locally             | File still named `cells-r1-wip-1.h5ad`        |
| 4    | CAP uploads `cells-r1-wip-1.h5ad` | Suffix stripped → `cells.h5ad` → same concept |
|      |                                   | Creates cells-r1-wip-2                        |
| 5    | Atlas dev downloads r1-wip-2      | Gets CAP's annotations                        |
| 6    | Atlas dev uploads `cells.h5ad`    | Same concept → cells-r1-wip-3                 |

**Key:** CAP uploads with the versioned filename they downloaded; system strips suffix and matches to existing concept.

### Flow 8: Filename Rename with Merge

| Step | Action                                      | Result                                                   |
| ---- | ------------------------------------------- | -------------------------------------------------------- |
| 1    | Upload `brain-cells.h5ad`                   | Concept A created; brain-cells-r1-wip-1                  |
| 2    | Upload `brain-cells.h5ad` again             | Same concept A; brain-cells-r1-wip-2                     |
| 3    | Rename file, upload `neurons.h5ad`          | Concept B created (different filename); neurons-r1-wip-1 |
| 4    | Realize neurons.h5ad is same as brain-cells | User selects "Mark as new version of..."                 |
| 5    | Merge B into A                              | B's file reassigned to A; becomes neurons-r1-wip-3       |
|      |                                             | Concept A's base_filename updated to `neurons.h5ad`      |
|      |                                             | Concept B deleted                                        |
| 6    | Future upload of `neurons.h5ad`             | Matches Concept A (now has base_filename=neurons.h5ad)   |
