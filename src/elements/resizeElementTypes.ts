import { Satisfies } from "../utils";
import { ElementValues, CreateReason } from "./Element";

export type SizeInfo = {
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
};

export type ResizeValues = Satisfies<
  ElementValues,
  {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }
>;

export function getInitialSizeInfo<V extends ResizeValues>(
  reason: CreateReason<V>,
  defaultWidth = 0,
  defaultHeight = 0
): SizeInfo {
  switch (reason.type) {
    case "user-place":
      return {
        x: reason.mouse.x,
        y: reason.mouse.y,
        width: defaultWidth,
        height: defaultHeight,
        rotation: 0,
      };
    case "paste":
      return {
        x: reason.values.x + 10,
        y: reason.values.y + 10,
        width: reason.values.width,
        height: reason.values.height,
        rotation: reason.values.rotation,
      };
    case "load":
      return {
        x: reason.values.x,
        y: reason.values.y,
        width: reason.values.width,
        height: reason.values.height,
        rotation: reason.values.rotation,
      };
  }
}
