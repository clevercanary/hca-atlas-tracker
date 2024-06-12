import { FormEvent, ReactNode } from "react";
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
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit?.();
  };
  return (
    <Form className={className} onSubmit={handleSubmit}>
      {children}
    </Form>
  );
};
