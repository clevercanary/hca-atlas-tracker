import { DialogTitle } from "@databiosphere/findable-ui/lib/components/common/Dialog/components/DialogTitle/dialogTitle";
import { useFetchDataState } from "../../../../../../../../../../../hooks/useFetchDataState";
import { FetchDataActionKind } from "../../../../../../../../../../../providers/fetchDataState/fetchDataState";
import { DIALOG_PROPS } from "./constants";
import { StyledDialog } from "./dialog.styles";
import { Props } from "./entities";

export const Dialog = ({ onClose, open }: Props): JSX.Element => {
  const { fetchDataDispatch } = useFetchDataState();
  return (
    <StyledDialog
      {...DIALOG_PROPS}
      onClose={onClose}
      open={open}
      onTransitionEnter={() =>
        fetchDataDispatch({
          payload: undefined,
          type: FetchDataActionKind.FetchData,
        })
      }
    >
      <DialogTitle onClose={onClose} title="Download from HCA Atlas Tracker" />
    </StyledDialog>
  );
};
