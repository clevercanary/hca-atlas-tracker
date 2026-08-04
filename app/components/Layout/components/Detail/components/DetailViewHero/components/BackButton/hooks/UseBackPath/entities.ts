import { type PathParameter } from "@/app/common/entities";
import { type BackOrigin } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/BackButton/constants";

export interface ResolveBackPathInput {
  origin: BackOrigin | undefined;
  pathParameter: PathParameter;
}
