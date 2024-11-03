import { createContext, useContext } from "react";

export type EditorContextType = {
  elements: [string, JSX.Element][];
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  addElement: (id: string, element: JSX.Element) => void;
  removeElement: (id: string) => void;
};

export const EditorContext = createContext<EditorContextType>({
  elements: [],
  selectedElement: null,
  setSelectedElement: () => {},
  addElement: () => {},
  removeElement: () => {},
});

export function useEditorContext() {
  return useContext(EditorContext);
}
