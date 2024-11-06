import { EditorContext } from "./EditorContext";
import {
  createRef,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { components, editorTabs } from "./editorTabs";
import { EditorTabs } from "./EditorTab";
import { PasteReason, UserPlaceReason } from "../elements/Element";
import { createId } from "../utils";
import { EditorEvent, EventContext } from "./EventContext";

export function EditorProvider() {
  const [elements, setElements] = useState<[string, JSX.Element][]>([]);
  const elementStateRef = useRef<
    Record<string, MutableRefObject<[string, never]>>
  >({});
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState(editorTabs[0]);
  const [event, setEvent] = useState<EditorEvent | null>(null);
  const [pasteCount, setPasteCount] = useState(0);

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
    function handleCopy(e: ClipboardEvent) {
      if (e.clipboardData === null) {
        return;
      }

      e.preventDefault();
      const copyObject: [string, unknown][] = [];

      if (selectedElement) {
        const state = elementStateRef.current[selectedElement].current;
        copyObject.push( state);
      } else {
        selectedElements.forEach((id) => {
          const state = elementStateRef.current[id].current;
          copyObject.push(state);
        });
      }

      e.clipboardData.setData("text/plain", JSON.stringify(copyObject));
      setPasteCount(0);
    }

    window.addEventListener("copy", handleCopy);

    return () => {
      window.removeEventListener("copy", handleCopy);
    };
  }, [selectedElement, selectedElements]);

  useEffect(() => {
    function handleElementCreation(event: MouseEvent) {
      event.preventDefault();
      const newId = createId();
      const { element: SelectedElement } = selectedTab;
      const stateRef = createRef<never>() as MutableRefObject<never>;
      elementStateRef.current[newId] = stateRef;
      const reason: UserPlaceReason = {
        type: "user-place",
        mouse: { x: event.clientX, y: event.clientY },
      };
      setElements((elements) => [
        ...elements,
        [
          newId,
          <SelectedElement id={newId} reason={reason} state={stateRef} />,
        ],
      ]);
      setSelectedElements([]);
      setSelectedElement(newId);
    }

    function handlePaste(e: ClipboardEvent) {
      if (e.clipboardData === null) {
        return;
      }

      e.preventDefault();
      const data = e.clipboardData.getData("text/plain");
      const copyObject = JSON.parse(data) as [string, unknown][];

      const newElements: [string, JSX.Element][] = copyObject
        .map(([id, values]) => {
          if (!(id in components)) {
            return null;
          }

          const Element = components[id as keyof typeof components];
          const newId = createId();
          const stateRef = createRef<never>() as MutableRefObject<never>;
          elementStateRef.current[newId] = stateRef;
          const reason: PasteReason<never> = {
            type: "paste",
            values: values as never,
            pasteCount,
          };

          return [
            newId,
            <Element id={newId} reason={reason} state={stateRef} />,
          ] satisfies [string, JSX.Element];
        })
        .filter((element) => element !== null);

      setElements((elements) => [...elements, ...newElements]);
      setSelectedElements([]);
      setSelectedElement(null);
      setPasteCount((count) => count + 1);
    }

    window.addEventListener("dblclick", handleElementCreation);
    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("dblclick", handleElementCreation);
      window.removeEventListener("paste", handlePaste);
    };
  }, [selectedTab, pasteCount]);

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
        pasteCount,
      }}
    >
      <EventContext.Provider
        value={{
          event,
          setEvent,
        }}
      >
        <EditorTabs />
        {elements.map(([id, element]) => (
          <div key={id}>{element}</div>
        ))}
      </EventContext.Provider>
    </EditorContext.Provider>
  );
}
