import {
  VERDICT_LABEL,
  VERDICTS,
} from "@/app/views/AtlasStatusView/components/CurationReport/constants";
import {
  type CurationFile,
  VERDICT,
  type Verdict,
} from "@/app/views/AtlasStatusView/components/CurationReport/types";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import { type SummarySegment } from "./types";

/**
 * A status chip's light tone, deepened toward its main tone so the line reads stronger than the chips.
 * @param light - Light tone.
 * @param main - Main tone of the same family.
 * @param share - Share of the main tone, in percent.
 * @returns CSS color.
 */
const deepen = (light: string, main: string, share = 40): string =>
  `color-mix(in srgb, ${main} ${share}%, ${light})`;

const VERDICT_TONE: Record<Verdict, string> = {
  [VERDICT.NEEDS_WORK]: deepen(PALETTE.ALERT_LIGHT, PALETTE.ALERT_MAIN),
  [VERDICT.NOT_STARTED]: PALETTE.SMOKE_DARK,
  [VERDICT.PUBLISHING_STEPS]: deepen(PALETTE.SMOKE_DARK, PALETTE.INK_LIGHT, 30),
  [VERDICT.READY]: deepen(PALETTE.SUCCESS_LIGHT, PALETTE.SUCCESS_MAIN),
};

/**
 * Segments of files by state, from ready to not started.
 * @param files - Files.
 * @returns Summary segments.
 */
export function getFileSegments(files: CurationFile[]): SummarySegment[] {
  return VERDICTS.map((verdict) => ({
    color: VERDICT_TONE[verdict],
    count: files.filter((file) => file.verdict === verdict).length,
    label: VERDICT_LABEL[verdict],
  }));
}
