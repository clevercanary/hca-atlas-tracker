import { type HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type CurationReport } from "@/app/views/AtlasStatusView/components/CurationReport/types";
import { useEffect, useState } from "react";

// Prototype: curation reports come from static fixtures, keyed by atlas short
// name slug and generation, until the tracker stores them. Each loads on
// demand, so atlases without a report don't download it.
const CURATION_REPORT_LOADERS: Record<string, () => Promise<CurationReport>> = {
  "heart-1": () =>
    import("@/app/views/AtlasStatusView/fixtures/heart-1.json").then(
      // Fixture JSON at the module boundary; its shape is CurationReport.
      ({ default: report }) => report as CurationReport,
    ),
};

interface UseCurationReport {
  curationReport?: CurationReport;
  isLoading: boolean;
}

/**
 * Loads the curation report of the given atlas, if one exists.
 * @param atlas - Atlas.
 * @returns Curation report, or undefined, and whether it is still loading.
 */
export const useCurationReport = (
  atlas?: HCAAtlasTrackerAtlas,
): UseCurationReport => {
  const key = atlas && `${atlas.shortNameSlug}-${atlas.generation}`;
  const load = key ? CURATION_REPORT_LOADERS[key] : undefined;
  // The settled load: its report, or none when it failed, so the page can fall back.
  const [loaded, setLoaded] = useState<{
    key: string;
    report?: CurationReport;
  }>();

  useEffect(() => {
    if (!key || !load) return;
    let isActive = true;
    load().then(
      (report) => {
        if (isActive) setLoaded({ key, report });
      },
      (error: unknown) => {
        console.error(`Couldn't load the curation report for ${key}.`, error);
        if (isActive) setLoaded({ key });
      },
    );
    return (): void => {
      isActive = false;
    };
  }, [key, load]);

  const isSettled = loaded?.key === key;
  return {
    curationReport: isSettled ? loaded?.report : undefined,
    isLoading: Boolean(load) && !isSettled,
  };
};
