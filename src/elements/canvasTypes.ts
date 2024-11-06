import { CreateReason } from "./Element";
import { ResizeValues } from "./resizeElementTypes";

export type CanvasValues = ResizeValues & {
  text: string;
};

export function getInitialText(reason: CreateReason<CanvasValues>) {
  switch (reason.type) {
    case "paste":
    case "load":
      return reason.values.text;
    case "user-place":
      return "";
  }
}
