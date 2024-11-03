import { createContext, useContext } from "react";

export type EditorContextType = {
  elements: [string, JSX.Element][];
  selectedElements: string[];
  setSelectedElements: (id: string[]) => void;
  addElement: (id: string, element: JSX.Element) => void;
  removeElement: (id: string) => void;
};

export const EditorContext = createContext<EditorContextType>({
  elements: [],
  selectedElements: [],
  setSelectedElements: () => {},
  addElement: () => {},
  removeElement: () => {},
});

export function useEditorContext() {
  return useContext(EditorContext);
}
