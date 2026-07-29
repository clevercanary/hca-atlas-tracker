import { PathParameter } from "@/app/common/entities";
import { BackOrigin } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/BackButton/constants";

export interface ResolveBackPathInput {
  origin: BackOrigin | undefined;
  pathParameter: PathParameter;
}
