import {
  KeyValuePairs,
  KeyValuePairsProps,
} from "@clevercanary/data-explorer-ui/lib/components/common/KeyValuePairs/keyValuePairs";
import { SectionTitle } from "@clevercanary/data-explorer-ui/lib/components/common/Section/components/SectionTitle/sectionTitle";
import {
  GridPaperSection,
  SectionContent,
} from "@clevercanary/data-explorer-ui/lib/components/common/Section/section.styles";

export interface DetailProps {
  KeyElType?: KeyValuePairsProps["KeyElType"];
  KeyValueElType?: KeyValuePairsProps["KeyValueElType"];
  keyValuePairs: KeyValuePairsProps["keyValuePairs"];
  KeyValuesElType?: KeyValuePairsProps["KeyValuesElType"];
  title: string;
  ValueElType?: KeyValuePairsProps["ValueElType"];
}

export const Section = ({
  title,
  ...keyValuePairsProps
}: DetailProps): JSX.Element => {
  return (
    <GridPaperSection>
      <SectionContent>
        <SectionTitle title={title} />
        <KeyValuePairs {...keyValuePairsProps} />
      </SectionContent>
    </GridPaperSection>
  );
};
