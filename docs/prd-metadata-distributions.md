# PRD: Metadata Distributions

Status: Draft
Date: 2026-05-19
Related:

- Sibling PRD: [`prd-metadata-coverage.md`](./prd-metadata-coverage.md) — completeness counts
- Validator emission ticket (to file): clevercanary/hca-validation-tools#TBD
- Tracker persistence ticket (to file): clevercanary/hca-atlas-tracker#TBD
- Tracker query API ticket (to file): clevercanary/hca-atlas-tracker#TBD
- Frontend rendering ticket (to file): clevercanary/hca-atlas-tracker#TBD

---

## Overview

Add a per-file `metadata_distributions` payload — emitted by the dataset validator alongside `metadata_coverage` — that summarises how categorical metadata values are distributed across the appropriate entity grain. The tracker persists, aggregates, and renders these distributions as graphical breakdowns on each file's detail page and on a corpus-wide "Metadata Distributions" view (sibling to "Metadata Coverage").

Where Metadata Coverage answers "is this field populated and self-consistent," Metadata Distributions answers "what values does it take, and in what proportion." Both flow through the same producer (validator) → claim-check → tracker pipeline.

---

## Problem

### Current state

Per-file metadata is currently visible to wranglers only as raw column values inside the h5ad (via skill tools or ad-hoc Python) or, post-validation, as `metadata_summary.assay` / `.suspension_type` / `.tissue` / `.disease` — flat unique-value lists with no counts. No graphical view exists; corpus-wide distributional views do not exist at all.

### Gaps

- A wrangler can't see at a glance "this dataset is 80% male donors, 20% female" without writing a query against the h5ad.
- A program lead can't see "across all source datasets, what's the sex / tissue / assay distribution of the corpus" without aggregating manually.
- An atlas lead can't compare two source datasets' demographic or technical profiles side-by-side.
- The existing `metadata_summary.assay` / `.tissue` / `.disease` arrays carry distinct values but no proportions; useful for filtering, useless for shape.

---

## Goals

A wrangler, atlas lead, or program lead can answer, on a given file:

1. What is the donor sex distribution?
2. What tissues / tissue types are represented and in what proportion?
3. What assay technologies are used, and how mixed is the file?
4. What sample preservation / source / condition distributions are present?
5. What's the donor age (development-stage) distribution?

And on the corpus (sibling to Metadata Coverage):

6. Across all source datasets, what's the corpus-wide sex / tissue / assay / disease distribution?
7. Same questions, scoped to a single bionetwork or atlas via the same filter rail.

Scope: source datasets first, integrated objects second. Component generic enough that switching entity is a data swap, not a rebuild — same pattern as Metadata Coverage.

---

## Non-goals (out of scope for v1)

- Cell-type histograms (CL ontology) — deferred. Files often carry multiple CAP annotation sets with no canonical "primary"; designating one is a curator workflow that needs its own design pass. v1 emits a `available_cellannotation_sets` candidates list so the tracker can later add a curator picker. See "Cell-type distributions (deferred)" below.
- Self-reported ethnicity — intentionally excluded. Not appropriate for graphical surfacing in this view.
- Continuous-variable distributions (e.g. age in years, cell counts per sample) as histograms — v1 is categorical only. A separate ticket can add numeric-binning if and when needed.
- Time-series or change-over-time views.
- Editing or remediation from inside the view (read-only).
- Per-cell drill-down ("which cells specifically have value X"). The validator already exposes per-row tooling via `tool_reports`; this view is a rolled-up summary.

---

## User experience

### Per-file display

On the source-dataset detail page and the integrated-object detail page, add a new "Metadata Distributions" panel (sibling to the existing validation reports panel). Renders one small chart per emitted field — donut for ≤4 buckets, horizontal bar for >4 — sorted descending by count. Each chart labelled with field title (from the data dictionary) and entity grain (e.g. "Sex — 20 donors", "Assay — 50000 cells").

Distributions with very many buckets (e.g. `tissue_ontology_term_id` on a multi-tissue file) collapse to a top-N + "other" beyond a threshold; user can expand.

### Corpus-wide view

New top-level tab "Metadata Distributions", sibling to "Metadata Coverage". Reuses the same faceted-list pattern:

- Entity selector (Source Dataset / Integrated Object) at top, defaulting to Source Dataset.
- Filter rail: Entity / Network / Atlas / Integration Lead — same as Metadata Coverage.
- Page body: one chart per field, each rendering the aggregated distribution across files matching the current filter scope.

Filter behaviour matches Metadata Coverage: a filter that matches the row entity removes rows; a filter that doesn't (e.g. Network=Lung when viewing per-field) shrinks the denominator. Aggregation rules see "Aggregation semantics" below.

### Cross-link with Metadata Coverage

A field that's surfaced in both views (e.g. `sex_ontology_term_id`) should link from the Coverage view's row to the same field's Distribution view, and vice versa. Same field-name parameter on both URLs.

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
Tracker submits AWS Batch job (existing flow)
  │
  ▼
Validator container runs against the file:
  - Validates rows (existing)
  - Emits metadata_coverage (existing, PR #406)
  - Emits metadata_distributions (NEW)
  │
  ▼
Validator writes results to S3 claim-check bucket (existing)
Validator publishes SNS pointer (existing)
  │
  ▼
Tracker /api/sns fetches results, persists to hat.files:
  - New column: metadata_distributions JSONB
  │
  ▼
Tracker query API aggregates metadata_distributions across files
  │
  ▼
Frontend renders per-file panel + corpus-wide tab
```

### Roles and responsibilities

Validator owns counts. For each emitted field, the validator:

- Reads values from `obs` (or `uns` for dataset-grain slots).
- Buckets at the entity grain owned by the LinkML class (donor / sample / dataset).
- Emits `{value → count}` maps.
- Reports the schema name and version, same as `metadata_coverage`.

Tracker owns field metadata and presentation. The tracker's `data-dictionary.json` carries the title, description, and ontology hint for each field. The wire format does not echo any of this — values are raw ontology term IDs or enum members; the tracker resolves them to human labels at render time using `cellxgene-ontology-guide` or the dictionary.

---

## Data contract: validator → tracker

The validator adds a new top-level `metadata_distributions` key to its results payload. Existing keys (`metadata_summary`, `tool_reports`, `metadata_coverage`, integrity fields) remain unchanged.

### Wire format

```jsonc
"metadata_distributions": {
  "schema_name": "tier_1",
  "schema_version": "0.1.0",
  "fields": [
    {
      "entity_class": "donor",
      "field": "sex_ontology_term_id",
      "record_count": 20,
      "buckets": {
        "PATO:0000383": 12,
        "PATO:0000384": 8
      }
    },
    {
      "entity_class": "sample",
      "field": "suspension_type",
      "record_count": 18,
      "buckets": {
        "cell": 14,
        "nucleus": 4
      }
    },
    {
      "entity_class": "donor",
      "field": "disease_ontology_term_id",
      "record_count": 20,
      "buckets": {
        "MONDO:0005010": 7,
        "PATO:0000461": 13
      }
    },
    {
      "entity_class": "dataset",
      "field": "assay_ontology_term_id",
      "record_count": 1,
      "buckets": {
        "EFO:0009922": 1
      }
    }
  ],
  "cellannotation_sets": []
}
```

### Shape semantics

Per emitted field:

- `entity_class` — same vocabulary as `metadata_coverage` (`donor`, `sample`, `dataset`, `obs`). Whichever grain the LinkML class owning the slot reports at; for obs-stored slots on the Dataset class (e.g. `assay_ontology_term_id`), the validator collapses to one bucket per distinct value across all cells.
- `record_count` — total entity instances with a non-null, populated value for the field. Same denominator the file-grain Metadata Coverage uses for `complete`. Excludes empty-string / whitespace sentinels, consistent with the coverage payload's normalisation rule.
- `buckets` — `{value → count}` where `sum(buckets.values()) == record_count`. Empty / whitespace values do not appear as buckets (they're already excluded from `record_count`).
- Buckets are NOT pre-resolved to human labels. The tracker resolves ontology term IDs (CL/EFO/MONDO/etc.) to labels using the same ontology-guide path used elsewhere in the tracker.

For obs-grain fields like `assay_ontology_term_id` that are LinkML-class-owned by Dataset but stored per-cell:

- `entity_class` is `dataset` (per the LinkML rule established in Metadata Coverage).
- `record_count` is 1.
- `buckets` shows the distinct values found across all cells, each weighted by cell count. The "1 dataset" denominator means proportions don't make sense at file grain — buckets here are useful primarily for the corpus aggregation, where each file contributes one weighted vote per assay.

Actually, for fields like `assay_ontology_term_id` where the values are denormalised across cells, two equally valid grains exist:

1. Dataset grain: 1 record, buckets summarise "what assays this dataset uses." Loses cell-count weighting.
2. Cell grain (obs): N cells, buckets summarise "how many cells from each assay." Preserves weighting.

v1 emits **both**, distinguished by `entity_class`. The corpus view chooses based on the field. See "Open follow-up: cell-grain vs dataset-grain for obs-denormalised fields" below.

### Fields emitted in v1

| Field                                | LinkML grain  | Why include                                         |
| ------------------------------------ | ------------- | --------------------------------------------------- |
| `sex_ontology_term_id`               | donor         | Low cardinality, high program signal                |
| `manner_of_death`                    | donor         | Hardy scale enum                                    |
| `development_stage_ontology_term_id` | donor         | HsapDv ontology                                     |
| `disease_ontology_term_id`           | donor         | MONDO ontology                                      |
| `tissue_ontology_term_id`            | sample        | UBERON ontology                                     |
| `tissue_type`                        | sample        | Small enum (tissue/cell culture/organoid/cell line) |
| `suspension_type`                    | sample        | Binary, important                                   |
| `sampled_site_condition`             | sample        | Small enum                                          |
| `sample_preservation_method`         | sample        | Small enum                                          |
| `sample_source`                      | sample        | Small enum                                          |
| `cell_enrichment`                    | sample        | Method enum                                         |
| `assay_ontology_term_id`             | dataset + obs | EFO ontology; both grains emitted                   |
| `reference_genome`                   | dataset       | Small enum                                          |
| `sequenced_fragment`                 | dataset       | Small enum                                          |
| `intron_inclusion`                   | dataset       | Binary                                              |

Explicitly excluded:

- `self_reported_ethnicity_ontology_term_id` — out of scope for graphical surfacing in this view.
- `organism_ontology_term_id` — uniform across the HCA corpus (human only); no signal.
- `cell_type_ontology_term_id` — deferred (see below).
- Free-text fields (`tissue_free_text`, `institute`, `comments`) — high-cardinality identifiers, not distributional.
- Identifier fields (`donor_id`, `sample_id`, `library_id`) — by definition unique.

### Cell-type distributions (deferred)

The richest signal — what cell types are present and in what proportion — sits behind a problem: CAP-annotated files often carry multiple cell-annotation sets with no canonical "primary," and uncurated files may not have `obs['cell_type_ontology_term_id']` set at all.

v1 deferral:

- The validator emits `cellannotation_sets: []` (or non-empty) as a candidates list. Each entry describes one detected annotation set with its title, the obs columns it occupies, the number of distinct CL terms, and the number of obs rows annotated.
- The validator does NOT emit a cell-type histogram in v1, even when `obs['cell_type_ontology_term_id']` is set unambiguously. (Avoids partial inconsistent behaviour; the rule is "no cell-type chart until the primary-set workflow lands.")
- A follow-up adds a `primary_cellannotation_set` uns field convention. Curators set it via the upload flow or the tracker UI. Once set, validator emits a per-cell `cell_type_ontology_term_id` distribution.

Tracked separately.

### Schema versioning

Same `schema_name` + `schema_version` as `metadata_coverage`. Currently inert (always `tier_1` / `0.1.0`), but reserves the slot for when LinkML versioning becomes meaningful (see related open issue on auto-bumping).

---

## Aggregation semantics

For the corpus view, the tracker sums bucket counts across the file set in scope. The aggregated `record_count` is the sum of per-file `record_count` values.

Two field types behave differently:

- Donor / sample / dataset-grain fields: per-file `record_count` is the count of that entity type in the file. Summing gives "total donors / samples / datasets across the scoped corpus." Bucket counts compose additively without weighting tricks.
- Obs-grain (cell-weighted) fields: per-file `record_count` is the total cells. Summing gives "total cells across the scoped corpus." Visual interpretation is "of all cells in this corpus slice, X% are 10x v3."

Both shapes use the same aggregation function — only the denominator's semantic meaning differs.

---

## Tracker storage

### Schema

Add a nullable JSONB column on `hat.files`:

```sql
ALTER TABLE hat.files ADD COLUMN metadata_distributions JSONB NULL;
```

Same pattern as the `metadata_coverage` column. Migration follows the existing `node-pg-migrate` TypeScript pattern.

### Ingest

Extend `processValidationResultsMessage` to read `metadata_distributions` from the validator results payload and pass it through `addValidationResultsToFile` for persistence. Absent / null is acceptable; files validated before the contract change keep the column null and are excluded from aggregations.

### Why JSONB

Same trade-off rationale as `metadata_coverage`: ~500 files × ~15 fields × small bucket maps ≈ ~tens of KB per row at most, comfortably within JSONB scan budget. Migrate to a normalised derived table only if measured query patterns push back.

---

## Tracker query layer

### Aggregation strategy

Pull the relevant `metadata_distributions` JSONB blobs (filtered by `is_latest`, file_type, and the scope filters), aggregate in TypeScript service code. Same approach as Metadata Coverage; same justification.

### Service layer

`app/services/metadata-distributions.ts` (new). Functions:

- `getFileDistributions(fileId)` — single file's distributions, post-resolution of ontology IDs to labels.
- `getCorpusDistributions(filters)` — aggregated distributions across the filter scope.

Both share the same per-field aggregation primitive.

### API endpoints

- `GET /api/files/[fileId]/metadata-distributions` — per-file fetch.
- `GET /api/metadata-distributions?entity=...&network=...&atlas=...` — corpus aggregation.

Both `registeredUser`-gated, same pattern as the existing read endpoints.

---

## Frontend

### Per-file panel

New panel on source-dataset and integrated-object detail pages. One chart per field, with a small toolbar to switch top-N depth on high-cardinality charts. Sorts buckets descending by count.

Chart-type heuristic: ≤4 buckets → donut; >4 → horizontal bar. >20 buckets collapses to top-10 + "other" with expand action.

### Corpus tab

New top-nav tab "Metadata Distributions" alongside "Metadata Coverage" (and the renamed "Metadata Dictionary"). Faceted-list layout with the same filter rail as the Coverage tab; body renders one chart per emitted field.

### Cross-linking

- Coverage view's per-field row links to the same field's Distribution chart (filtered to the same scope).
- Distribution chart links back to the same field's Coverage row (showing complete/missing/inconsistent counts).

---

## Key design decisions

### 1. Separate payload, not nested under `metadata_coverage`

Resolved: emit `metadata_distributions` as a sibling top-level key.

Rationale: coverage is `O(entity_classes × fields_with_annDataLocation)` — bounded. Distributions are `O(emitted_fields × distinct_value_count)` — bucket counts can grow with ontology breadth (tissue, disease). Keeping them separate means coverage stays compact and predictable, distributions can be sized independently.

### 2. Both dataset-grain AND obs-grain for obs-denormalised fields

Resolved: emit both. Different downstream questions need different denominators.

Dataset-grain answers "what does this file use." Obs-grain answers "what are the cells distributed across." Per-atlas leaders want both depending on the question.

### 3. Cell-type histograms deferred

Resolved: v1 emits a `cellannotation_sets` candidates list, no cell-type distribution. Curator workflow to designate a primary lands separately.

### 4. Empty-string normalisation

Resolved: same rule as `metadata_coverage`. Empty / whitespace-only values do not appear as buckets and are not included in `record_count`. Consistent treatment across both payloads.

### 5. Ontology term IDs, not human labels

Resolved: emit raw ontology term IDs (`PATO:0000383`, `EFO:0009922`, `MONDO:0005010`). The tracker resolves to labels at render time using `cellxgene-ontology-guide`. This avoids ontology-version drift between validator and tracker (the validator might be running an older overlay than the tracker has).

### 6. Required vs recommended

The validator emits buckets uniformly. The tracker chooses presentation (de-emphasise distributions for recommended-tier fields). Same split as Metadata Coverage.

---

## Open follow-ups

These don't block v1 but should be tracked.

### Cell-type primary annotation set

Add a `uns['primary_cellannotation_set']` field convention. Curators designate it (via upload flow or tracker UI). Validator emits `cell_type_ontology_term_id` distribution from the designated set. Tracker renders alongside the other charts. Files without a designated primary show the candidate-list picker.

Tracked separately.

### Cell-grain vs dataset-grain for obs-denormalised fields

v1 emits both. If real-world usage suggests one is consistently more useful for a given field, we can drop the other or default the UI to the preferred grain. Decision based on measured UX.

### Continuous-variable distributions

`cell_viability_percentage`, `cell_number_loaded`, donor age in years, cell-count-per-sample. v1 is categorical only. A future ticket can add numeric binning if it lands as a real ask.

### Self-reported ethnicity

Permanently out of scope for graphical surfacing in this view. Listed here so the deferral is durable.

### Sentinel-value handling

Some enum fields accept `na` / `unknown` / `not applicable` as valid values. Today these would appear as their own buckets. Acceptable for v1. A future improvement could collapse them into a single "missing" bucket per a sentinel-value list from the dictionary, mirroring the Metadata Coverage deferral.

---

## Glossary

- Distribution — for a given field, the breakdown of values into buckets and their counts at the field's entity grain.
- Bucket — one `{value → count}` entry. The value is a raw ontology term ID or enum member; the count is the number of entity instances with that value.
- Record count — denominator for a field's distribution. Equal to the count of entity instances with a populated (non-null, non-empty) value for the field.
- Entity grain — `donor`, `sample`, `dataset`, or `obs`. Same vocabulary as Metadata Coverage.
- Cellannotation set — a contiguous group of `obs` columns describing one cell-type annotation pass (typically `<set>--cell_ontology_term_id` and related). One file may carry multiple. v1 emits a candidates list; the per-set distribution is deferred to a primary-designation workflow.
