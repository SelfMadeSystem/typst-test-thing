import { useEditorContext } from "./EditorContext";
import { editorTabs, EditorTabType } from "./editorTabs";

function EditorTab({ tab }: { tab: EditorTabType }) {
  const { setSelectedTab, selectedTab } = useEditorContext();

  return (
    <button
      className={`p-2 rounded-md ${
        selectedTab === tab ? "bg-gray-800" : "hover:bg-gray-800"
      } text-white`}
      onClick={() => setSelectedTab(tab)}
    >
      {tab.icon} {tab.name}
    </button>
  );
}

export function EditorTabs() {
  return (
    <div className="flex gap-2 bg-gray-700 p-2">
      {editorTabs.map((tab) => (
        <EditorTab key={tab.name} tab={tab} />
      ))}
    </div>
  );
}
