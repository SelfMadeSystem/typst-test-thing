import { CanvasTypstElement } from "../elements/CanvasTypstElement";
import { CircleElement } from "../elements/CircleElement";
import { ElementComponent } from "../elements/Element";
import { LineElement } from "../elements/LineElement";
import { RectElement } from "../elements/RectElement";
import { SvgTypstElement } from "../elements/SvgTypstElement";

export type EditorTabType = {
  element: ElementComponent;
  width: number;
  height: number;
  name: string;
  icon: string;
};

export const editorTabs: EditorTabType[] = [
  {
    element: CanvasTypstElement,
    width: 200,
    height: 100,
    name: "CTypst",
    icon: "📝",
  },
  {
    element: SvgTypstElement,
    width: 200,
    height: 100,
    name: "STypst",
    icon: "📝",
  },
  {
    element: LineElement,
    width: 50,
    height: 50,
    name: "Line",
    icon: "📏",
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
  },
];
