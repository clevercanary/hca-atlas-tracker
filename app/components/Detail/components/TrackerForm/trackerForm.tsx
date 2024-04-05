import { ReactNode } from "react";
import { Form } from "./trackerForm.styles";

export interface TrackerFormProps {
  children: ReactNode | ReactNode[];
  onSubmit: () => void;
}

export const TrackerForm = ({
  children,
  onSubmit,
}: TrackerFormProps): JSX.Element => {
  return <Form onSubmit={onSubmit}>{children}</Form>;
};
