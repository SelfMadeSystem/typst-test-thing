import { ElementComponent } from "../elements/Element";
import { RectElement } from "../elements/RectElement";
import { TypstElement } from "../elements/TypstElement";

export type EditorTabType = {
  element: ElementComponent,
  name: string,
  icon: string,
}

export const editorTabs: EditorTabType[] = [
  {
    element: TypstElement,
    name: "Typst",
    icon: "📝",
  },
  {
    element: RectElement,
    name: "Rect",
    icon: "🔲",
  },
]
