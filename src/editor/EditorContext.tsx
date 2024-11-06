import { createContext, useContext } from "react";
import { editorTabs, EditorTabType } from "./editorTabs";

export type EditorContextType = {
  elements: [string, JSX.Element][];
  selectedElement: string | null;
  selectedElements: string[];
  setSelectedElements: (id: string[]) => void;
  addElement: (id: string, element: JSX.Element) => void;
  removeElement: (id: string) => void;
  selectedTab: EditorTabType;
  setSelectedTab: (tab: EditorTabType) => void;
  pasteCount: number;
};

export const EditorContext = createContext<EditorContextType>({
  elements: [],
  selectedElement: null,
  selectedElements: [],
  setSelectedElements: () => {},
  addElement: () => {},
  removeElement: () => {},
  selectedTab: editorTabs[0],
  setSelectedTab: () => {},
  pasteCount: 0,
});

export function useEditorContext() {
  return useContext(EditorContext);
}
