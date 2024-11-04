import { FC } from "react";

export type ElementProps = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  editing: boolean;
};

export type ElementComponent = FC<ElementProps>;
