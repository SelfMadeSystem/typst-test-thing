import { EditorContext } from "./EditorContext";
import { useEffect, useState } from "react";
import { SvgThing } from "../SvgThing";

export function EditorProvider() {
  const [elements, setElements] = useState<[string, JSX.Element][]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  function addElement(id: string, element: JSX.Element) {
    setElements((elements) => [...elements, [id, element]]);
  }

  function removeElement(id: string) {
    setElements((elements) =>
      elements.filter(([elementId]) => elementId !== id)
    );
  }

  function handleSelectElement(id: string | null) {
    setSelectedElement(id);

    if (id) {
      setElements((elements) => {
        const selectedElement = elements.find(([elemId]) => elemId === id);
        if (selectedElement) {
          return [
            ...elements.filter(([elemId]) => elemId !== id),
            selectedElement,
          ];
        }
        return elements;
      });
    }
  }

  useEffect(() => {
    function bgClick(e: MouseEvent) {
      e.preventDefault();
      handleSelectElement(null);
    }

    window.addEventListener("mousedown", bgClick);
  });

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
      setSelectedElement(newId);
    }

    window.addEventListener("dblclick", newThing);

    return () => {
      window.removeEventListener("dblclick", newThing);
    };
  }, []);

  return (
    <EditorContext.Provider
      value={{
        selectedElement,
        setSelectedElement: handleSelectElement,
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
