import anndata as ad
import pandas as pd

# Load your AnnData file
adata = ad.read_h5ad("/Users/dave/Downloads/skin.h5ad")

# Columns categorized as CELLxGENE Required, HCA Required, and HCA Recommended
cellxgene_required = [
    "assay_ontology_term_id",
    "cell_type_ontology_term_id",
    "development_stage_ontology_term_id",
    "disease_ontology_term_id",
    "donor_id",
    "is_primary_data",
    "organism_ontology_term_id",
    "self_reported_ethnicity_ontology_term_id",
    "sex_ontology_term_id",
    "suspension_type",
    "tissue_type",
    "tissue_ontology_term_id",
]

hca_required = [
    "alignment_software",
    "cell_enrichment",
    "gene_annotation_version",
    "institute",
    "library_id",
    "library_preparation_batch",
    "library_sequencing_run",
    "manner_of_death",
    "reference_genome",
    "sampled_site_condition",
    "sample_collection_method",
    "sample_id",
    "sample_preservation_method",
    "sample_source",
    "sequenced_fragment",
]

hca_recommended = [
    "author_batch_notes",
    "author_cell_type",
    "cell_number_loaded",
    "cell_viability_percentage",
    "intron_inclusion",
    "library_id_repository",
    "protocol_url",
    "sample_collection_relative_time_point",
    "sequencing_platform",
    "sample_collection_site",
    "sample_collection_year",
    "tissue_free_text",
]


# Function to determine distinct values and null percentages for the columns in obs
def count_distinct_values(adata, columns):
    distinct_counts = {}
    for col in columns:
        if col in adata.obs.columns:
            distinct_counts[col] = {
                "distinct_count": adata.obs[col].nunique(),
                "first_values": adata.obs[col].unique()[:5].tolist(),
                "null_percentage": adata.obs[col].isnull().mean() * 100,
            }
        else:
            distinct_counts[col] = {
                "distinct_count": "Column not found",
                "first_values": "Column not found",
                "null_percentage": "Column not found",
            }
    return distinct_counts


# Get distinct value counts for CELLxGENE required, HCA required, and recommended columns
cellxgene_required_counts = count_distinct_values(adata, cellxgene_required)
required_counts = count_distinct_values(adata, hca_required)
recommended_counts = count_distinct_values(adata, hca_recommended)

# Convert results to DataFrame for better display
cellxgene_required_df = pd.DataFrame(
    [
        (col, data["distinct_count"], data["first_values"], data["null_percentage"])
        for col, data in cellxgene_required_counts.items()
    ],
    columns=[
        "CELLxGENE Required Columns",
        "Distinct Values",
        "First 5 Distinct Values",
        "Null Percentage",
    ],
)
required_df = pd.DataFrame(
    [
        (col, data["distinct_count"], data["first_values"], data["null_percentage"])
        for col, data in required_counts.items()
    ],
    columns=[
        "HCA Required Columns",
        "Distinct Values",
        "First 5 Distinct Values",
        "Null Percentage",
    ],
)
recommended_df = pd.DataFrame(
    [
        (col, data["distinct_count"], data["first_values"], data["null_percentage"])
        for col, data in recommended_counts.items()
    ],
    columns=[
        "HCA Recommended Columns",
        "Distinct Values",
        "First 5 Distinct Values",
        "Null Percentage",
    ],
)

# Display the results
print("CELLxGENE Required Columns Distinct Values:\n")
print(cellxgene_required_df)
print("\nHCA Required Columns Distinct Values:\n")
print(required_df)
print("\nHCA Recommended Columns Distinct Values:\n")
print(recommended_df)
