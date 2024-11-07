import { FC, MutableRefObject } from "react";
import { Vec2 } from "../utils";

type Val = string | number | boolean | Vec2;

export type ElementValues = Record<string, Val | Val[]>;

export type ElementState = {
  values: ElementValues;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type UserPlaceReason = {
  type: "user-place";
  mouse: Vec2;
};

export type PasteReason<V extends ElementValues> = {
  type: "paste";
  values: V;
  pasteCount: number;
};

export type LoadReason<V extends ElementValues> = {
  type: "load";
  values: V;
};

export type CreateReason<V extends ElementValues> =
  | UserPlaceReason
  | PasteReason<V>
  | LoadReason<V>;

export type ElementProps<V extends ElementValues> = {
  id: number;
  reason: CreateReason<V>;
  state: MutableRefObject<V>;
};

export type ElementComponent<V extends ElementValues> = FC<ElementProps<V>>;
