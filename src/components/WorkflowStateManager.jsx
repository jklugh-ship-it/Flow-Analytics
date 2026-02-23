import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

export default function WorkflowStateManager({
  workflowOrder,
  setWorkflowOrder,
  workflowVisibility,
  setWorkflowVisibility
}) {
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const newOrder = Array.from(workflowOrder);
    const [moved] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, moved);

    setWorkflowOrder(newOrder);
  };

  const toggleVisibility = (state) => {
    setWorkflowVisibility({
      ...workflowVisibility,
      [state]: !workflowVisibility[state]
    });
  };

  if (!workflowOrder.length) return null;

  return (
    <div style={{ marginBottom: "1rem" }}>
      <h3>Workflow States</h3>
      <p style={{ fontSize: "0.9rem" }}>Drag to reorder. Uncheck to hide.</p>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="workflowStates">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {workflowOrder.map((state, index) => (
                <Draggable key={state} draggableId={state} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "8px",
                        border: "1px solid #ccc",
                        marginBottom: "4px",
                        background: "#fafafa",
                        ...provided.draggableProps.style
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={workflowVisibility[state]}
                        onChange={() => toggleVisibility(state)}
                        style={{ marginRight: "8px" }}
                      />

                      <span
                        {...provided.dragHandleProps}
                        style={{ cursor: "grab", userSelect: "none" }}
                      >
                        ☰
                      </span>

                      <span style={{ marginLeft: "8px" }}>{state}</span>
                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}