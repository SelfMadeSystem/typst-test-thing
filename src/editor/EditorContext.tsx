import { createContext, useContext } from "react";
import { editorTabs, EditorTabType } from "./editorTabs";

export type ElementId = number;

export type EditorContextType = {
  selectedElement: ElementId | null;
  selectedElements: ElementId[];
  setSelectedElements: (id: ElementId[]) => void;
  removeElement: (id: ElementId) => void;
  selectedTab: EditorTabType;
  setSelectedTab: (tab: EditorTabType) => void;
  pasteCount: number;
};

export const EditorContext = createContext<EditorContextType>({
  selectedElement: null,
  selectedElements: [],
  setSelectedElements: () => {},
  removeElement: () => {},
  selectedTab: editorTabs[0],
  setSelectedTab: () => {},
  pasteCount: 0,
});

export function useEditorContext() {
  return useContext(EditorContext);
}
