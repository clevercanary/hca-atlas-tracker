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
- **Purpose**: Physical files stored in S3 that represent source datasets, integrated objects, or ingest manifests
- **Business Rule**: Files ARE the datasets/integrated objects, not containers for them
- **Key Fields**:
  - `bucket` (VARCHAR) - S3 bucket name
  - `key` (VARCHAR) - S3 object key (file path)
  - `version_id` (VARCHAR) - S3 object version
  - `file_type` (VARCHAR) - Discriminator: 'source_dataset', 'integrated_object', 'ingest_manifest'
  - `source_study_id` (UUID, NULLABLE) - FK to source study (for source datasets only)
  - `atlas_id` (UUID, NULLABLE) - FK to atlas (for integrated objects and manifests only)
  - `sha256_client` (VARCHAR) - Client-provided SHA256 hash for integrity validation
  - `integrity_status` (VARCHAR) - Validation status: 'pending', 'valid', 'invalid'
  - `is_latest` (BOOLEAN) - Flag indicating if this is the latest version of the file
- **Foreign Keys**:
  - `source_study_id` → `hat.source_studies.id` (ON DELETE SET NULL, ON UPDATE CASCADE)
  - `atlas_id` → `hat.atlases.id` (ON DELETE SET NULL, ON UPDATE CASCADE)
- **Constraints**:
  - UNIQUE(`bucket`, `key`, `version_id`) - Prevents duplicate S3 object versions
  - CHECK constraint enforces exclusive foreign key relationships based on file_type
- **Relationships**:
  - Source dataset files: Belong to one source study (via `source_study_id`)
  - Integrated object files: Belong to one atlas (via `atlas_id`)
  - Ingest manifest files: Belong to one atlas (via `atlas_id`)

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

## Current Schema Implementation

### Files Table Schema (Implemented)
```sql
CREATE TABLE hat.files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket varchar(255) NOT NULL,
  key text NOT NULL,
  version_id varchar(255),
  etag varchar(255) NOT NULL,
  size_bytes bigint NOT NULL,
  
  -- File Classification
  file_type varchar(50) NOT NULL, -- 'source_dataset', 'integrated_object', 'ingest_manifest'
  
  -- Foreign Key Relationships (Exclusive based on file_type)
  source_study_id uuid NULL,      -- FK to source_studies.id (for source datasets only)
  atlas_id uuid NULL,             -- FK to atlases.id (for integrated objects and manifests only)
  
  -- S3 Event Context
  event_info jsonb NOT NULL,      -- S3 event metadata: {eventTime, eventName}
  
  -- Integrity Validation
  sha256_client varchar(64),      -- Client-provided SHA256 hash
  integrity_status varchar(50) DEFAULT 'pending', -- 'pending', 'valid', 'invalid'
  
  -- Version Management
  is_latest boolean DEFAULT TRUE, -- Flag for latest version queries
  
  -- Timestamps
  status varchar(50) DEFAULT 'uploaded',
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT uq_files_bucket_key_version UNIQUE (bucket, key, version_id),
  CONSTRAINT fk_files_source_study_id FOREIGN KEY (source_study_id) 
    REFERENCES hat.source_studies(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_files_atlas_id FOREIGN KEY (atlas_id) 
    REFERENCES hat.atlases(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
  -- Business Logic Constraint: Enforce exclusive foreign key relationships
  CONSTRAINT ck_files_exclusive_parent_relationship CHECK (
    (file_type = 'source_dataset' AND atlas_id IS NULL) OR
    (file_type IN ('integrated_object', 'ingest_manifest') AND source_study_id IS NULL AND atlas_id IS NOT NULL)
  )
);
```

## File Processing and Validation Workflow

### Stage 1: S3 Notification Ingestion

When a file is uploaded to S3, the system processes it through the S3 notification API:

1. **S3 Path Analysis**: Parse S3 key structure `bio_network/atlas-name/folder-type/filename`
2. **File Type Determination**: Based on folder type:
   - `source-datasets/` → `file_type = 'source_dataset'`
   - `integrated-objects/` → `file_type = 'integrated_object'`
   - `manifests/` → `file_type = 'ingest_manifest'`
3. **Foreign Key Assignment**:
   - **Source datasets**: `source_study_id = NULL` (staged validation), `atlas_id = NULL`
   - **Integrated objects**: `atlas_id = atlas_uuid` (from atlas lookup), `source_study_id = NULL`
   - **Ingest manifests**: `atlas_id = atlas_uuid` (from atlas lookup), `source_study_id = NULL`
4. **Database Insert**: Create file record with appropriate foreign keys and constraints

### Stage 2: File Content Validation (Future)

For source dataset files that need source study linkage:

1. **Content Extraction**: Read `.h5ad` file metadata to extract DOI or other study references
2. **Source Study Lookup**: Query `hat.source_studies` table to find matching study
3. **Foreign Key Update**: `UPDATE hat.files SET source_study_id = ? WHERE id = ?`
4. **Validation Status**: Update `integrity_status` based on validation results

### Stage 3: Data Integrity Validation

1. **SHA256 Verification**: Compare client-provided hash with server-computed hash
2. **Status Update**: Set `integrity_status` to 'valid' or 'invalid'
3. **Error Handling**: Log and alert on integrity failures

### Error Handling Strategy

- **Atlas Lookup Failures**: Reject early, send to DLQ for operational review
- **Source Study Lookup Failures**: Allow file creation, flag for manual review during validation
- **Integrity Failures**: Mark as invalid, preserve for investigation
- **Constraint Violations**: Database-level rejection with clear error messages

### Query Patterns

```sql
-- Find latest files for an atlas
SELECT * FROM hat.files 
WHERE atlas_id = ? AND is_latest = TRUE;

-- Find source dataset files pending validation
SELECT * FROM hat.files 
WHERE file_type = 'source_dataset' AND source_study_id IS NULL;

-- Find files with integrity issues
SELECT * FROM hat.files 
WHERE integrity_status = 'invalid';

-- Get all files for a source study (via source datasets)
SELECT f.* FROM hat.files f
JOIN hat.source_studies ss ON f.source_study_id = ss.id
WHERE ss.id = ?;
```

## Summary

The HCA Atlas Tracker file system is now fully integrated with the entity relationship model:

- **Files ARE the datasets/integrated objects**, not containers for them
- **Database constraints enforce data integrity** at the schema level
- **Staged validation workflow** allows files to be ingested immediately and validated later
- **Clear error handling** with operational visibility through DLQ processing
- **Comprehensive test coverage** ensures reliability and maintainability

This implementation provides a robust foundation for managing biological data files with proper relationships, validation workflows, and data integrity guarantees.
