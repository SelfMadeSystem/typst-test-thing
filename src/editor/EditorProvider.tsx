import { EditorContext } from "./EditorContext";
import { useEffect, useState } from "react";
import { editorTabs } from "./editorTabs";
import { EditorTabs } from "./EditorTab";
import { UserPlaceReason } from "../elements/Element";

export function EditorProvider() {
  const [elements, setElements] = useState<[string, JSX.Element][]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState(editorTabs[0]);

  function addElement(id: string, element: JSX.Element) {
    setElements((elements) => [...elements, [id, element]]);
  }

  function removeElement(id: string) {
    setElements((elements) =>
      elements.filter(([elementId]) => elementId !== id)
    );
  }

  function handleSelectElements(ids: string[]) {
    if (ids.length === 0) {
      setSelectedElements([]);
      setSelectedElement(null);
      return;
    }

    if (ids.length === 1) {
      setSelectedElement(ids[0]);
      setSelectedElements([]);
      return;
    }
    setSelectedElements(ids);

    setElements((elements) => {
      const selectedElements = elements.filter(([id]) => ids.includes(id));
      const restElements = elements.filter(([id]) => !ids.includes(id));

      return [...restElements, ...selectedElements];
    });
  }

  useEffect(() => {
    function bgClick(e: MouseEvent) {
      e.preventDefault();
      handleSelectElements([]);
    }

    window.addEventListener("mousedown", bgClick);
  }, []);

  useEffect(() => {
    function newThing(event: MouseEvent) {
      event.preventDefault();
      const newId = Math.random().toString(36).substring(2, 9);
      const { element: SelectedElement } = selectedTab;
      const reason: UserPlaceReason = {
        type: "user-place",
        mouse: { x: event.clientX, y: event.clientY },
      };
      setElements((elements) => [
        ...elements,
        [newId, <SelectedElement id={newId} reason={reason} />],
      ]);
      setSelectedElements([]);
      setSelectedElement(newId);
    }

    window.addEventListener("dblclick", newThing);

    return () => {
      window.removeEventListener("dblclick", newThing);
    };
  }, [selectedTab]);

  return (
    <EditorContext.Provider
      value={{
        selectedElement,
        selectedElements,
        setSelectedElements: handleSelectElements,
        elements,
        addElement,
        removeElement,
        selectedTab,
        setSelectedTab,
      }}
    >
      <EditorTabs />
      {elements.map(([id, element]) => (
        <div key={id}>{element}</div>
      ))}
    </EditorContext.Provider>
  );
}
