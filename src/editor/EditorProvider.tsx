import { EditorContext } from "./EditorContext";
import { useEffect, useState } from "react";
import { editorTabs } from "./editorTabs";
import { EditorTabs } from "./EditorTab";

export function EditorProvider() {
  const [elements, setElements] = useState<[string, JSX.Element][]>([]);
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
    setSelectedElements(ids);

    if (ids.length === 0) {
      return;
    }

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
      const { element: SelectedElement, width, height } = selectedTab;
      setElements((elements) => [
        ...elements,
        [
          newId,
          <SelectedElement
            id={newId}
            x={event.clientX}
            y={event.clientY}
            width={width}
            height={height}
            editing={true}
          />,
        ],
      ]);
      setSelectedElements([newId]);
    }

    window.addEventListener("dblclick", newThing);

    return () => {
      window.removeEventListener("dblclick", newThing);
    };
  }, [selectedTab.element]);

  return (
    <EditorContext.Provider
      value={{
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
