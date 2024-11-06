import { createContext, useContext } from "react";
import { Vec2 } from "../utils";

type EventMove = {
  type: "move";
} & Vec2;

type EventRotate = {
  type: "rotate";
  around: Vec2;
  angle: number;
}

type EventScale = {
  type: "scale";
  around: Vec2;
  scale: number;
}

type EventDelete = {
  type: "delete";
};

export type EditorEvent = EventMove | EventRotate | EventScale | EventDelete;

export type EventContextType = {
  event: EditorEvent | null;
  setEvent: (event: EditorEvent) => void;
};

export const EventContext = createContext<EventContextType>({
  event: null,
  setEvent: () => {},
});

export function useEventContext() {
  return useContext(EventContext);
}
