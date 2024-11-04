import { CircleElement } from "../elements/CircleElement";
import { ElementComponent } from "../elements/Element";
import { RectElement } from "../elements/RectElement";
import { TypstElement } from "../elements/TypstElement";

export type EditorTabType = {
  element: ElementComponent,
  width: number,
  height: number,
  name: string,
  icon: string,
}

export const editorTabs: EditorTabType[] = [
  {
    element: TypstElement,
    width: 200,
    height: 100,
    name: "Typst",
    icon: "📝",
  },
  {
    element: RectElement,
    width: 0,
    height: 0,
    name: "Rect",
    icon: "🔲",
  },
  {
    element: CircleElement,
    width: 0,
    height: 0,
    name: "Circle",
    icon: "⚪",
  }
]
