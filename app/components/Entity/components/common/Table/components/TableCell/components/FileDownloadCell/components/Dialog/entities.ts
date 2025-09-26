import { DialogTitleProps } from "@databiosphere/findable-ui/lib/components/common/Dialog/components/DialogTitle/dialogTitle";
import { DialogProps } from "@mui/material";

export type Props = Omit<DialogProps, "onClose"> &
  Omit<DialogTitleProps, "title">;
