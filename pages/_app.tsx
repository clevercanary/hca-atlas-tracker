import "@databiosphere/findable-ui";
import { AzulEntitiesStaticResponse } from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import { Error } from "@databiosphere/findable-ui/lib/components/Error/error";
import { ErrorBoundary } from "@databiosphere/findable-ui/lib/components/ErrorBoundary";
import { Head } from "@databiosphere/findable-ui/lib/components/Head/head";
import { AppLayout } from "@databiosphere/findable-ui/lib/components/Layout/components/AppLayout/appLayout.styles";
import { Floating } from "@databiosphere/findable-ui/lib/components/Layout/components/Floating/floating";
import { Footer } from "@databiosphere/findable-ui/lib/components/Layout/components/Footer/footer";
import { Header as DXHeader } from "@databiosphere/findable-ui/lib/components/Layout/components/Header/header";
import { Main as DXMain } from "@databiosphere/findable-ui/lib/components/Layout/components/Main/main";
import { AuthProvider } from "@databiosphere/findable-ui/lib/providers/authentication";
import { ConfigProvider as DXConfigProvider } from "@databiosphere/findable-ui/lib/providers/config";
import { ExploreStateProvider } from "@databiosphere/findable-ui/lib/providers/exploreState";
import { FileManifestStateProvider } from "@databiosphere/findable-ui/lib/providers/fileManifestState";
import { LayoutStateProvider } from "@databiosphere/findable-ui/lib/providers/layoutState";
import { SystemStatusProvider } from "@databiosphere/findable-ui/lib/providers/systemStatus";
import { createAppTheme } from "@databiosphere/findable-ui/lib/theme/theme";
import { DataExplorerError } from "@databiosphere/findable-ui/lib/types/error";
import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { config } from "app/config/config";
import { NextPage } from "next";
import type { AppProps } from "next/app";
import { AuthorizationProvider } from "../app/providers/authorization";

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export interface PageProps extends AzulEntitiesStaticResponse {
  pageTitle?: string;
}

export type NextPageWithComponent = NextPage & {
  Main?: typeof DXMain;
};

export type AppPropsWithComponent = AppProps & {
  Component: NextPageWithComponent;
};

function MyApp({ Component, pageProps }: AppPropsWithComponent): JSX.Element {
  // Set up the site configuration, layout and theme.
  const appConfig = config();
  const { layout, redirectRootToPath, themeOptions } = appConfig;
  const { floating, footer, header } = layout || {};
  const theme = createAppTheme(themeOptions);
  const { entityListType, pageTitle } = pageProps as PageProps;
  const Main = Component.Main || DXMain;

  return (
    <EmotionThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <DXConfigProvider config={appConfig} entityListType={entityListType}>
          <Head pageTitle={pageTitle} />
          <CssBaseline />
          <SystemStatusProvider>
            <AuthProvider sessionTimeout={SESSION_TIMEOUT}>
              <AuthorizationProvider>
                <LayoutStateProvider>
                  <AppLayout>
                    <DXHeader {...header} />
                    <ExploreStateProvider entityListType={entityListType}>
                      <FileManifestStateProvider>
                        <Main>
                          <ErrorBoundary
                            fallbackRender={({
                              error,
                              reset,
                            }: {
                              error: DataExplorerError;
                              reset: () => void;
                            }): JSX.Element => (
                              <Error
                                errorMessage={error.message}
                                requestUrlMessage={error.requestUrlMessage}
                                rootPath={redirectRootToPath}
                                onReset={reset}
                              />
                            )}
                          >
                            <Component {...pageProps} />
                            <Floating {...floating} />
                          </ErrorBoundary>
                        </Main>
                      </FileManifestStateProvider>
                    </ExploreStateProvider>
                    <Footer {...footer} />
                  </AppLayout>
                </LayoutStateProvider>
              </AuthorizationProvider>
            </AuthProvider>
          </SystemStatusProvider>
        </DXConfigProvider>
      </ThemeProvider>
    </EmotionThemeProvider>
  );
}

export default MyApp;
