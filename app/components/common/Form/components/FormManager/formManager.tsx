import { JSX, Fragment } from "react";
import { FormManager as FormManagerProps } from "../../../../../hooks/useFormManager/common/entities";
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
