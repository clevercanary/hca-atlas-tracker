--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: hat; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA hat;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: hat; Owner: -
--

CREATE FUNCTION hat.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
    $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: atlases; Type: TABLE; Schema: hat; Owner: -
--

CREATE TABLE hat.atlases (
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    overview jsonb NOT NULL,
    source_studies jsonb NOT NULL,
    status character varying(50) NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    target_completion timestamp without time zone,
    source_datasets uuid[] DEFAULT '{}'::uuid[] NOT NULL
);


--
-- Name: comments; Type: TABLE; Schema: hat; Owner: -
--

CREATE TABLE hat.comments (
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by integer NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    text text NOT NULL,
    thread_id uuid DEFAULT gen_random_uuid() NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by integer NOT NULL
);


--
-- Name: component_atlases; Type: TABLE; Schema: hat; Owner: -
--

CREATE TABLE hat.component_atlases (
    atlas_id uuid NOT NULL,
    component_info jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source_datasets uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    title text NOT NULL
);


--
-- Name: entry_sheet_validations; Type: TABLE; Schema: hat; Owner: -
--

CREATE TABLE hat.entry_sheet_validations (
    entry_sheet_id text NOT NULL,
    entry_sheet_title text,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    last_synced timestamp without time zone NOT NULL,
    last_updated jsonb,
    source_study_id uuid NOT NULL,
    validation_report jsonb NOT NULL,
    validation_summary jsonb NOT NULL
);


--
-- Name: files; Type: TABLE; Schema: hat; Owner: -
--

CREATE TABLE hat.files (
    atlas_id uuid,
    bucket character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    etag character varying(255) NOT NULL,
    event_info jsonb NOT NULL,
    file_type character varying(50) NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    integrity_checked_at timestamp without time zone,
    integrity_error text,
    integrity_status character varying(20) DEFAULT '''pending'''::character varying NOT NULL,
    is_latest boolean DEFAULT true NOT NULL,
    key text NOT NULL,
    sha256_client character varying(64),
    sha256_server character varying(64),
    size_bytes bigint NOT NULL,
    source_study_id uuid,
    status character varying(50) DEFAULT '''uploaded'''::character varying NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    version_id character varying(255),
    component_atlas_id uuid,
    source_dataset_id uuid,
    CONSTRAINT ck_files_exclusive_parent_relationship CHECK (((((file_type)::text = 'source_dataset'::text) AND (source_dataset_id IS NOT NULL) AND (component_atlas_id IS NULL)) OR (((file_type)::text = 'integrated_object'::text) AND (source_dataset_id IS NULL) AND (component_atlas_id IS NOT NULL)) OR (((file_type)::text = 'ingest_manifest'::text) AND (source_dataset_id IS NULL) AND (component_atlas_id IS NULL)))),
    CONSTRAINT ck_files_integrity_status CHECK (((integrity_status)::text = ANY ((ARRAY['pending'::character varying, 'validating'::character varying, 'valid'::character varying, 'invalid'::character varying, 'error'::character varying])::text[])))
);


--
-- Name: COLUMN files.atlas_id; Type: COMMENT; Schema: hat; Owner: -
--

COMMENT ON COLUMN hat.files.atlas_id IS 'FK to atlases.id - set for integrated_object and ingest_manifest files';


--
-- Name: COLUMN files.event_info; Type: COMMENT; Schema: hat; Owner: -
--

COMMENT ON COLUMN hat.files.event_info IS 'S3 event metadata: {eventTime, eventName}';


--
-- Name: COLUMN files.file_type; Type: COMMENT; Schema: hat; Owner: -
--

COMMENT ON COLUMN hat.files.file_type IS 'File type: source_dataset, integrated_object, or ingest_manifest';


--
-- Name: COLUMN files.integrity_checked_at; Type: COMMENT; Schema: hat; Owner: -
--

COMMENT ON COLUMN hat.files.integrity_checked_at IS 'When integrity was last checked';


--
-- Name: COLUMN files.integrity_error; Type: COMMENT; Schema: hat; Owner: -
--

COMMENT ON COLUMN hat.files.integrity_error IS 'Error message if integrity validation fails';


--
-- Name: COLUMN files.integrity_status; Type: COMMENT; Schema: hat; Owner: -
--

COMMENT ON COLUMN hat.files.integrity_status IS 'Status: pending, validating, valid, invalid, error';


--
-- Name: COLUMN files.is_latest; Type: COMMENT; Schema: hat; Owner: -
--

COMMENT ON COLUMN hat.files.is_latest IS 'Whether this is the latest version of the file';


--
-- Name: COLUMN files.sha256_client; Type: COMMENT; Schema: hat; Owner: -
--

COMMENT ON COLUMN hat.files.sha256_client IS 'SHA256 checksum provided by client';


--
-- Name: COLUMN files.sha256_server; Type: COMMENT; Schema: hat; Owner: -
--

COMMENT ON COLUMN hat.files.sha256_server IS 'SHA256 checksum calculated by server';


--
-- Name: COLUMN files.source_study_id; Type: COMMENT; Schema: hat; Owner: -
--

COMMENT ON COLUMN hat.files.source_study_id IS 'FK to source_studies.id - NULL for staged validation, set later';


--
-- Name: COLUMN files.component_atlas_id; Type: COMMENT; Schema: hat; Owner: -
--

COMMENT ON COLUMN hat.files.component_atlas_id IS 'FK to component_atlases.id - set for integrated_object files';


--
-- Name: COLUMN files.source_dataset_id; Type: COMMENT; Schema: hat; Owner: -
--

COMMENT ON COLUMN hat.files.source_dataset_id IS 'FK to source_datasets.id - set for source_dataset files';


--
-- Name: pgmigrations; Type: TABLE; Schema: hat; Owner: -
--

CREATE TABLE hat.pgmigrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


--
-- Name: pgmigrations_id_seq; Type: SEQUENCE; Schema: hat; Owner: -
--

CREATE SEQUENCE hat.pgmigrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pgmigrations_id_seq; Type: SEQUENCE OWNED BY; Schema: hat; Owner: -
--

ALTER SEQUENCE hat.pgmigrations_id_seq OWNED BY hat.pgmigrations.id;


--
-- Name: source_datasets; Type: TABLE; Schema: hat; Owner: -
--

CREATE TABLE hat.source_datasets (
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sd_info jsonb NOT NULL,
    source_study_id uuid,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: source_studies; Type: TABLE; Schema: hat; Owner: -
--

CREATE TABLE hat.source_studies (
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    doi text,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    study_info jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: hat; Owner: -
--

CREATE TABLE hat.users (
    disabled boolean NOT NULL,
    email character varying(255) NOT NULL,
    full_name text NOT NULL,
    id integer NOT NULL,
    last_login timestamp without time zone DEFAULT '1970-01-01 00:00:00'::timestamp without time zone NOT NULL,
    role character varying(50) NOT NULL,
    role_associated_resource_ids uuid[] DEFAULT '{}'::uuid[] NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: hat; Owner: -
--

CREATE SEQUENCE hat.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: hat; Owner: -
--

ALTER SEQUENCE hat.users_id_seq OWNED BY hat.users.id;


--
-- Name: validations; Type: TABLE; Schema: hat; Owner: -
--

CREATE TABLE hat.validations (
    atlas_ids uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    entity_id text NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    resolved_at timestamp without time zone,
    target_completion timestamp without time zone,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    validation_id text NOT NULL,
    validation_info jsonb NOT NULL,
    comment_thread_id uuid
);


--
-- Name: pgmigrations id; Type: DEFAULT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.pgmigrations ALTER COLUMN id SET DEFAULT nextval('hat.pgmigrations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.users ALTER COLUMN id SET DEFAULT nextval('hat.users_id_seq'::regclass);


--
-- Name: entry_sheet_validations entry_sheet_validations_entry_sheet_id_key; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.entry_sheet_validations
    ADD CONSTRAINT entry_sheet_validations_entry_sheet_id_key UNIQUE (entry_sheet_id);


--
-- Name: entry_sheet_validations entry_sheet_validations_pkey; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.entry_sheet_validations
    ADD CONSTRAINT entry_sheet_validations_pkey PRIMARY KEY (id);


--
-- Name: pgmigrations pgmigrations_pkey; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.pgmigrations
    ADD CONSTRAINT pgmigrations_pkey PRIMARY KEY (id);


--
-- Name: atlases pk_atlases_id; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.atlases
    ADD CONSTRAINT pk_atlases_id PRIMARY KEY (id);


--
-- Name: comments pk_comments_id; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.comments
    ADD CONSTRAINT pk_comments_id PRIMARY KEY (id);


--
-- Name: component_atlases pk_component_atlases_id; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.component_atlases
    ADD CONSTRAINT pk_component_atlases_id PRIMARY KEY (id);


--
-- Name: files pk_files_id; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.files
    ADD CONSTRAINT pk_files_id PRIMARY KEY (id);


--
-- Name: source_datasets pk_source_datasets_id; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.source_datasets
    ADD CONSTRAINT pk_source_datasets_id PRIMARY KEY (id);


--
-- Name: source_studies pk_source_studies_id; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.source_studies
    ADD CONSTRAINT pk_source_studies_id PRIMARY KEY (id);


--
-- Name: users pk_users_id; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.users
    ADD CONSTRAINT pk_users_id PRIMARY KEY (id);


--
-- Name: validations pk_validations_id; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.validations
    ADD CONSTRAINT pk_validations_id PRIMARY KEY (entity_id, validation_id);


--
-- Name: source_studies source_datasets_doi_key; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.source_studies
    ADD CONSTRAINT source_datasets_doi_key UNIQUE (doi);


--
-- Name: component_atlases unique_component_atlases_title_atlas_id; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.component_atlases
    ADD CONSTRAINT unique_component_atlases_title_atlas_id UNIQUE (title, atlas_id);


--
-- Name: files uq_files_bucket_key_version; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.files
    ADD CONSTRAINT uq_files_bucket_key_version UNIQUE (bucket, key, version_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: validations validations_id_key; Type: CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.validations
    ADD CONSTRAINT validations_id_key UNIQUE (id);


--
-- Name: files_bucket_key_index; Type: INDEX; Schema: hat; Owner: -
--

CREATE INDEX files_bucket_key_index ON hat.files USING btree (bucket, key);


--
-- Name: files_component_atlas_id_index; Type: INDEX; Schema: hat; Owner: -
--

CREATE INDEX files_component_atlas_id_index ON hat.files USING btree (component_atlas_id);


--
-- Name: files_created_at_index; Type: INDEX; Schema: hat; Owner: -
--

CREATE INDEX files_created_at_index ON hat.files USING btree (created_at);


--
-- Name: files_integrity_status_index; Type: INDEX; Schema: hat; Owner: -
--

CREATE INDEX files_integrity_status_index ON hat.files USING btree (integrity_status);


--
-- Name: files_sha256_client_index; Type: INDEX; Schema: hat; Owner: -
--

CREATE INDEX files_sha256_client_index ON hat.files USING btree (sha256_client);


--
-- Name: files_source_dataset_id_index; Type: INDEX; Schema: hat; Owner: -
--

CREATE INDEX files_source_dataset_id_index ON hat.files USING btree (source_dataset_id);


--
-- Name: files_status_index; Type: INDEX; Schema: hat; Owner: -
--

CREATE INDEX files_status_index ON hat.files USING btree (status);


--
-- Name: atlases update_updated_at; Type: TRIGGER; Schema: hat; Owner: -
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON hat.atlases FOR EACH ROW EXECUTE FUNCTION hat.update_updated_at_column();


--
-- Name: comments update_updated_at; Type: TRIGGER; Schema: hat; Owner: -
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON hat.comments FOR EACH ROW EXECUTE FUNCTION hat.update_updated_at_column();


--
-- Name: component_atlases update_updated_at; Type: TRIGGER; Schema: hat; Owner: -
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON hat.component_atlases FOR EACH ROW EXECUTE FUNCTION hat.update_updated_at_column();


--
-- Name: files update_updated_at; Type: TRIGGER; Schema: hat; Owner: -
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON hat.files FOR EACH ROW EXECUTE FUNCTION hat.update_updated_at_column();


--
-- Name: source_datasets update_updated_at; Type: TRIGGER; Schema: hat; Owner: -
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON hat.source_datasets FOR EACH ROW EXECUTE FUNCTION hat.update_updated_at_column();


--
-- Name: source_studies update_updated_at; Type: TRIGGER; Schema: hat; Owner: -
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON hat.source_studies FOR EACH ROW EXECUTE FUNCTION hat.update_updated_at_column();


--
-- Name: validations update_updated_at; Type: TRIGGER; Schema: hat; Owner: -
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON hat.validations FOR EACH ROW EXECUTE FUNCTION hat.update_updated_at_column();


--
-- Name: entry_sheet_validations entry_sheet_validations_source_study_id_fkey; Type: FK CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.entry_sheet_validations
    ADD CONSTRAINT entry_sheet_validations_source_study_id_fkey FOREIGN KEY (source_study_id) REFERENCES hat.source_studies(id);


--
-- Name: comments fk_comments_created_by_user_id; Type: FK CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.comments
    ADD CONSTRAINT fk_comments_created_by_user_id FOREIGN KEY (created_by) REFERENCES hat.users(id);


--
-- Name: comments fk_comments_updated_by_user_id; Type: FK CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.comments
    ADD CONSTRAINT fk_comments_updated_by_user_id FOREIGN KEY (updated_by) REFERENCES hat.users(id);


--
-- Name: files fk_files_component_atlas_id; Type: FK CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.files
    ADD CONSTRAINT fk_files_component_atlas_id FOREIGN KEY (component_atlas_id) REFERENCES hat.component_atlases(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: files fk_files_source_dataset_id; Type: FK CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.files
    ADD CONSTRAINT fk_files_source_dataset_id FOREIGN KEY (source_dataset_id) REFERENCES hat.source_datasets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: source_datasets fk_source_datasets_source_study_id; Type: FK CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.source_datasets
    ADD CONSTRAINT fk_source_datasets_source_study_id FOREIGN KEY (source_study_id) REFERENCES hat.source_studies(id);


--
-- Name: files pk_atlases_id; Type: FK CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.files
    ADD CONSTRAINT pk_atlases_id FOREIGN KEY (atlas_id) REFERENCES hat.atlases(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: component_atlases pk_component_atlases_atlas_id; Type: FK CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.component_atlases
    ADD CONSTRAINT pk_component_atlases_atlas_id FOREIGN KEY (atlas_id) REFERENCES hat.atlases(id);


--
-- Name: files pk_source_studies_id; Type: FK CONSTRAINT; Schema: hat; Owner: -
--

ALTER TABLE ONLY hat.files
    ADD CONSTRAINT pk_source_studies_id FOREIGN KEY (source_study_id) REFERENCES hat.source_studies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

