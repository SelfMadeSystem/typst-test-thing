import { FC } from "react";
import { Vec2 } from "../utils";

type Val = string | number | boolean | Vec2;

export type ElementValues = Record<string, Val | Val[]>;

export type UserPlaceReason = {
  type: "user-place";
  mouse: Vec2;
};

export type CreateReason<V extends ElementValues> =
  | UserPlaceReason
  | {
      type: "paste";
      values: V;
    }
  | {
      type: "load";
      values: V;
    };

export type ElementProps<V extends ElementValues> = {
  id: string;
  reason: CreateReason<V>;
};

export type ElementComponent<V extends ElementValues> = FC<ElementProps<V>>;
