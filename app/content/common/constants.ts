import {
  LayoutStyle,
  PANEL_BACKGROUND_COLOR,
} from "@databiosphere/findable-ui/lib/components/Layout/components/ContentLayout/common/entities";
import * as C from "../../components";
import { Breadcrumbs } from "../../components/common/Content/components/Breadcrumbs/breadcrumbs.styles";
import { getContentScope, getContentURL } from "./utils";

export const CONTENT_FOLDER_NAME = "content";

export const LAYOUT_STYLE_NO_CONTRAST_DEFAULT: LayoutStyle = {
  content: PANEL_BACKGROUND_COLOR.DEFAULT,
  navigation: PANEL_BACKGROUND_COLOR.DEFAULT,
  outline: PANEL_BACKGROUND_COLOR.DEFAULT,
};

export const MDX_COMPONENTS = {
  Breadcrumbs,
  a: ({ ...props }): JSX.Element =>
    C.Link({ label: props.children, url: getContentURL(props.href) }),
};

const MDX_SCOPE = { ...getContentScope() };

export const SERIALIZE_OPTIONS = {
  mdxOptions: {
    development: false, // See https://github.com/hashicorp/next-mdx-remote/issues/307#issuecomment-1363415249 and https://github.com/hashicorp/next-mdx-remote/issues/307#issuecomment-1378362096.
    rehypePlugins: [],
    remarkPlugins: [],
  },
  scope: { ...MDX_SCOPE },
};
