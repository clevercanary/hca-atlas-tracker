import { FieldValues } from "react-hook-form";
import { TrackerFormSectionProps } from "../../Detail/components/TrackerForm/components/Section/components/TrackerFormSection/trackerFormSection";

export interface SectionConfig<T extends FieldValues, R = undefined>
  extends Omit<TrackerFormSectionProps<T, R>, "formManager" | "formMethod"> {
  showDivider?: boolean;
}
