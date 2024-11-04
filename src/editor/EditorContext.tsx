import { createContext, useContext } from "react";
import { editorTabs, EditorTabType } from "./editorTabs";

export type EditorContextType = {
  elements: [string, JSX.Element][];
  selectedElements: string[];
  setSelectedElements: (id: string[]) => void;
  addElement: (id: string, element: JSX.Element) => void;
  removeElement: (id: string) => void;
  selectedTab: EditorTabType;
  setSelectedTab: (tab: EditorTabType) => void;
};

export const EditorContext = createContext<EditorContextType>({
  elements: [],
  selectedElements: [],
  setSelectedElements: () => {},
  addElement: () => {},
  removeElement: () => {},
  selectedTab: editorTabs[0],
  setSelectedTab: () => {},
});

export function useEditorContext() {
  return useContext(EditorContext);
}
