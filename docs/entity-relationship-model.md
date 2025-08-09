# HCA Atlas Tracker Entity Relationship Model

## Overview

The HCA Atlas Tracker uses a hierarchical data model to organize biological data across multiple levels of granularity. This document analyzes the entity relationships in the HCA Atlas Tracker database and provides recommendations for integrating the `files` table with the existing entity hierarchy.

## Core Entities

### 1. Atlas (`hat.atlases`)
- **Primary Key**: `id` (UUID)
- **Purpose**: Top-level research projects that combine multiple datasets
- **Key Fields**:
  - `title` (TEXT) - Atlas name
  - `description` (TEXT) - Atlas description
  - `source_datasets` (UUID[]) - Array of source dataset IDs included in this atlas
- **Relationships**: Contains multiple source datasets and integrated objects

### 2. Source Study (`hat.source_studies`)
- **Primary Key**: `id` (UUID)
- **Purpose**: Scientific studies that publish datasets (associated with publications)
- **Key Fields**:
  - `title` (TEXT) - Study title
  - `doi` (TEXT) - Digital Object Identifier for the publication
  - `study_info` (JSONB) - Study metadata
- **Relationships**: Publishes multiple source datasets

### 3. Source Dataset (`hat.source_datasets`)
- **Primary Key**: `id` (UUID)
- **Purpose**: Individual datasets from scientific studies
- **Key Fields**:
  - `title` (TEXT) - Dataset title
  - `source_study_id` (UUID, NOT NULL) - Foreign key to source study
  - `dataset_info` (JSONB) - Dataset metadata
- **Foreign Keys**:
  - `source_study_id` → `hat.source_studies.id`
- **Relationships**: Belongs to one source study, can be used by multiple atlases

### 4. Integrated Object (`hat.component_atlases`)
- **Primary Key**: `id` (UUID)
- **Purpose**: Integrated objects that combine source datasets into processed/analyzed outputs
- **Business Term**: "Integrated Object" (backed by `component_atlases` table)
- **Key Fields**:
  - `atlas_id` (UUID, NOT NULL) - Foreign key to parent atlas
  - `component_info` (JSONB) - Integrated object metadata and processing info
  - `source_datasets` (UUID[]) - Array of source dataset IDs used in this integrated object
- **Foreign Keys**:
  - `atlas_id` → `hat.atlases.id`
- **Relationships**: Belongs to one atlas, uses multiple source datasets

### 5. Files (`hat.files`)
- **Primary Key**: `id` (UUID)
- **Purpose**: S3 objects that ARE either source datasets or integrated objects
- **Key Fields**:
  - `bucket` (VARCHAR) - S3 bucket name
  - `key` (TEXT) - S3 object key
  - `version_id` (VARCHAR) - S3 object version
  - `etag` (VARCHAR) - S3 ETag for integrity
  - `size_bytes` (BIGINT) - File size
  - `event_info` (JSONB) - S3 event metadata
  - `is_latest` (BOOLEAN) - Latest version flag
  - `source_study_id` (UUID, NULL) - Foreign key to source study (for source dataset files)
  - `atlas_id` (UUID, NULL) - Foreign key to atlas (for integrated object files)
  - `file_type` (VARCHAR(50), NOT NULL) - "source_dataset" or "integrated_object"
- **Unique Constraints**:
  - `(bucket, key, version_id)` - Ensures S3 object uniqueness
- **Foreign Keys**:
  - `source_study_id` → `hat.source_studies.id`
  - `atlas_id` → `hat.atlases.id`
- **Relationships**: Source dataset files belong to a single source study, integrated object files belong to a single atlas

## Relationship Model

### Atlas ↔ Source Dataset (Many-to-Many via Array)
- Atlas → Source Dataset: **1:N** (one atlas contains many source datasets)
- Source Dataset → Atlas: **N:M** (one source dataset can belong to multiple atlases)

### Atlas ↔ Integrated Object (One-to-Many)
- Atlas → Integrated Object: **1:N** (one atlas has multiple integrated objects)
- Integrated Object → Atlas: **N:1** (each integrated object belongs to one atlas)

### Integrated Object ↔ Source Dataset (Many-to-Many via Array)
- Integrated Object → Source Dataset: **1:N** (one integrated object uses many source datasets)
- Source Dataset → Integrated Object: **N:M** (one source dataset can be used by multiple integrated objects)

### Source Study ↔ Source Dataset (One-to-Many)
- Source Study → Source Dataset: **1:N** (one study publishes multiple datasets)
- Source Dataset → Source Study: **N:1** (each dataset belongs to one study)

### File Relationships
- Source Dataset File → Source Study: **N:1** (each source dataset file belongs to one study)
- Integrated Object File → Atlas: **N:1** (each integrated object file belongs to one atlas)
- Source Dataset File → Atlas: **N:M** (one source dataset file can be used by multiple atlases)

## Recommended Schema Implementation

### Option B: Derived Atlas Linkage (Recommended)
```sql
-- Add to files table
source_study_id: uuid NULL       -- For source dataset files (populated during validation)
atlas_id: uuid NULL              -- For integrated object files
file_type: varchar(50) NOT NULL   -- "source_dataset" or "integrated_object" or "ingest_manifest"
file_extension: varchar(10) NULL  -- ".h5ad", ".json", etc.

-- Note: data_modality belongs on source_datasets table, not files
-- Note: mime_type stored in S3 metadata, not needed in database

FOREIGN KEY (source_study_id) REFERENCES hat.source_studies(id)
FOREIGN KEY (atlas_id) REFERENCES hat.atlases(id)

-- Constraint: allows source_study_id to be NULL initially for source datasets (populated during validation)
CONSTRAINT ck_files_single_type 
  CHECK ((file_type = 'source_dataset' AND atlas_id IS NULL) OR 
         (file_type = 'integrated_object' AND atlas_id IS NOT NULL AND source_study_id IS NULL) OR
         (file_type = 'ingest_manifest' AND atlas_id IS NOT NULL AND source_study_id IS NULL))
```

### Validation Workflow
1. **S3 Notification**: File uploaded, record created with `file_type` but `source_study_id = NULL`
2. **Validation Step**: Download file, read contents, determine source study, update `source_study_id`
3. **Atlas Linkage**: 
   - **Source Dataset Files**: Derived through existing relationships (Source Dataset File → Source Study → Atlas)
   - **Integrated Object Files**: Direct linkage via `atlas_id` foreign key

## Implementation Plan

### Database Changes
1. **Add foreign keys** to `files` table:
   - `source_study_id` for source dataset files (initially NULL, populated during validation)
   - `atlas_id` for integrated object files
2. **Add `file_type` discriminator** field
3. **Add constraint** to allow staged validation workflow
4. **Add classification fields**:
   - `file_extension` (e.g., ".h5ad", ".json")

### Migration Strategy
1. **Add new columns** to the empty files table:
   - `source_study_id` (nullable for staged validation)
   - `atlas_id` (nullable)
   - `file_type` (NOT NULL)
   - `file_extension` (nullable)
2. **Create indexes** on new foreign keys and classification fields
3. **Add constraint** to enforce file type rules
4. **All future files** will have proper relationships from the start

### Query Patterns
```sql
-- Find all source dataset files for a study
SELECT * FROM hat.files 
WHERE source_study_id = $study_id AND file_type = 'source_dataset';

-- Find all integrated object files for an atlas
SELECT * FROM hat.files 
WHERE atlas_id = $atlas_id AND file_type = 'integrated_object';

-- Find which atlases use a source dataset file (derived)
SELECT DISTINCT a.* FROM hat.atlases a
JOIN hat.source_datasets sd ON sd.id = ANY(a.source_datasets)
JOIN hat.files f ON f.source_study_id = sd.source_study_id
WHERE f.id = $file_id AND f.file_type = 'source_dataset';

-- Find all source datasets for an atlas (derived relationship)
SELECT DISTINCT f.* FROM hat.files f
JOIN hat.source_datasets sd ON f.source_study_id = sd.source_study_id
JOIN hat.atlases a ON sd.id = ANY(a.source_datasets)
WHERE a.id = $atlas_id AND f.file_type = 'source_dataset';

-- Find all source datasets with no source study assigned (staged validation)
SELECT * FROM hat.files 
WHERE source_study_id IS NULL AND file_type = 'source_dataset';

-- Find all source studies used in an integrated object
SELECT DISTINCT ss.* FROM hat.source_studies ss
JOIN hat.source_datasets sd ON ss.id = sd.source_study_id
JOIN hat.atlases a ON sd.id = ANY(a.source_datasets)
JOIN hat.files f ON f.atlas_id = a.id
WHERE f.id = $integrated_object_file_id AND f.file_type = 'integrated_object';

-- Find all source datasets used in an integrated object
SELECT DISTINCT sd.* FROM hat.source_datasets sd
JOIN hat.atlases a ON sd.id = ANY(a.source_datasets)
JOIN hat.files f ON f.atlas_id = a.id
WHERE f.id = $integrated_object_file_id AND f.file_type = 'integrated_object';
```

This design maintains consistency with existing patterns while supporting both source data and integration workflows in the HCA Atlas Tracker system.
