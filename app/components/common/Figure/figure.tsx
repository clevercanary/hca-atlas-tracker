import Image from "next/image";
import { JSX } from "react";
import { Figure as FigureWithCaption } from "./figure.styles";

export interface ImageProps {
  alt?: string;
  caption?: string;
  src: string;
}

export const Figure = ({ alt = "", caption, src }: ImageProps): JSX.Element => {
  // `fill` lets MDX authors omit dimensions; figure.styles overrides next's
  // absolute-fill so the image flows at the content-column width.
  return (
    <FigureWithCaption>
      <Image alt={alt} fill sizes="(max-width: 756px) 100vw, 756px" src={src} />
      {caption && <figcaption>{caption}</figcaption>}
    </FigureWithCaption>
  );
};
