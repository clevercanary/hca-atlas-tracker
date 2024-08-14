import { LoginButton } from "@databiosphere/findable-ui/lib/components/common/Button/components/LoginButton/loginButton";
import { CheckedIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/CheckedIcon/checkedIcon";
import { GoogleIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/GoogleIcon/googleIcon";
import { UncheckedErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/UncheckedErrorIcon/uncheckedErrorIcon";
import { UncheckedIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/UncheckedIcon/uncheckedIcon";
import { RoundedPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { SectionContent } from "@databiosphere/findable-ui/lib/components/common/Section/section.styles";
import {
  LoginAgreement,
  LoginSection,
  LoginSectionActions,
  LoginText,
  LoginWarning,
  LoginWrapper,
  TermsOfService,
} from "@databiosphere/findable-ui/lib/components/Login/login.styles";
import { Checkbox, Typography } from "@mui/material";
import { ClientSafeProvider } from "next-auth/react";
import { ChangeEvent, ReactNode, useState } from "react";
import { useAuthentication } from "../../hooks/useAuthentication/useAuthentication";
import { NextAuthProviders } from "./common/entities";

export interface LoginProps {
  providers: NextAuthProviders | null;
  termsOfService?: ReactNode;
  text?: ReactNode;
  title: string;
  warning?: ReactNode;
}

export const Login = ({
  providers,
  termsOfService,
  text,
  title,
  warning,
}: LoginProps): JSX.Element => {
  const [isError, setIsError] = useState<boolean>(false);
  const [isInAgreement, setIsInAgreement] = useState<boolean>(!termsOfService);
  const { authenticateUser } = useAuthentication();

  // Authenticates the user, if the user has agreed to the terms of service.
  // If the terms of service are not accepted, set the terms of service error state to true.
  const onAuthenticateUser = (provider: ClientSafeProvider): void => {
    if (!isInAgreement) {
      setIsError(true);
      return;
    }
    authenticateUser(provider.id);
  };

  // Callback fired when the checkbox value is changed.
  // Clears the terms of service error state and sets state isInAgreement with checkbox selected value.
  const handleChange = (changeEvent: ChangeEvent<HTMLInputElement>): void => {
    setIsError(false); // Clears terms of service error state when checkbox is touched.
    setIsInAgreement(changeEvent.target.checked);
  };

  return (
    <LoginWrapper>
      <RoundedPaper>
        <LoginSection>
          <SectionContent>
            <Typography color="ink.main" component="h3" variant="text-heading">
              {title}
            </Typography>
            {text && <LoginText>{text}</LoginText>}
          </SectionContent>
          <LoginSectionActions>
            {termsOfService && (
              <LoginAgreement>
                <Checkbox
                  checkedIcon={<CheckedIcon />}
                  icon={isError ? <UncheckedErrorIcon /> : <UncheckedIcon />}
                  onChange={handleChange}
                />
                <TermsOfService>{termsOfService}</TermsOfService>
              </LoginAgreement>
            )}
            {providers?.google && (
              <LoginButton
                EndIcon={GoogleIcon}
                onClick={onAuthenticateUser.bind(null, providers.google)}
              >
                Google
              </LoginButton>
            )}
            {providers?.["azure-ad"] && (
              <LoginButton
                EndIcon={GoogleIcon}
                onClick={onAuthenticateUser.bind(null, providers["azure-ad"])}
              >
                Azure AD
              </LoginButton>
            )}
          </LoginSectionActions>
        </LoginSection>
      </RoundedPaper>
      {warning && <LoginWarning>{warning}</LoginWarning>}
    </LoginWrapper>
  );
};
