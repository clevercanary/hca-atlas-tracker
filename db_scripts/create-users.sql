-- Create the 'hat' schema
CREATE SCHEMA IF NOT EXISTS hat AUTHORIZATION postgres;

-- Step 1: Create Users
CREATE ROLE hat_migrate WITH LOGIN PASSWORD 'yourpassword';
CREATE ROLE hat_app WITH LOGIN PASSWORD 'yourpassword';

-- Grant hat_migrate the ability to create schemas in the hcaatlastracker database
GRANT CREATE ON DATABASE hcaatlastracker TO hat_migrate;


-- Step 2: Grant Permissions to Use the 'hat' Schema
GRANT USAGE ON SCHEMA hat TO hat_migrate;
GRANT USAGE ON SCHEMA hat TO hat_app;
GRANT CREATE ON SCHEMA hat TO hat_migrate;

-- Step 3: Grant Permissions on Existing and Future Tables
-- Grant hat_migrate permission to manage all current and future tables in the 'hat' schema
GRANT ALL ON ALL TABLES IN SCHEMA hat TO hat_migrate;
ALTER DEFAULT PRIVILEGES FOR ROLE hat_migrate IN SCHEMA hat
GRANT ALL ON TABLES TO hat_migrate;

-- Grant hat_app permission to read, insert, update, and delete data in all current and future tables in the 'hat' schema
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA hat TO hat_app;
ALTER DEFAULT PRIVILEGES FOR ROLE hat_migrate IN SCHEMA hat
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO hat_app;

-- Step 4: Grant Connect to the Database
GRANT CONNECT ON DATABASE hcaatlastracker TO hat_migrate;
GRANT CONNECT ON DATABASE hcaatlastracker TO hat_app;

-- Additional: Grant EXECUTE on all current and future functions/procedures in 'hat' schema to hat_app
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA hat TO hat_app;
GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA hat TO hat_app;
ALTER DEFAULT PRIVILEGES FOR ROLE hat_migrate IN SCHEMA hat
GRANT EXECUTE ON FUNCTIONS TO hat_app;
ALTER DEFAULT PRIVILEGES FOR ROLE hat_migrate IN SCHEMA hat
GRANT EXECUTE ON PROCEDURES TO hat_app;