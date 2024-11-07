import { CanvasTypstElement } from "../elements/CanvasTypstElement";
import { CircleElement } from "../elements/CircleElement";
import { ElementComponent } from "../elements/Element";
import { LineElement } from "../elements/LineElement";
import { RectElement } from "../elements/RectElement";
import { SvgTypstElement } from "../elements/SvgTypstElement";

export type EditorTabType = {
  element: ElementComponent<never>;
  type: string;
  name: string;
  icon: string;
};

export const components = {
  canvasTypst: CanvasTypstElement,
  svgTypst: SvgTypstElement,
  circle: CircleElement,
  line: LineElement,
  rect: RectElement,
};

export const editorTabs: EditorTabType[] = [
  {
    element: CanvasTypstElement,
    type: "canvasTypst",
    name: "CTypst",
    icon: "📝",
  },
  {
    element: SvgTypstElement,
    type: "svgTypst",
    name: "STypst",
    icon: "📝",
  },
  {
    element: LineElement,
    type: "line",
    name: "Line",
    icon: "📏",
  },
  {
    element: RectElement,
    type: "rect",
    name: "Rect",
    icon: "🔲",
  },
  {
    element: CircleElement,
    type: "circle",
    name: "Circle",
    icon: "⚪",
  },
];
