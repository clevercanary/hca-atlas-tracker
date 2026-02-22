#!/usr/bin/env python3
"""
Dockstore API Exploration Script
=================================

Demonstrates how to search for workflows on Dockstore using two APIs:

1. GA4GH TRS v2 API (standard) - Simple GET-based filtering by language, tool class, etc.
2. Dockstore Extended API - Elasticsearch-backed POST search with rich faceted filtering.

Supported descriptor languages: CWL, WDL, NFL (Nextflow), GALAXY, SMK (Snakemake)

Launch-with platforms (determined by workflow language and source):
  - Terra (WDL workflows)
  - NHLBI BioData Catalyst (WDL → Terra, CWL → Seven Bridges)
  - AnVIL (WDL workflows)
  - DNAnexus
  - DNAstack
  - CGC (Cancer Genomics Cloud)
  - Galaxy (Galaxy workflows)

API docs: https://dockstore.org/api/static/swagger-ui/index.html
TRS spec: https://ga4gh.github.io/tool-registry-service-schemas/

Usage:
    python3 scripts/dockstore_api_exploration.py
"""

import json
import sys
import time
from typing import Any
from urllib.parse import urlencode

import requests

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_URL = "https://dockstore.org/api"
TRS_V2_BASE = f"{BASE_URL}/api/ga4gh/v2"
EXTENDED_BASE = f"{BASE_URL}/api/ga4gh/v2/extended"

HEADERS = {"Accept": "application/json", "Content-Type": "application/json"}

# Descriptor language enum values accepted by the TRS and Elasticsearch APIs
DESCRIPTOR_TYPES = ["CWL", "WDL", "NFL", "GALAXY", "SMK"]

# Platform names that appear in the verified_platforms facet
KNOWN_PLATFORMS = [
    "Terra",
    "AnVIL",
    "BioData Catalyst",
    "DNAnexus",
    "DNAstack",
    "CGC",
    "Seven Bridges",
    "Galaxy",
]

# Elasticsearch index fields relevant for filtering workflows
ES_FIELDS = {
    "descriptorType": "Workflow language (CWL, WDL, NFL, GALAXY, SMK)",
    "full_workflow_path": "Full path e.g. github.com/org/repo/workflow",
    "description": "Workflow description text",
    "all_authors.name": "Author names",
    "namespace": "Source namespace / organization",
    "organization": "Dockstore organization",
    "labels.value.keyword": "User-applied labels",
    "categories.name.keyword": "Curated category names",
    "verified": "Whether the workflow is verified (boolean)",
    "verified_platforms.keyword": "Platforms where workflow is verified",
    "descriptor_type_versions.keyword": "Language version (e.g. 1.0, draft-2)",
    "engine_versions.keyword": "Engine versions",
    "registry": "Source control registry (e.g. GITHUB)",
}

# Boost weights used by the Dockstore UI for relevance scoring
SEARCH_FIELD_BOOSTS = {
    "full_workflow_path": 14,
    "tool_path": 14,
    "topicAutomatic": 4,
    "all_authors.name": 3,
    "description": 2,
}

# Retry configuration
MAX_RETRIES = 3
RETRY_BACKOFF_BASE = 2  # seconds


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------


def _request_with_retry(
    method: str, url: str, retries: int = MAX_RETRIES, **kwargs: Any
) -> requests.Response:
    """Make an HTTP request with exponential backoff retry on transient errors."""
    for attempt in range(retries + 1):
        try:
            resp = requests.request(method, url, timeout=30, **kwargs)
            resp.raise_for_status()
            return resp
        except requests.exceptions.RequestException as exc:
            if attempt == retries:
                raise
            wait = RETRY_BACKOFF_BASE ** (attempt + 1)
            print(f"  [retry {attempt + 1}/{retries}] {exc} — waiting {wait}s")
            time.sleep(wait)
    raise RuntimeError("unreachable")


def get_json(url: str, params: dict[str, Any] | None = None) -> Any:
    """GET request returning parsed JSON."""
    resp = _request_with_retry("GET", url, headers=HEADERS, params=params)
    return resp.json()


def post_json(url: str, body: dict[str, Any]) -> Any:
    """POST request with JSON body returning parsed JSON."""
    resp = _request_with_retry(
        "POST", url, headers=HEADERS, data=json.dumps(body)
    )
    return resp.json()


def pretty(obj: Any) -> str:
    """Pretty-print a JSON-serializable object."""
    return json.dumps(obj, indent=2, default=str)


# ---------------------------------------------------------------------------
# 1. GA4GH TRS v2 API — simple GET-based listing and filtering
# ---------------------------------------------------------------------------


def trs_get_metadata() -> dict:
    """GET /metadata — service info and supported descriptor types."""
    url = f"{TRS_V2_BASE}/metadata"
    print(f"\n{'='*70}")
    print(f"TRS v2: GET {url}")
    print(f"{'='*70}")
    data = get_json(url)
    print(pretty(data))
    return data


def trs_get_tool_classes() -> list[dict]:
    """GET /toolClasses — available tool classes (Tool, Workflow, etc.)."""
    url = f"{TRS_V2_BASE}/toolClasses"
    print(f"\n{'='*70}")
    print(f"TRS v2: GET {url}")
    print(f"{'='*70}")
    data = get_json(url)
    print(pretty(data))
    return data


def trs_search_tools(
    descriptor_type: str | None = None,
    tool_class: str = "Workflow",
    organization: str | None = None,
    description: str | None = None,
    author: str | None = None,
    checker: bool | None = None,
    limit: int = 10,
    offset: str | None = None,
) -> list[dict]:
    """
    GET /tools — list/search tools with query-parameter filters.

    This is the standard GA4GH TRS v2 endpoint. It supports basic filtering
    but does NOT support full-text search or faceted aggregations.

    Parameters
    ----------
    descriptor_type : One of CWL, WDL, NFL, GALAXY, SMK
    tool_class      : "Workflow" or "Tool" (or "Notebook")
    organization    : Filter by source control organization
    description     : Substring match against description
    author          : Substring match against author
    checker         : If True, return only checker workflows
    limit           : Max results per page (default 1000 server-side)
    offset          : Pagination cursor
    """
    url = f"{TRS_V2_BASE}/tools"
    params: dict[str, Any] = {"limit": limit}
    if descriptor_type:
        params["descriptorType"] = descriptor_type
    if tool_class:
        params["toolClass"] = tool_class
    if organization:
        params["organization"] = organization
    if description:
        params["description"] = description
    if author:
        params["author"] = author
    if checker is not None:
        params["checker"] = str(checker).lower()
    if offset:
        params["offset"] = offset

    print(f"\n{'='*70}")
    print(f"TRS v2: GET {url}?{urlencode(params)}")
    print(f"{'='*70}")

    data = get_json(url, params=params)
    print(f"Returned {len(data)} result(s)")
    for entry in data[:3]:
        _print_trs_tool_summary(entry)
    if len(data) > 3:
        print(f"  ... and {len(data) - 3} more")
    return data


def trs_get_tool_detail(tool_id: str) -> dict:
    """GET /tools/{id} — full details for a single tool/workflow."""
    url = f"{TRS_V2_BASE}/tools/{tool_id}"
    print(f"\n{'='*70}")
    print(f"TRS v2: GET {url}")
    print(f"{'='*70}")
    data = get_json(url)
    _print_trs_tool_summary(data)
    return data


def trs_get_tool_versions(tool_id: str) -> list[dict]:
    """GET /tools/{id}/versions — list all versions of a tool/workflow."""
    url = f"{TRS_V2_BASE}/tools/{tool_id}/versions"
    data = get_json(url)
    print(f"  Versions for {tool_id}: {len(data)}")
    for v in data[:5]:
        print(f"    - {v.get('name', '?')} (id={v.get('id', '?')})")
    return data


def _print_trs_tool_summary(tool: dict) -> None:
    """Print a one-line summary of a TRS tool/workflow."""
    tid = tool.get("id", "?")
    name = tool.get("name") or tool.get("toolname") or "unnamed"
    org = tool.get("organization", "?")
    desc_types = set()
    for version in tool.get("versions", []):
        for dt in version.get("descriptor_type", []):
            desc_types.add(dt)
    verified = tool.get("has_checker", False)
    desc = (tool.get("description") or "")[:80]
    print(f"  [{', '.join(sorted(desc_types)) or '?'}] {org}/{name}")
    print(f"    id: {tid}")
    print(f"    checker: {verified}")
    if desc:
        print(f"    desc: {desc}")


# ---------------------------------------------------------------------------
# 2. Dockstore Extended API — Elasticsearch-backed search
# ---------------------------------------------------------------------------


def build_es_query(
    search_term: str | None = None,
    descriptor_types: list[str] | None = None,
    verified_only: bool = False,
    platforms: list[str] | None = None,
    organizations: list[str] | None = None,
    categories: list[str] | None = None,
    labels: list[str] | None = None,
    entry_type: str = "workflow",
    size: int = 10,
    from_: int = 0,
    include_aggregations: bool = True,
) -> dict:
    """
    Build an Elasticsearch Query DSL body for the Dockstore extended search.

    The Dockstore UI sends this to POST /api/api/ga4gh/v2/extended/tools/entry/_search
    which proxies to the underlying Elasticsearch indices for tools, workflows, and notebooks.

    Parameters
    ----------
    search_term        : Free-text search (matched against path, description, authors)
    descriptor_types   : Filter by language: ["CWL", "WDL", "NFL", "GALAXY", "SMK"]
    verified_only      : Only return verified workflows
    platforms          : Filter by verified platform names (e.g. ["Terra", "AnVIL"])
    organizations      : Filter by Dockstore organization names
    categories         : Filter by curated category names
    labels             : Filter by user-applied labels
    entry_type         : "workflow", "tool", or "notebook"
    size               : Number of results to return
    from_              : Offset for pagination
    include_aggregations : Include facet aggregation buckets in response
    """
    must_clauses: list[dict] = []
    filter_clauses: list[dict] = []

    # --- Free-text search across boosted fields ---
    if search_term:
        should_fields = []
        for field, boost in SEARCH_FIELD_BOOSTS.items():
            should_fields.append(
                {"wildcard": {field: {"value": f"*{search_term}*", "boost": boost}}}
            )
        must_clauses.append({"bool": {"should": should_fields, "minimum_should_match": 1}})

    # --- Descriptor type filter (language) ---
    if descriptor_types:
        if len(descriptor_types) == 1:
            filter_clauses.append({"term": {"descriptorType": descriptor_types[0]}})
        else:
            filter_clauses.append(
                {
                    "bool": {
                        "should": [
                            {"term": {"descriptorType": dt}} for dt in descriptor_types
                        ],
                        "minimum_should_match": 1,
                    }
                }
            )

    # --- Verified filter ---
    if verified_only:
        filter_clauses.append({"term": {"verified": True}})

    # --- Platform filter (verified_platforms) ---
    if platforms:
        if len(platforms) == 1:
            filter_clauses.append(
                {"term": {"verified_platforms.keyword": platforms[0]}}
            )
        else:
            filter_clauses.append(
                {
                    "bool": {
                        "should": [
                            {"term": {"verified_platforms.keyword": p}} for p in platforms
                        ],
                        "minimum_should_match": 1,
                    }
                }
            )

    # --- Organization filter ---
    if organizations:
        if len(organizations) == 1:
            filter_clauses.append({"term": {"organization": organizations[0]}})
        else:
            filter_clauses.append(
                {
                    "bool": {
                        "should": [
                            {"term": {"organization": org}} for org in organizations
                        ],
                        "minimum_should_match": 1,
                    }
                }
            )

    # --- Category filter ---
    if categories:
        filter_clauses.append(
            {
                "bool": {
                    "should": [
                        {"term": {"categories.name.keyword": c}} for c in categories
                    ],
                    "minimum_should_match": 1,
                }
            }
        )

    # --- Label filter ---
    if labels:
        filter_clauses.append(
            {
                "bool": {
                    "should": [
                        {"term": {"labels.value.keyword": lb}} for lb in labels
                    ],
                    "minimum_should_match": 1,
                }
            }
        )

    # --- Entry type (workflow vs tool vs notebook) ---
    # The Dockstore UI uses separate Elasticsearch indices per entry type.
    # The extended search proxies to multiple indices. We add a _type filter
    # only if a specific entry type is requested (the API handles routing).
    # Typically the entry type is encoded in the index name, not a field filter.

    # --- Assemble bool query ---
    bool_query: dict[str, Any] = {}
    if must_clauses:
        bool_query["must"] = must_clauses
    if filter_clauses:
        bool_query["filter"] = filter_clauses
    if not bool_query:
        bool_query["must"] = [{"match_all": {}}]

    query: dict[str, Any] = {
        "size": size,
        "from": from_,
        "query": {"bool": bool_query},
    }

    # --- Aggregations for faceted search ---
    if include_aggregations:
        agg_fields = [
            "descriptorType",
            "verified",
            "verified_platforms.keyword",
            "organization",
            "categories.name.keyword",
            "labels.value.keyword",
            "namespace",
            "registry",
            "descriptor_type_versions.keyword",
            "engine_versions.keyword",
        ]
        aggs = {}
        for field in agg_fields:
            agg_name = field.replace(".", "_")
            aggs[agg_name] = {"terms": {"field": field, "size": 100}}
        query["aggs"] = aggs

    return query


def extended_search(
    search_term: str | None = None,
    descriptor_types: list[str] | None = None,
    verified_only: bool = False,
    platforms: list[str] | None = None,
    organizations: list[str] | None = None,
    categories: list[str] | None = None,
    labels: list[str] | None = None,
    size: int = 10,
    from_: int = 0,
) -> dict:
    """
    Search workflows using the Dockstore extended Elasticsearch endpoint.

    POST /api/api/ga4gh/v2/extended/tools/entry/_search

    This endpoint proxies to Elasticsearch and accepts standard ES Query DSL.
    It searches across workflow, tool, and notebook indices.
    """
    url = f"{EXTENDED_BASE}/tools/entry/_search"

    body = build_es_query(
        search_term=search_term,
        descriptor_types=descriptor_types,
        verified_only=verified_only,
        platforms=platforms,
        organizations=organizations,
        categories=categories,
        labels=labels,
        size=size,
        from_=from_,
    )

    print(f"\n{'='*70}")
    print(f"Extended Search: POST {url}")
    print(f"Query body:\n{pretty(body)}")
    print(f"{'='*70}")

    data = post_json(url, body)
    _print_es_results(data)
    return data


def _print_es_results(data: dict) -> None:
    """Print summary of Elasticsearch search results."""
    hits_wrapper = data.get("hits", {})
    total = hits_wrapper.get("total", {})
    if isinstance(total, dict):
        total_count = total.get("value", 0)
    else:
        total_count = total
    hits = hits_wrapper.get("hits", [])

    print(f"\nTotal matches: {total_count}")
    print(f"Returned: {len(hits)}")

    for hit in hits[:5]:
        source = hit.get("_source", {})
        path = source.get("full_workflow_path") or source.get("tool_path", "?")
        desc_type = source.get("descriptorType", "?")
        desc = (source.get("description") or "")[:80]
        verified = source.get("verified", False)
        platforms = source.get("verified_platforms", [])
        org = source.get("organization", "?")
        authors = [a.get("name", "?") for a in source.get("all_authors", [])]

        print(f"\n  [{desc_type}] {path}")
        print(f"    organization: {org}")
        print(f"    verified: {verified}  platforms: {platforms}")
        if authors:
            print(f"    authors: {', '.join(authors[:3])}")
        if desc:
            print(f"    desc: {desc}")

    if len(hits) > 5:
        print(f"\n  ... and {len(hits) - 5} more in this page")

    # Print aggregation buckets if present
    aggs = data.get("aggregations", {})
    if aggs:
        print(f"\n  --- Facet Aggregations ---")
        for agg_name, agg_data in sorted(aggs.items()):
            buckets = agg_data.get("buckets", [])
            if buckets:
                bucket_summary = ", ".join(
                    f"{b['key']}({b['doc_count']})" for b in buckets[:8]
                )
                print(f"  {agg_name}: {bucket_summary}")


# ---------------------------------------------------------------------------
# 3. Convenience functions combining filters
# ---------------------------------------------------------------------------


def search_wdl_workflows(limit: int = 10) -> list[dict]:
    """Find WDL workflows using the TRS API."""
    print("\n" + "#" * 70)
    print("# Searching for WDL workflows (TRS API)")
    print("#" * 70)
    return trs_search_tools(descriptor_type="WDL", limit=limit)


def search_snakemake_workflows(limit: int = 10) -> list[dict]:
    """Find Snakemake workflows using the TRS API."""
    print("\n" + "#" * 70)
    print("# Searching for Snakemake (SMK) workflows (TRS API)")
    print("#" * 70)
    return trs_search_tools(descriptor_type="SMK", limit=limit)


def search_cwl_workflows(limit: int = 10) -> list[dict]:
    """Find CWL workflows using the TRS API."""
    print("\n" + "#" * 70)
    print("# Searching for CWL workflows (TRS API)")
    print("#" * 70)
    return trs_search_tools(descriptor_type="CWL", limit=limit)


def search_nextflow_workflows(limit: int = 10) -> list[dict]:
    """Find Nextflow workflows using the TRS API."""
    print("\n" + "#" * 70)
    print("# Searching for Nextflow (NFL) workflows (TRS API)")
    print("#" * 70)
    return trs_search_tools(descriptor_type="NFL", limit=limit)


def search_galaxy_workflows(limit: int = 10) -> list[dict]:
    """Find Galaxy workflows using the TRS API."""
    print("\n" + "#" * 70)
    print("# Searching for Galaxy workflows (TRS API)")
    print("#" * 70)
    return trs_search_tools(descriptor_type="GALAXY", limit=limit)


def search_workflows_for_terra(size: int = 10) -> dict:
    """
    Find workflows that can be launched on Terra.

    Terra supports WDL workflows. We can also check the verified_platforms
    facet for "Terra" to find workflows specifically verified for that platform.
    """
    print("\n" + "#" * 70)
    print("# Searching for Terra-compatible workflows (Extended API)")
    print("# Terra primarily supports WDL workflows.")
    print("#" * 70)
    return extended_search(
        descriptor_types=["WDL"],
        platforms=["Terra"],
        verified_only=True,
        size=size,
    )


def search_workflows_for_bdc(size: int = 10) -> dict:
    """
    Find workflows exportable to NHLBI BioData Catalyst.

    BDC supports both WDL (via Terra) and CWL (via Seven Bridges).
    """
    print("\n" + "#" * 70)
    print("# Searching for BioData Catalyst-compatible workflows (Extended API)")
    print("# BDC supports WDL (Terra) and CWL (Seven Bridges)")
    print("#" * 70)
    return extended_search(
        descriptor_types=["WDL", "CWL"],
        size=size,
    )


def search_verified_workflows_by_platform(
    platform: str, size: int = 10
) -> dict:
    """
    Find workflows verified on a specific platform.

    Known platforms: Terra, AnVIL, BioData Catalyst, DNAnexus, DNAstack,
                     CGC, Seven Bridges, Galaxy
    """
    print("\n" + "#" * 70)
    print(f"# Searching for workflows verified on: {platform}")
    print("#" * 70)
    return extended_search(
        platforms=[platform],
        verified_only=True,
        size=size,
    )


def discover_available_facets() -> dict:
    """
    Run a match-all query with aggregations to discover all available
    facet values (languages, platforms, organizations, etc.).
    """
    print("\n" + "#" * 70)
    print("# Discovering available facets (aggregation-only query)")
    print("#" * 70)
    return extended_search(size=0)


# ---------------------------------------------------------------------------
# 4. Advanced: paginate through all results
# ---------------------------------------------------------------------------


def paginate_trs_workflows(
    descriptor_type: str | None = None,
    max_pages: int = 3,
    page_size: int = 100,
) -> list[dict]:
    """
    Paginate through TRS workflow listings.

    The TRS API returns a 'next_page' header for pagination.
    """
    print("\n" + "#" * 70)
    desc = descriptor_type or "all"
    print(f"# Paginating TRS workflows (type={desc}, max_pages={max_pages})")
    print("#" * 70)

    all_tools: list[dict] = []
    offset: str | None = None

    for page in range(max_pages):
        url = f"{TRS_V2_BASE}/tools"
        params: dict[str, Any] = {
            "limit": page_size,
            "toolClass": "Workflow",
        }
        if descriptor_type:
            params["descriptorType"] = descriptor_type
        if offset:
            params["offset"] = offset

        resp = _request_with_retry("GET", url, headers=HEADERS, params=params)
        data = resp.json()
        all_tools.extend(data)
        print(f"  Page {page + 1}: {len(data)} results (total so far: {len(all_tools)})")

        # Check for next page via header
        next_page = resp.headers.get("next_page")
        if not next_page or len(data) < page_size:
            print("  No more pages.")
            break
        # Extract offset from next_page URL
        if "offset=" in next_page:
            offset = next_page.split("offset=")[1].split("&")[0]
        else:
            break

    print(f"  Total collected: {len(all_tools)}")
    return all_tools


# ---------------------------------------------------------------------------
# Main demo
# ---------------------------------------------------------------------------


def main() -> None:
    """Run a comprehensive demonstration of Dockstore API capabilities."""
    print("=" * 70)
    print("Dockstore API Exploration")
    print("=" * 70)
    print(f"TRS v2 base:    {TRS_V2_BASE}")
    print(f"Extended base:  {EXTENDED_BASE}")
    print()

    # --- Section 1: TRS v2 basics ---
    print("\n" + "=" * 70)
    print("SECTION 1: GA4GH TRS v2 API — Service Info")
    print("=" * 70)

    trs_get_metadata()
    trs_get_tool_classes()

    # --- Section 2: TRS search by language ---
    print("\n" + "=" * 70)
    print("SECTION 2: TRS v2 API — Search by Descriptor Language")
    print("=" * 70)

    search_wdl_workflows(limit=5)
    search_cwl_workflows(limit=5)
    search_nextflow_workflows(limit=5)
    search_snakemake_workflows(limit=5)
    search_galaxy_workflows(limit=5)

    # --- Section 3: Extended Elasticsearch search ---
    print("\n" + "=" * 70)
    print("SECTION 3: Extended API — Faceted Elasticsearch Search")
    print("=" * 70)

    # 3a. Discover available facets
    discover_available_facets()

    # 3b. Search WDL workflows with free text
    extended_search(
        search_term="single cell",
        descriptor_types=["WDL"],
        size=5,
    )

    # 3c. Search for verified CWL workflows
    extended_search(
        descriptor_types=["CWL"],
        verified_only=True,
        size=5,
    )

    # 3d. Search Nextflow workflows by keyword
    extended_search(
        search_term="RNA-seq",
        descriptor_types=["NFL"],
        size=5,
    )

    # --- Section 4: Platform-specific searches ---
    print("\n" + "=" * 70)
    print("SECTION 4: Platform-Specific Workflow Discovery")
    print("=" * 70)

    search_workflows_for_terra(size=5)
    search_workflows_for_bdc(size=5)
    search_verified_workflows_by_platform("AnVIL", size=5)

    # --- Section 5: Pagination demo ---
    print("\n" + "=" * 70)
    print("SECTION 5: TRS Pagination Demo")
    print("=" * 70)

    paginate_trs_workflows(descriptor_type="WDL", max_pages=2, page_size=5)

    # --- Summary ---
    print("\n" + "=" * 70)
    print("SUMMARY: Dockstore API Capabilities")
    print("=" * 70)
    print("""
Two primary APIs for searching Dockstore workflows:

1. GA4GH TRS v2 (GET /api/api/ga4gh/v2/tools)
   - Standard, interoperable API (works across TRS implementations)
   - Query params: descriptorType, toolClass, organization, author, checker, limit, offset
   - Simple filtering, pagination via headers
   - Best for: programmatic integration, cross-registry queries

2. Dockstore Extended (POST /api/api/ga4gh/v2/extended/tools/entry/_search)
   - Elasticsearch-backed, Dockstore-specific
   - Accepts full ES Query DSL in POST body
   - Rich faceted search: language, verified status, platforms, org, categories, labels
   - Aggregation buckets for building filter UIs
   - Best for: advanced search, faceted filtering, building search interfaces

Supported descriptor languages:
   CWL  — Common Workflow Language
   WDL  — Workflow Description Language
   NFL  — Nextflow
   GALAXY — Galaxy
   SMK  — Snakemake

Platform compatibility (launch-with):
   Terra              — WDL workflows
   AnVIL              — WDL workflows (via Terra)
   BioData Catalyst   — WDL (Terra) + CWL (Seven Bridges)
   DNAnexus           — WDL workflows
   DNAstack           — WDL workflows
   CGC                — CWL workflows
   Galaxy             — Galaxy workflows
""")


if __name__ == "__main__":
    main()
