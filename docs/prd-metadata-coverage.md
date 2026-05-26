# PRD: Metadata Coverage

**Status:** Draft
**Date:** 2026-05-17
**Related:**

- Design ticket: clevercanary/cc-design#309
- Validator ticket: clevercanary/hca-validation-tools#405
- Persistence ticket: clevercanary/hca-atlas-tracker#1273
- Query API ticket: clevercanary/hca-atlas-tracker#1274

---

## Overview

Add a corpus-wide **Metadata Coverage** view to HCA Atlas Tracker that surfaces how completely metadata is being populated across source datasets and integrated objects. The view answers four questions at a glance: what fields are teams struggling with, what is the overall coverage, which teams are doing best, and how does coverage look on the actual atlases (not just the metadata entry sheets that feed them).

The view is driven by a new per-file `metadata_coverage` payload emitted by the dataset validator. The validator reports record counts per entity class and, for each (entity_class, field) pair, a count of how many instances are complete vs broken down by issue type; the tracker aggregates across files. Per-instance drill-down ("which donors specifically have problems") is handled separately via existing per-row error/warning output, not by this payload.

---

## Problem

### Current state

The tracker has a per-atlas **Metadata Correctness** tab (a green/red grid of studies × metadata fields, grouped by category, with a Required/Recommended toggle). It works against **metadata entry sheets** (Google Sheets that teams fill in), not the actual source dataset or integrated object files. It is also per-atlas only — there is no corpus-wide view.

The top-nav **Metadata** tab is in practice a **Metadata Dictionary** describing the schema. There is no view of how well the corpus conforms to that schema.

### Gaps

- No view of coverage on the source datasets or integrated objects themselves (the actual .h5ad files), only on the entry sheets that describe them.
- No corpus-wide rollup, so it is impossible to answer "which fields are teams across the program struggling with?" or "which networks are doing best?" without manually inspecting each atlas.
- No way to drill from a corpus-level question back to the studies or atlases driving the number.

---

## Goals

A program lead, network lead, or integration lead can answer, in one place:

1. **What metadata fields are teams struggling with?** — sortable, worst-first.
2. **What is our overall coverage?** — corpus-wide KPIs for required and recommended.
3. **Which teams / atlases / networks are doing best?** — rankable by coverage.
4. **How does coverage show up in the actual atlases**, not just the entry sheets?

Scope: **source datasets first**, integrated objects second. Integrated objects arrive late in the atlas lifecycle, so source-dataset coverage is the leading indicator. The component must be generic over entity type so the IO view is a data swap, not a rebuild.

---

## Non-goals (out of scope for v1)

- Time-series / trend views ("coverage over time"). Today's snapshot only.
- Editing or remediation flows from inside the Coverage view. Read-only.
- Renaming or restructuring the existing per-atlas **Metadata Correctness** tab. It keeps its current entry-sheet scope. Possible rename to "Entry Sheet Correctness" is a UX call deferred to design.
- Restructuring `tool_reports.errors` from the validator. Separate, lower-priority improvement.
- Per-row applicability machinery in the validator. Current schemas and corpus do not justify it (HCA is human-only; the one common applicability case — prenatal samples not needing manner_of_death — is handled by accepting empty values). The wire format reserves space for it as an additive change later.

---

## User experience

### New top-level tab

Rename the current top-nav "Metadata" to **Metadata Dictionary** (what it actually is). Add a sibling **Metadata Coverage** tab.

```
Atlases    Reports    Team    Metadata Dictionary    Metadata Coverage
```

### Reuse the faceted-list pattern

The Atlases list page already provides the right primitives: left filter rail, sortable table, Group By, Edit Columns, Download TSV, per-cell drill-downs. The new view reuses that pattern with **metadata fields as rows** by default.

### Three pivots via a segmented control

A segmented control at the top of the page swaps what a row represents: **Fields | Atlases | Networks**.

```
Metadata Coverage              [ Fields | Atlases | Networks ]
─────────────────────────────────────────────────────────────────
Filters │ Results 1–34 of 34            [Group By ▾] [Edit Columns ▾] [Download TSV]
        │
Entity  │  # Field                  Coverage  Datasets pop.  Atlases ≥80%  Worst network
Cat.    │  1 sequenced_fragment       41%       210/508         2/10        Adipose (0%)
Req.    │  2 gene_annotation_ver…    68%       345/508         4/10        Dev (33%)
Network │  3 manner_of_death         71%       361/508         5/10        Lung (40%)
```

Flip to **Atlases** and rows become atlases with columns like Network / Required coverage / Recommended coverage / Worst field. Flip to **Networks** and it rolls up one more level.

The filter rail and drill-down conventions stay the same across pivots. The **default column set** and **default sort** change per pivot because the meaningful metrics differ (Worst network is useful for a field, not for an atlas). Edit Columns still works in each view.

### Filter rail

- **Entity** (Source Dataset / Integrated Object) — promoted to a top-of-page selector alongside the pivot toggle (see Key decisions §4). Defaults to Source Dataset.
- **Category** (Dataset / Donor / Sample) — UI category, not the underlying wire-format entity class. Identifier fields reported at `obs` grain in the wire format are surfaced under the entity they identify (e.g. `obs.donor_id` appears under the Donor category).
- **Requirement** (Required / Recommended)
- **Biological Network** (multi-select)
- **Atlas** (multi-select)
- **Integration Lead** (multi-select)
- **Coverage bucket** (0–25 / 25–50 / 50–75 / 75–100%)

### Row filters vs denominator constraints

The same filter rail is shown in all three pivots, but a given filter behaves in one of two ways depending on whether it matches the current row entity:

- **Row filter** — filter matches the row entity, removes rows from the table. Example: in Atlases pivot, filtering Network = Lung shows only Lung atlases.
- **Denominator constraint** — filter does _not_ match the row entity; instead of removing rows, it shrinks the set of records the coverage percentage is calculated over. Example: in Fields pivot, filtering Network = Lung keeps every field in the table, but each field's coverage is recalculated using only the Lung atlases' source datasets. So manner_of_death might drop from 71% (corpus-wide) to 40% (Lung only).

Coverage is always **complete records / record_count**; a denominator constraint shrinks the record set without changing which rows are listed. This lets a user ask "what fields is my network struggling with?" without leaving the Fields pivot. The dual behavior of a single control should be surfaced visually so users understand why the row count didn't change when they filtered.

### Per-atlas surfacing

Two complementary surfaces:

1. **Deep-link from the Metadata Coverage tab** — filter rail set to one atlas. Shareable URL.
2. **A tab on the atlas itself**, sibling to the existing **Metadata Correctness** tab. The existing tab keeps its role (entry-sheet correctness); the new tab shows source-dataset / integrated-object coverage for that atlas, using the same underlying component.

The per-atlas variant exposes a different pivot set: **Fields | Datasets**. The global tab's Atlases and Networks pivots degenerate at atlas scope (one row each), but a per-dataset leaderboard within the atlas — "which of my source datasets is dragging the score down?" — is uniquely useful in atlas context.

### Cross-linking

- In **Fields** view, "Worst network" / "Best atlas" cells link to **Atlases** / **Networks** view filtered to that field.
- In **Atlases** view, "Worst field" links to **Fields** view filtered to that atlas.
- Dataset counts in either view drill into the existing per-study entry-sheet grid (or the new per-dataset view).

### Header KPI strip

Above the table, a small strip of corpus-wide KPIs respecting current filters:

| Scope               | Required coverage | Recommended coverage | Source datasets 100% required | Atlases 100% required |
| ------------------- | ----------------- | -------------------- | ----------------------------- | --------------------- |
| All source datasets | 81%               | 57%                  | 412/508                       | 4/10                  |

(When Entity = Integrated Object, the third column reads "Integrated objects 100% required" with its own count.)

---

## System architecture

### Data flow

```
.h5ad file in S3 data bucket
  │
  ▼
S3 event → SNS → tracker /api/sns
  │
  ▼
Tracker submits AWS Batch job (existing flow, app/services/validator-batch.ts)
  │
  ▼
Validator container runs against the file:
  - Validates rows against cellxgene-style schema (existing)
  - Emits per-(entity_class, field) complete and issue-type counts (new)
  - Emits record_count per entity class (new)
  │
  ▼
Validator writes results to S3 claim-check bucket (existing)
Validator publishes SNS pointer (existing)
  │
  ▼
Tracker /api/sns fetches results, persists to hat.files:
  - Existing: dataset_info, validation_reports, validation_summary
  - New: metadata_coverage (JSONB)
  │
  ▼
Tracker query API aggregates metadata_coverage across files
  │
  ▼
Frontend Metadata Coverage tab renders pivots, filters, KPIs
```

### Roles and responsibilities

**Validator owns counts.**

- For each entity class (obs / dataset / donor / sample), reports `record_count`.
- For each (entity_class, field) pair, reports `complete` and a count per issue type as sibling keys (`missing`, `inconsistent`). See "Issue types (v0)" for the full table and reserved future types.
- Reports the schema name and version it was built against.

**Tracker owns the field catalog and presentation.**

- Reads field name, title, description, required/recommended tier, entity class, AnnData location, and other per-slot metadata from `catalog/downloaded/data-dictionary.json` (generated from the LinkML schema in hca-validation-tools).
- Aggregates `complete` and `record_count` across files, atlases, and networks.
- Renders pivots, filters, and KPIs.

This split has two consequences worth being explicit about:

1. **The tracker's data dictionary is the canonical field catalog.** The validator does not need to send the catalog, the tier, or any per-field metadata — only counts.
2. **Schema drift is visible by design.** Fields the validator emits coverage for that aren't in the tracker's dictionary indicate the tracker dictionary is out of date. Fields in the dictionary the validator doesn't emit for indicate the validator is out of date. The `schema_version` field anchors which side is ahead.

---

## Data contract: validator → tracker

The validator adds a new top-level `metadata_coverage` key to its existing results payload. Existing keys (`metadata_summary`, `tool_reports`, integrity fields, etc.) remain unchanged.

### Wire format

```jsonc
"metadata_coverage": {
  "schema_name": "tier_1",
  "schema_version": "2.1.0",
  "entities": {
    "obs":     { "record_count": 50000 },
    "dataset": { "record_count": 1 },
    "donor":   { "record_count": 247 },
    "sample":  { "record_count": 18 }
  },
  "field_coverage": [
    { "entity_class": "obs",    "field": "donor_id",                    "complete": 48500, "missing": 1500, "inconsistent": 0 },
    { "entity_class": "obs",    "field": "sample_id",                   "complete": 50000, "missing": 0,    "inconsistent": 0 },
    { "entity_class": "donor",  "field": "sex_ontology_term_id",        "complete": 247,   "missing": 0,    "inconsistent": 0 },
    { "entity_class": "donor",  "field": "manner_of_death",             "complete": 246,   "missing": 1,    "inconsistent": 0 },
    { "entity_class": "donor",  "field": "ethnicity_ontology_term_id",  "complete": 246,   "missing": 0,    "inconsistent": 1 },
    { "entity_class": "sample", "field": "tissue_ontology_term_id",     "complete": 17,    "missing": 1,    "inconsistent": 0 },
    { "entity_class": "sample", "field": "library_preparation_batch",   "complete": 17,    "missing": 1,    "inconsistent": 0 },
    { "entity_class": "sample", "field": "library_sequencing_run",      "complete": 16,    "missing": 0,    "inconsistent": 2 }
  ]
}
```

`library_*` fields appear at `sample` grain because LinkML declares them as `Sample` slots (see "Library is currently a Sample-grain concern").

### Shape semantics

Each `field_coverage` entry summarises one `(entity_class, field)` pair. For every entry, the validator MUST emit a count such that:

```
complete + missing + inconsistent == entities[entity_class].record_count
```

(With future issue types — see "Issue types (v0)" — each joins as another additive sibling term.)

This invariant makes the tracker's ingest a hard validator of payload integrity (mismatch → reject the blob, surface as a validator bug, not a silent miscount) and removes any ambiguity about whether an unreported field is "all complete" or "not checked." The validator emits an entry for every field it knows about for that entity class, including fields that came out 100% complete (all issue counts zero).

Per-instance evidence (which donors specifically had issues) is intentionally absent from this summary. The existing `tool_reports` already carries per-row error/warning strings; per-instance drill-down is a separate concern handled there, not by inflating this payload.

### Reporting grain: identifier fields live at obs grain

Fields fall into two grains depending on what they describe:

- **Identifier fields** (`donor_id`, `sample_id`, `library_id`, …) link a cell _to_ an entity instance. They are reported at `entity_class = "obs"`, with `entities.obs.record_count` as the denominator (total cells in the file). A missing `donor_id` cell is an issue on `obs.donor_id`, not on any donor — it is by definition not attributable to a donor.
- **Entity-property fields** (`donor.sex_ontology_term_id`, `sample.tissue_ontology_term_id`, `sample.library_preparation_batch`, …) describe an entity instance. They are reported at the entity grain, with `entities.<class>.record_count` as the denominator (distinct entity instances detected in the file). `entities.donor.record_count` only counts cells that carried a parseable `donor_id` — cells without one don't participate in donor-level coverage.

Consequence: the no-donor-id case falls out cleanly. Cells with a missing `donor_id` show up exactly once, under `obs.donor_id.missing`. They do not inflate the donor count and do not silently inflate donor-level field completeness.

### Entity classes are LinkML classes

The wire format's `entity_class` maps directly from LinkML class membership. The LinkML schema (`shared/src/hca_validation/schema/`) already specifies, for each metadata slot, both:

- The class it belongs to (`Donor`, `Sample`, `Cell`, `Dataset`).
- Its `annDataLocation` annotation (`obs`, `uns`, `var`).

The validator reads both. Entity grain is the LinkML class name (lowercased); the AnnData location tells the validator where to read values from for the groupby. The validator does not invent a parallel "coverage entity class" annotation, and the tracker does not re-derive grain from field names.

The one addition the wire format makes is **`obs` as an entity class for identifier slots**. A slot like `donor_id` belongs to the `Donor` (or `Sample`) LinkML class but reporting it at donor grain would be circular ("how many donors have a donor_id?"). Identifier slots report at `entity_class = "obs"` with `entities.obs.record_count` as the denominator. The validator identifies a slot as an identifier by checking `identifier: true` in the LinkML class's `slot_usage` (e.g. `sample_id` for the `Sample` class in `sample.yaml:53–60`).

Entity classes emitted in v0:

- `obs` — total cell rows. Always emitted.
- `dataset`, `donor`, `sample`, `cell` — one entry per LinkML class, when fields from that class exist in the file. Record count = distinct identifier values for entity classes that have one; 1 for `Dataset`-class slots stored in `uns`.

### Library is currently a Sample-grain concern

`library_id`, `library_preparation_batch`, `library_sequencing_run`, and `library_id_repository` are declared as slots of the `Sample` LinkML class (`sample.yaml:37–40,149,179,194`). In v0, by the rule above, they report at `entity_class = "sample"`:

- "How many samples have a library_preparation_batch?" (denominator: distinct `sample_id` values)
- "How many samples have inconsistent library_sequencing_run across their cells?"

This is workable but slightly off from the question atlas teams probably want answered, which is "how many _libraries_ have a preparation batch." Two samples that share a library would have two copies of the same value, and inconsistency would only catch within-sample disagreement — not cross-sample disagreement for cells of the same library.

**To promote library to a peer entity class, LinkML needs a `Library` class** with `library_id` as identifier and the `library_*` slots migrated to it. That is a schema evolution out of scope for the coverage v0 ticket; the wire format already supports it — once the LinkML class exists, the validator emits `entity_class = "library"` mechanically. Tracked as a follow-up.

### Why a `(entity_class, field)` summary instead of per-issue records

An earlier draft of this contract emitted a flat `issues: [{entity_class, entity_id, field, type}, …]` list and asked the tracker to derive completeness as `record_count − distinct(entity_id) with issues`. Two problems pushed us off it:

1. **Headline numbers required derivation.** Answering "of 247 donors, how many had a sex inconsistency vs missing entirely" required deduping and counting issue records. The summary form answers it directly.
2. **Payload size grew with bad data.** Identifier fields at obs grain (e.g. 1500 cells missing `donor_id`) produced 1500 issue records per file. The summary form is `O(entity_classes × fields)` — bounded by the schema, not by data quality.

A single populated count would have failed the original requirement: it couldn't distinguish a donor with metadata correctly denormalized across 5000 cells from one with metadata on 4500 of 5000 cells (partial denormalization), nor from one with conflicting values across cells (broken denormalization). The summary form preserves that distinction by breaking out issue _types_, which is the information the UI actually wants for "what kind of problem is this team having."

### Issue types (v0)

| Type            | v0?      | Meaning                                                                                                                                        |
| --------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `missing`       | ✓        | The field is not populated for some or all of this entity instance's obs rows (or, at obs grain, for some cells).                              |
| `inconsistent`  | ✓        | The field has multiple distinct non-null values across obs rows of this entity instance (denormalization broken). Not applicable at obs grain. |
| `invalid_value` | deferred | The field has a value that fails schema validation (wrong ontology, malformed CURIE, etc.). See Open follow-ups.                               |

v0 ships `missing` and `inconsistent` only. The validator's existing error mechanism reports invalid values per _distinct bad value_, not per row, so attributing an `invalid_value` to a specific donor or sample requires either fragile string parsing of the existing error output or a parallel value-check pass in the coverage module. Both have costs that don't pay off for v0; ontology-violating values are already surfaced in `tool_reports`, just not rolled up here.

Consequence for v0: a donor whose _only_ problem is an ontology-violating value (e.g. `ethnicity_ontology_term_id = "EFO:9999999"`, well-formed but not a real ontology term) counts as `complete` in coverage. Coverage in v0 measures "is this metadata populated and self-consistent across cells?" not "is the value valid against ontologies." Acceptable for the corpus-wide rollup at this stage; ontology-membership errors still surface per-file in existing validator output.

The wire format reserves `invalid_value` (and other future types) as an additive change — adding it later does not break v0 consumers.

An entity instance contributes to _at most one_ bucket per field: either `complete`, or counted under exactly one issue type. When multiple issue types apply to the same (entity instance, field), the validator picks the most informative one. The reserved full precedence is `invalid_value > inconsistent > missing`; in v0 only the latter two are active, so the effective precedence is `inconsistent > missing`. This keeps the invariant `complete + missing + inconsistent == record_count` clean regardless of how many types are active.

### Why entity-class grain, not raw AnnData component grain

The validator runs on AnnData files where donor- and sample-level metadata is denormalized across obs rows (each cell row carries its donor's manner_of_death, its sample's tissue, etc.). Reporting per-cell populated counts on those fields would be the wrong denominator — the meaningful unit is "how many donors have it populated," not "how many cell rows have it populated."

The LinkML classes (`Donor`, `Sample`, `Cell`, `Dataset`) are core HCA domain concepts already used throughout the tracker. The validator does the per-donor / per-sample grouping (only it has the rows) and reports at the LinkML class's grain directly, rather than dumping raw `obs` / `uns` / `var` populated counts and asking the tracker to re-derive groupings. See "Entity classes are LinkML classes" above for the exact mapping.

### Required vs recommended

Validation errors traditionally fire only on **required** fields. If we derived coverage purely from validation errors, recommended fields with 0% population would show 100% complete (no errors fire when an optional thing is missing), contradicting the design intent.

**Resolution:** the validator emits `missing` issues for recommended fields too, not just required. The tier (required / recommended) is looked up by the tracker from the data dictionary, which decides whether to render as error, warning, or info. This keeps the validator mechanism uniform and gives the tracker presentation flexibility.

### Schema versioning

The `schema_name` + `schema_version` fields anchor the report to a specific schema version, so the tracker can reconcile when fields are added, removed, or renamed between validator releases. When aggregating, the tracker surfaces a warning summary ("N files were validated against an older schema") rather than silently excluding divergent files.

### Per-row applicability (deferred)

Current schemas and corpus do not have meaningful per-row applicability variation:

- HCA is human-only, so species-gated conditional rules in the cellxgene rule language do not fire differently across the corpus.
- The one common applicability case — prenatal samples not needing `manner_of_death` — is handled in the schema by allowing empty values.

If future schemas introduce per-row applicability (multi-species atlases, etc.), the wire format can be extended with an optional `applicable_record_count` per (entity_class, field). Data without it reads as `applicable_record_count = record_count`, so the change is additive and non-breaking.

---

## Tracker storage

### Schema

Add a nullable JSONB column on `hat.files`:

```sql
ALTER TABLE hat.files ADD COLUMN metadata_coverage JSONB NULL;
```

Migration follows the existing `node-pg-migrate` TypeScript pattern in `migrations/`.

### Ingest

Extend `processValidationResultsMessage` in `app/services/validation-results-notification.ts` to read `metadata_coverage` from the validator results payload and pass it through `addValidationResultsToFile` (`app/data/files.ts`) for persistence. Absent / null is acceptable — files validated before the contract change keep `metadata_coverage = null` and are excluded from aggregations.

Store whatever the validator sent verbatim, including `schema_name` and `schema_version`. Drift reconciliation is the query layer's job, not the ingest layer's.

### Type definitions

Add `HCAAtlasTrackerDBFileMetadataCoverage` to `app/apis/catalog/hca-atlas-tracker/common/entities.ts` mirroring the validator contract, and extend the AWS schema (`app/apis/catalog/hca-atlas-tracker/aws/schemas.ts:71`) with an optional `metadata_coverage` field on `datasetValidatorResultsSchema`.

### Why JSONB and not a normalized table

At expected corpus scale (~500 files × ~120 field_coverage entries per file = ~60k rows corpus-wide post-fan-out), JSONB scans are fast enough that the cost of maintaining a normalized derived table is not yet justified. Migrating to a normalized table or materialized view is the natural next step **if** corpus growth or query complexity pushes back; the trigger condition should be measured, not assumed.

Day-one optimizations: rely on existing `is_latest` index, add a partial index on `file_type IN ('source_dataset', 'integrated_object')` if profiling shows the scan is meaningful.

---

## Tracker query layer

### Aggregation strategy: app-side TypeScript

Pull the relevant `metadata_coverage` JSONB blobs from `hat.files` (filtered by `is_latest`, file_type, and the scope filters), then aggregate in TypeScript service code. Rationale:

- At ~500 files × ~5–10 KB of JSON each, latency is dominated by the DB round-trip, not the math.
- The design still has open decisions (per-atlas pivot set, sentinel-value handling, etc.). TypeScript aggregation is easier to evolve than SQL `jsonb_path_query` aggregations or a normalized-table schema that has to be re-migrated.
- A single fetch + a single in-memory aggregation pass can produce all four output shapes (fields, atlases, networks, KPIs) for a request — frontend asks for what it needs.

### Service layer (`app/services/metadata-coverage.ts`, new)

Functions:

- `getFieldCoverage(filters)` → rows of `{ field, entityClass, category, required, complete, recordCount, datasetCount, atlasesAtThreshold, worstNetwork }` — backs the Fields pivot.
- `getAtlasCoverage(filters)` → rows of `{ atlasId, network, requiredCoverage, recommendedCoverage, worstField }` — backs the Atlases pivot.
- `getNetworkCoverage(filters)` → rolled up one more level — backs the Networks pivot.
- `getCoverageKpis(filters)` → header strip data.

All four share a single base fetch and aggregation pass when called from the same request.

### Filter behavior

The same filter inputs need to behave as **row filters** when they match the requested pivot (Atlas filter in Atlases pivot removes rows) and as **denominator constraints** when they don't (Atlas filter in Fields pivot scopes which files contribute to each field's coverage). See User Experience > Row filters vs denominator constraints.

### Schema-version reconciliation

When aggregating, count files whose blob `schema_version` differs from the tracker's current `data-dictionary.json` version. Surface as `schemaVersionWarnings` on the response so the frontend can render a small "N files were validated against an older schema" banner. Do not silently exclude.

### API endpoints

Three endpoints under `pages/api/metadata-coverage/`, all GET, all `registeredUser`:

- `GET /api/metadata-coverage/fields?entity=...&network=...&atlas=...&...`
- `GET /api/metadata-coverage/atlases?entity=...&network=...&...`
- `GET /api/metadata-coverage/networks?entity=...&...`

Each response includes the KPI strip data alongside the pivot rows so the header doesn't need a separate round-trip.

Follows the existing handler pattern (`app/utils/api-handler.ts`): method guard, role check, service call, JSON response.

---

## Key design decisions

### 1. Coverage denominator

When a row reads "manner_of_death — 71%", what is 71% of?

Resolved: **the validator emits `complete` and `issues` counts per (entity_class, field).** Coverage = `complete / record_count` for that entity class. Each entity instance is bucketed exactly once: into `complete`, or into exactly one issue type. Reserved precedence is `invalid_value > inconsistent > missing`; v0 ships with `inconsistent > missing` (the upper type is deferred — see Open follow-ups).

This subsumes the prior "cell-level vs record-level" question. Missing rows, partial denormalization, value disagreement, and ontology violations all flow through one mechanism. A single populated count would have hidden the partial-denormalization case (donor with metadata on 4500 of 5000 cells looks the same as donor with metadata on all 5000); breaking out issue _types_ distinguishes them. Identifier fields like `donor_id` are reported at obs grain (denominator = total cells), so the no-donor-id case is captured without inflating donor-level counts.

### 2. Per-atlas surfacing

Resolved: **both** an atlas tab and a deep-link from the global Coverage tab. Marginal cost is low (shared component, one extra route). Pair with a possible rename of the existing per-atlas Metadata Correctness tab to "Entry Sheet Correctness" so the distinction between "entry sheet was filled" and "the actual datasets have the metadata" is unambiguous in the nav.

### 3. Atlas-level pivots

Resolved: **Fields + Datasets** segmented control on the per-atlas variant (vs the three-way Fields/Atlases/Networks on the global tab). The global tab's Atlases and Networks pivots degenerate at atlas scope, but a per-dataset leaderboard answers a genuinely different question ("which of my source datasets is dragging the score down?").

### 4. Source-dataset vs integrated-object visibility

Resolved: **top-of-page selector** alongside the Fields/Atlases/Networks segmented control, defaulting to Source Dataset. Entity is not really a filter (different fields exist on each, different records aggregate); promoting it visually signals that it changes the entire view.

When Integrated Object is selected and the corpus is mostly empty (which it will be at launch — IOs arrive late), surface a small banner ("5 of 29 atlases have integrated objects so far") so the emptiness reads as "early in the lifecycle" rather than "the page is broken."

### 5. Where the field catalog lives

Resolved: **tracker owns the catalog, validator owns counts.**

The tracker's `data-dictionary.json` is generated from the LinkML schema in hca-validation-tools (`shared/src/hca_validation/schema/`) and already carries every per-slot attribute the UI needs (title, description, required flag, entity class, AnnData location). The validator does not echo any of this — it just emits `record_count` and `field_coverage` counts. Schema drift is visible by design.

### 6. Bucketing in the wire format

Resolved: **LinkML class membership is the entity grain.** The schema already specifies, per slot, both the owning class (`Donor`, `Sample`, `Cell`, `Dataset`) and the `annDataLocation`. The validator reads both and emits `entity_class = <linkml_class>.lower()`. No parallel "coverage entity class" annotation is needed. Identifier slots (those with `identifier: true` in `slot_usage`) are the one special case: they report at a synthetic `obs` grain to avoid the circular "how many donors have a donor_id?" framing.

Consequence: adding an entity class to coverage is mechanically driven by adding a class in LinkML. Conversely, anything LinkML models as a slot of `Sample` reports at sample grain in v0 — including the `library_*` slots that arguably describe a library. Promoting library to a peer entity is tracked as a follow-up that requires a `Library` LinkML class.

### 7. Required vs recommended in issues

Resolved: **validator emits `missing` issues for recommended fields too,** not just required. The tier is looked up by the tracker from the dictionary. Keeps the validator mechanism uniform; gives the tracker presentation flexibility (error / warning / info).

---

## Open follow-ups

These do not block v1 but should be tracked.

### Sentinel values

Several slots accept `na` / `unknown` / `not applicable` as valid enum values that effectively mean "field doesn't really apply here." Today these count as `complete` (the value is non-null). At current corpus scope this affects a small fraction of records. Ship v0 without addressing; revisit once the coverage view is live and we can measure the impact. Possible resolutions: validator buckets configured sentinel values under `missing`; or tracker post-processes counts using a sentinel-value list from the dictionary.

### Issue type surfacing in the UI

V0 treats all issue types uniformly as "not complete." Future enhancement: drill-down view that distinguishes `missing` from `inconsistent` from `invalid_value`, since they imply different remediation paths.

### `invalid_value` at entity grain

V0 emits `missing` and `inconsistent` only. The upstream cellxgene validator and the HCA validator both report invalid values per _distinct bad value_, not per row (see `cellxgene_schema_cli/cellxgene_schema/validate.py:746,764` — iteration is over `column.drop_duplicates()`), and they emit flat error strings rather than structured `(row, column, value)` records. Attributing an invalid value to a specific donor/sample requires either fragile string parsing or refactoring the upstream validator to expose per-row attribution.

Promote `invalid_value` to entity grain once one of these lands:

1. Upstream validator refactored to expose structured per-row failures (preferred; benefits all consumers).
2. Coverage module does its own schema-driven value check (enum membership, CURIE pattern) — catches malformed values but not ontology-membership errors. Smaller-scope alternative.

Until then, ontology-violating values surface only in `tool_reports`, not in the coverage rollup.

### Per-row applicability

If future schemas introduce per-row applicability rules (multi-species atlases, etc.), the wire format can be extended with `applicable_record_count` per (entity_class, field). Currently deferred — see Data contract > Per-row applicability.

### Inconsistency vs incompleteness in coverage scoring

A donor with conflicting values across its cells (`ethnicity = "European"` on some, `"Asian"` on others) is bucketed as `inconsistent` — a separate count from `missing` in the wire format. The **headline coverage percentage** in v1 (`complete / record_count`) treats both as "not complete" and rolls them together; the distinction is preserved in the underlying counts but not surfaced in the top-line number. Whether to expose it in scoring (e.g. a "complete but inconsistent" third state, or a separate inconsistency KPI) is a design call deferred to a follow-up. The data is there when the UI is ready for it.

### Promote `library` to a peer entity class in LinkML

In v0, `library_id`, `library_preparation_batch`, `library_sequencing_run`, and `library_id_repository` are slots of the `Sample` LinkML class (`shared/src/hca_validation/schema/sample.yaml:37–40,149,179,194`) and so coverage reports them at sample grain. Atlas teams probably want them rolled up at _library_ grain (denominator: distinct `library_id` values), especially when multiple samples share a library — sample-grain inconsistency checks only catch within-sample disagreement, not cross-sample disagreement for cells of the same library.

Resolution: add a `Library` class to LinkML with `library_id` as identifier and migrate the `library_*` slots to it. The wire format already supports it — once the LinkML class exists, the validator emits `entity_class = "library"` mechanically without contract changes. The migration is additive on the tracker side (a new entity class appears in aggregations, existing fields move from Sample to Library).

### Normalized derived storage

If corpus grows past ~5000 files or query patterns add complexity (cross-atlas time series, per-team rankings with many dimensions), revisit JSONB + app-side aggregation in favor of a normalized derived table or materialized view. Trigger condition: measured.

---

## Glossary

- **Source dataset** — A file under `source-datasets/` in S3 (file_type = `source_dataset`). One .h5ad file per dataset.
- **Integrated object** — A file under `integrated-objects/` in S3 (file_type = `integrated_object`). Combines multiple source datasets.
- **Entry sheet** — Google Sheet that an atlas team fills in to describe a source study. Validated separately; powers the existing per-atlas Metadata Correctness tab.
- **Entity class** — In v0: `obs`, `dataset`, `donor`, `sample`, `cell`. Each corresponds to a LinkML class (lowercased), except `obs` which is a synthetic class for identifier-grain fields. Entity-property fields live at their LinkML class's grain (e.g. `donor.sex_ontology_term_id`); identifier fields live at `obs` grain (e.g. `obs.donor_id`). Adding a class to LinkML adds an entity class to the wire format mechanically.
- **Issue type** — A category of metadata problem (`missing`, `inconsistent`, `invalid_value`, …) reported by the validator as a sibling count on each `field_coverage` entry. The validator buckets each entity instance into at most one issue type per field (highest-precedence wins).
- **Complete** — A given (entity instance, field) is complete iff the validator did not bucket it into any issue type. Equivalently, `complete = record_count − (missing + inconsistent + …)` for that field.
- **Coverage** — For a given field within a scope (corpus / atlas / network): the fraction of applicable entity instances that are complete for the field.
- **Row filter / Denominator constraint** — A filter is a row filter when it matches the current pivot's row entity (and so removes rows); it's a denominator constraint when it doesn't match (and so scopes the records the coverage percentage is calculated over).
- **Pivot** — Fields / Atlases / Networks selector that swaps what each row in the table represents.
- **Schema version** — `(schema_name, schema_version)` reported by the validator, used to detect drift against the tracker's data dictionary.

---

## Appendix: example payloads

### Source dataset with one missing donor field

```jsonc
{
  "metadata_coverage": {
    "schema_name": "tier_1",
    "schema_version": "2.1.0",
    "entities": {
      "obs": { "record_count": 36000 },
      "dataset": { "record_count": 1 },
      "donor": { "record_count": 12 },
      "sample": { "record_count": 3 },
    },
    "field_coverage": [
      {
        "entity_class": "obs",
        "field": "donor_id",
        "complete": 36000,
        "missing": 0,
        "inconsistent": 0,
      },
      {
        "entity_class": "donor",
        "field": "manner_of_death",
        "complete": 11,
        "missing": 1,
        "inconsistent": 0,
      },
      {
        "entity_class": "donor",
        "field": "sex_ontology_term_id",
        "complete": 12,
        "missing": 0,
        "inconsistent": 0,
      },
      {
        "entity_class": "sample",
        "field": "tissue_ontology_term_id",
        "complete": 3,
        "missing": 0,
        "inconsistent": 0,
      },
    ],
  },
}
```

Coverage derived by tracker for this file:

- `donor.manner_of_death`: 11/12 complete.
- All other listed fields: 100% for their entity class.

### Source dataset with denormalization issue

```jsonc
{
  "metadata_coverage": {
    "schema_name": "tier_1",
    "schema_version": "2.1.0",
    "entities": {
      "obs": { "record_count": 1235000 },
      "dataset": { "record_count": 1 },
      "donor": { "record_count": 247 },
    },
    "field_coverage": [
      {
        "entity_class": "obs",
        "field": "donor_id",
        "complete": 1235000,
        "missing": 0,
        "inconsistent": 0,
      },
      {
        "entity_class": "donor",
        "field": "ethnicity_ontology_term_id",
        "complete": 246,
        "missing": 0,
        "inconsistent": 1,
      },
    ],
  },
}
```

Coverage derived by tracker:

- `donor.ethnicity_ontology_term_id`: 246/247 complete. D17 was tagged `inconsistent` (its 5000 obs rows carry conflicting ethnicity values) and counts once.

### Source dataset with cells missing their donor_id

```jsonc
{
  "metadata_coverage": {
    "schema_name": "tier_1",
    "schema_version": "2.1.0",
    "entities": {
      "obs": { "record_count": 50000 },
      "dataset": { "record_count": 1 },
      "donor": { "record_count": 247 },
      "sample": { "record_count": 18 },
    },
    "field_coverage": [
      {
        "entity_class": "obs",
        "field": "donor_id",
        "complete": 48500,
        "missing": 1500,
        "inconsistent": 0,
      },
      {
        "entity_class": "donor",
        "field": "sex_ontology_term_id",
        "complete": 247,
        "missing": 0,
        "inconsistent": 0,
      },
    ],
  },
}
```

Coverage derived by tracker:

- `obs.donor_id`: 48500/50000 cells have a donor_id. 1500 orphan cells reported once, at obs grain.
- `donor.sex_ontology_term_id`: 247/247 — the 247 donors detected (i.e. the donors that the 48500 attributable cells map to) all have sex populated. Orphan cells don't deflate this number.

### Source dataset with library-related fields (reported at Sample grain)

```jsonc
{
  "metadata_coverage": {
    "schema_name": "tier_1",
    "schema_version": "2.1.0",
    "entities": {
      "obs": { "record_count": 50000 },
      "dataset": { "record_count": 1 },
      "donor": { "record_count": 12 },
      "sample": { "record_count": 18 },
    },
    "field_coverage": [
      {
        "entity_class": "obs",
        "field": "library_id",
        "complete": 50000,
        "missing": 0,
        "inconsistent": 0,
      },
      {
        "entity_class": "sample",
        "field": "library_preparation_batch",
        "complete": 18,
        "missing": 0,
        "inconsistent": 0,
      },
      {
        "entity_class": "sample",
        "field": "library_sequencing_run",
        "complete": 16,
        "missing": 0,
        "inconsistent": 2,
      },
      {
        "entity_class": "sample",
        "field": "library_id_repository",
        "complete": 12,
        "missing": 6,
        "inconsistent": 0,
      },
    ],
  },
}
```

Coverage derived by tracker:

- `sample.library_sequencing_run`: 16/18 complete. Two samples had cells with disagreeing sequencing-run values — denormalization broken within those samples.
- `sample.library_id_repository`: 12/18 complete; 6 samples had no repository ID at all (recommended field).

Caveat (see "Library is currently a Sample-grain concern"): these counts are at sample grain because LinkML declares the slots under `Sample`. If two samples share the same library, this view can't catch cross-sample disagreement for that library. Promoting library to a peer entity requires adding a `Library` class in LinkML — tracked as a follow-up.

### Fields-pivot API response (sketch)

```jsonc
GET /api/metadata-coverage/fields?entity=source_dataset&network=lung
{
  "kpis": {
    "scope": "Lung — source datasets",
    "requiredCoverage": 0.71,
    "recommendedCoverage": 0.48,
    "sourceDatasetsComplete": 62,
    "sourceDatasetsTotal": 87,
    "atlasesComplete": 1,
    "atlasesTotal": 3
  },
  "rows": [
    {
      "field": "manner_of_death",
      "entityClass": "donor",
      "category": "Donor",
      "required": true,
      "complete": 1438,
      "recordCount": 2020,
      "coverage": 0.71,
      "datasetsPopulated": 64,
      "datasetsTotal": 87,
      "atlasesAtThreshold": 1,
      "worstAtlas": { "name": "Lung v3", "coverage": 0.40 }
    }
  ],
  "schemaVersionWarnings": {
    "filesOnOlderSchema": 3,
    "currentSchemaVersion": "2.1.0"
  }
}
```
