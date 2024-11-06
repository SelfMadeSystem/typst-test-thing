import { CanvasTypstElement } from "../elements/CanvasTypstElement";
import { CircleElement } from "../elements/CircleElement";
import { ElementComponent } from "../elements/Element";
import { LineElement } from "../elements/LineElement";
import { RectElement } from "../elements/RectElement";
import { SvgTypstElement } from "../elements/SvgTypstElement";

export type EditorTabType = {
  element: ElementComponent<never>;
  name: string;
  icon: string;
};

export const editorTabs: EditorTabType[] = [
  {
    element: CanvasTypstElement,
    name: "CTypst",
    icon: "📝",
  },
  {
    element: SvgTypstElement,
    name: "STypst",
    icon: "📝",
  },
  {
    element: LineElement,
    name: "Line",
    icon: "📏",
  },
  {
    element: RectElement,
    name: "Rect",
    icon: "🔲",
  },
  {
    element: CircleElement,
    name: "Circle",
    icon: "⚪",
  },
];
