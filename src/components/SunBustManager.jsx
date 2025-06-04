import React, { useState } from "react";
import SunburstCHART from "./SunBurstChart"; // Your original component

// Helper to get node by its path
function getNodeByPath(data, pathArray) {
  let current = data;
  for (let i = 1; i < pathArray.length; i++) {
    current = current.children?.find((c) => c.name === pathArray[i]);
    if (!current) return null;
  }
  return current;
}

function updateSelectedNode(data, path, newName, newValue) {
  const newData = structuredClone(data);
  let node = newData;
  for (const name of path.slice(1)) {
    node = node.children?.find((c) => c.name === name);
    if (!node) return data;
  }
  if (newName) node.name = newName;
  if (newValue !== "") node.value = Number(newValue);
  return newData;
}

function deleteSelectedNode(data, path) {
  if (path.length <= 1) return data; // Can't delete root

  const newData = structuredClone(data);
  let node = newData;
  for (let i = 1; i < path.length - 1; i++) {
    node = node.children?.find((c) => c.name === path[i]);
    if (!node) return data;
  }

  node.children = node.children?.filter(
    (c) => c.name !== path[path.length - 1]
  );
  return newData;
}

// Helper to immutably add a child to a selected node
function addChildToSelectedNode(data, selectedPath, newChild) {
  const newData = structuredClone(data);
  let node = newData;

  for (let i = 1; i < selectedPath.length; i++) {
    if (!node.children) {
      // 🛑 If children don't exist at this level, the path is invalid
      return data;
    }

    const child = node.children.find((c) => c.name === selectedPath[i]);

    if (!child) {
      return data;
    }

    node = child;
  }

  // ✅ Add new child even if node had no children (i.e., was a leaf)
  if (!node.children) {
    node.children = [];
    // Remove this node's 'value' if it's now going to have children
    delete node.value;
  }

  node.children.push(newChild);
  return newData;
}

export default function ChartManager({ dataset }) {
  const [data, setData] = useState(dataset);

  const [selectedPath, setSelectedPath] = useState([]);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState("");

  const selectedNode = getNodeByPath(data, selectedPath);

  const handleSegmentClick = (pathArray) => {
    setSelectedPath(pathArray);
  };

  const handleAddChild = () => {
    if (!selectedNode || !newName || !newValue) return;
    const child = { name: newName, value: Number(newValue) };
    const updated = addChildToSelectedNode(data, selectedPath, child);
    setData(updated);
    setNewName("");
    setNewValue("");
  };

  return (
    <div className="flex">
      <div className="w-3/4">
        <SunburstCHART data={data} onSegmentClick={handleSegmentClick} />
      </div>
      <div className="w-1/4 p-4 border-l border-gray-300">
        {selectedNode ? (
          <div className="space-y-4">
            <h2 className="font-bold text-lg">Selected: {selectedNode.name}</h2>

            {/* Add Child */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="New child name"
                className="w-full px-2 py-1 border rounded"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                type="number"
                placeholder="New child value"
                className="w-full px-2 py-1 border rounded"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleAddChild}
              >
                ➕ Add Child
              </button>
            </div>

            {/* Edit Node */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold">Edit Node</h3>
              <input
                type="text"
                placeholder="Edit name"
                className="w-full px-2 py-1 border rounded"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Edit value"
                className="w-full px-2 py-1 border rounded mt-2"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mt-2"
                onClick={() => {
                  const updated = updateSelectedNode(
                    data,
                    selectedPath,
                    editName,
                    editValue
                  );
                  setData(updated);
                  setEditName("");
                  setEditValue("");
                }}
              >
                ✏️ Save Changes
              </button>
            </div>

            {/* Delete Node */}
            <div className="pt-4 border-t">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => {
                  const updated = deleteSelectedNode(data, selectedPath);
                  setData(updated);
                  setSelectedPath([]); // Clear selection after delete
                }}
              >
                🗑️ Delete Node
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Select a segment</p>
        )}
      </div>
    </div>
  );
}
