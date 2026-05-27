import { PathParameter } from "../../../../../../../../../../common/entities";
import { BackOrigin } from "../../constants";

export interface ResolveBackPathInput {
  origin: BackOrigin | undefined;
  pathParameter: PathParameter;
}
