import { EditorContext, ElementId } from "./EditorContext";
import {
  createRef,
  Fragment,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { components, editorTabs } from "./editorTabs";
import { EditorTabs } from "./EditorTab";
import {
  ElementState,
  PasteReason,
  UserPlaceReason,
} from "../elements/Element";
import { EditorEvent, EventContext } from "./EventContext";

export function EditorProvider() {
  const count = useRef(0);
  const [elements, setElements] = useState<[ElementId, JSX.Element][]>([]);
  const elementStateById = useRef(
    new Map<ElementId, [string, MutableRefObject<ElementState>]>()
  );
  const [selectedElement, setSelectedElement] = useState<ElementId | null>(null);
  const [selectedElements, setSelectedElements] = useState<ElementId[]>([]);
  const [selectedTab, setSelectedTab] = useState(editorTabs[0]);
  const [event, setEvent] = useState<EditorEvent | null>(null);
  const [pasteCount, setPasteCount] = useState(0);

  function createId() {
    return count.current++;
  }

  function removeElement(id: ElementId) {
    console.log("removeElement", id);
    setElements((elements) =>
      elements.filter(([elementId]) => elementId !== id)
    );
    elementStateById.current.delete(id);

    if (selectedElement === id) {
      setSelectedElement(null);
    }

    setSelectedElements((elements) =>
      elements.filter((elementId) => elementId !== id)
    );
  }

  function handleSelectElements(ids: ElementId[]) {
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
        const state = elementStateById.current.get(selectedElement);
        if (state) copyObject.push([state[0], state[1].current]);
      } else {
        selectedElements.forEach((id) => {
          const state = elementStateById.current.get(id);
          if (state) copyObject.push([state[0], state[1].current]);
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
      const { type, element: SelectedElement } = selectedTab;
      const stateRef = createRef<never>() as MutableRefObject<never>;
      elementStateById.current.set(newId, [type, stateRef]);
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

      const newElements: [ElementId, JSX.Element][] = copyObject
        .map(([type, values]) => {
          if (!(type in components)) {
            return null;
          }

          const Element = components[type as keyof typeof components];
          const newId = createId();
          const stateRef = createRef<never>() as MutableRefObject<never>;
          elementStateById.current.set(newId, [type, stateRef]);
          const reason: PasteReason<never> = {
            type: "paste",
            values: values as never,
            pasteCount,
          };

          return [
            newId,
            <Element id={newId} reason={reason} state={stateRef} />,
          ] satisfies [ElementId, JSX.Element];
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
          <Fragment key={id}>{element}</Fragment>
        ))}
      </EventContext.Provider>
    </EditorContext.Provider>
  );
}
