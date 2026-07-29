import { FormManager as FormManagerProps } from "@/app/hooks/useFormManager/common/entities";
import { Fragment, JSX } from "react";
import { Banner } from "./components/Banner/banner";
import { Popup } from "./components/Popup/popup";

export const FormManager = ({
  ...formManager
}: FormManagerProps): JSX.Element => {
  return (
    <Fragment>
      <Banner {...formManager} />
      <Popup {...formManager} />
    </Fragment>
  );
};
