import { EditorContext } from "./EditorContext";
import { useEffect, useState } from "react";
import { SvgThing } from "../SvgThing";

export function EditorProvider() {
  const [elements, setElements] = useState<[string, JSX.Element][]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

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
      const width = 200;
      const height = 100;
      const newId = Math.random().toString(36).substring(2, 9);
      setElements((elements) => [
        ...elements,
        [
          newId,
          <SvgThing
            id={newId}
            x={event.clientX - width / 2}
            y={event.clientY - height / 2}
            width={width}
            height={height}
          />,
        ],
      ]);
      setSelectedElements([newId]);
    }

    window.addEventListener("dblclick", newThing);

    return () => {
      window.removeEventListener("dblclick", newThing);
    };
  }, []);

  return (
    <EditorContext.Provider
      value={{
        selectedElements,
        setSelectedElements: handleSelectElements,
        elements,
        addElement,
        removeElement,
      }}
    >
      {elements.map(([id, element]) => (
        <div key={id}>{element}</div>
      ))}
    </EditorContext.Provider>
  );
}
