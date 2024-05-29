import { ReactNode } from "react";
import { Form } from "./trackerForm.styles";

export interface TrackerFormProps {
  children: ReactNode | ReactNode[];
  className?: string;
  onSubmit?: () => void;
}

export const TrackerForm = ({
  children,
  className,
  onSubmit,
}: TrackerFormProps): JSX.Element => {
  return (
    <Form className={className} onSubmit={onSubmit}>
      {children}
    </Form>
  );
};
