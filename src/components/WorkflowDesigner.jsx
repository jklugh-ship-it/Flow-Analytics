import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { useAnalyticsStore } from "../store/useAnalyticsStore";

export default function WorkflowDesigner() {
  const workflowStates = useAnalyticsStore((s) => s.workflowStates);
  const setWorkflowStates = useAnalyticsStore((s) => s.setWorkflowStates);
  const workflowVisibility = useAnalyticsStore((s) => s.workflowVisibility);
  const toggleVisibility = useAnalyticsStore((s) => s.toggleWorkflowVisibility);

  const [newStateName, setNewStateName] = useState("");
  const [mergeSelection, setMergeSelection] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  );

  // -------------------------------------------------------
  // DRAG END → reorder workflow states
  // -------------------------------------------------------
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = workflowStates.indexOf(active.id);
    const newIndex = workflowStates.indexOf(over.id);

    const reordered = arrayMove(workflowStates, oldIndex, newIndex);
    setWorkflowStates(reordered);
  };

  // -------------------------------------------------------
  // ADD NEW STATE
  // -------------------------------------------------------
  const handleAddState = () => {
    const name = newStateName.trim();
    if (!name) return;

    if (workflowStates.includes(name)) {
      alert("State already exists");
      return;
    }

    setWorkflowStates([...workflowStates, name]);
    setNewStateName("");
  };

  // -------------------------------------------------------
  // DELETE STATE
  // -------------------------------------------------------
  const handleDelete = (state) => {
    if (!window.confirm(`Remove state "${state}"?`)) return;

    const updated = workflowStates.filter((s) => s !== state);
    setWorkflowStates(updated);
  };

  // -------------------------------------------------------
  // MERGE STATES
  // -------------------------------------------------------
  const handleMerge = () => {
    if (mergeSelection.length < 2) {
      alert("Select at least two states to merge");
      return;
    }

    const newName = prompt(
      `Merge ${mergeSelection.join(", ")} into what name?`,
      mergeSelection[0]
    );

    if (!newName) return;

    const updated = workflowStates
      .filter((s) => !mergeSelection.includes(s))
      .concat(newName);

    setWorkflowStates(updated);
    setMergeSelection([]);
  };

  const toggleMergeSelect = (state) => {
    setMergeSelection((prev) =>
      prev.includes(state)
        ? prev.filter((s) => s !== state)
        : [...prev, state]
    );
  };

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: 8 }}>
      <h2 style={{ marginBottom: "1rem" }}>Workflow Designer</h2>

      {/* ADD NEW STATE */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="New state name"
          value={newStateName}
          onChange={(e) => setNewStateName(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={handleAddState}>Add</button>
      </div>

      {/* MERGE STATES */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          disabled={mergeSelection.length < 2}
          onClick={handleMerge}
          style={{
            opacity: mergeSelection.length < 2 ? 0.5 : 1,
            cursor: mergeSelection.length < 2 ? "not-allowed" : "pointer"
          }}
        >
          Merge Selected
        </button>
      </div>

      {/* DRAGGABLE LIST */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={workflowStates}
          strategy={verticalListSortingStrategy}
        >
          {workflowStates.map((state) => (
            <SortableItem key={state} id={state}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  background: "#fafafa",
                  marginBottom: "0.5rem"
                }}
              >
                {/* Merge selection checkbox */}
                <input
                  type="checkbox"
                  checked={mergeSelection.includes(state)}
                  onChange={() => toggleMergeSelect(state)}
                />

                {/* State name */}
                <strong style={{ flex: 1 }}>{state}</strong>

                {/* Visibility toggle */}
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={workflowVisibility[state]}
                    onChange={() => toggleVisibility(state)}
                  />
                  <span style={{ marginLeft: 4 }}>Visible</span>
                </label>

                {/* Delete */}
                <button onClick={() => handleDelete(state)}>Delete</button>
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}