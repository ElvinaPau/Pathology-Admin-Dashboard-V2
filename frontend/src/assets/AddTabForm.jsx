import React, { useState } from "react";
import "../css/AddTabForm.css";
import BasicForm from "./BasicForm";
import LabTestForm from "./LabTestForm";
import ContainerForm from "./ContainerForm";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function AddTabForm({ onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    infoType: "Basic",
    basics: [[]], // each element = one BasicForm
  });

  // Add new empty BasicForm
  const addBasicForm = () => {
    setFormData({
      ...formData,
      basics: [...formData.basics, []],
    });
  };

  // Handle drag reorder
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(formData.basics);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setFormData({ ...formData, basics: items });
  };

  return (
    <div>
      {/* Test / Tab Information */}
      <div className="add-form-container">
        <h2>Test / Tab Information</h2>

        <div className="add-form-group">
          <label>Test / Tab Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="side-by-side">
          <div className="add-form-group">
            <label>Category *</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            >
              <option value="">Select</option>
              <option value="blood">Blood</option>
              <option value="urine">Urine</option>
            </select>
          </div>

          <div className="add-form-group">
            <label>Info Type *</label>
            <select
              value={formData.infoType}
              onChange={(e) =>
                setFormData({ ...formData, infoType: e.target.value })
              }
              required
            >
              <option value="Basic">Basic</option>
              <option value="Lab Test">Lab Test</option>
              <option value="Container">Container</option>
            </select>
          </div>
        </div>
      </div>

      {/* ✅ Render draggable BasicForms OUTSIDE */}
      {formData.infoType === "Basic" && (
        <div className="basic-form-section">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="basics">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {formData.basics.map((group, index) => (
                    <Draggable
                      key={index}
                      draggableId={`basic-${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="draggable-form"
                        >
                          <BasicForm
                            basics={group}
                            setBasics={(updated) => {
                              const newBasics = [...formData.basics];
                              newBasics[index] = updated;
                              setFormData({ ...formData, basics: newBasics });
                            }}
                            isFirst={index === 0}
                            onRemove={() => {
                              setFormData({
                                ...formData,
                                basics: formData.basics.filter(
                                  (_, i) => i !== index
                                ),
                              });
                            }}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* ➕ Add button */}
          <button type="button" className="add-form-btn" onClick={addBasicForm}>
            + Add Another Basic Form
          </button>
        </div>
      )}

      {/* ✅ Render draggable LabTestForm OUTSIDE */}
      {formData.infoType === "Lab Test" && (
        <div className="basic-form-section">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="basics">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {formData.basics.map((group, index) => (
                    <Draggable
                      key={index}
                      draggableId={`basic-${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="draggable-form"
                        >
                          <LabTestForm
                            basics={group}
                            setBasics={(updated) => {
                              const newBasics = [...formData.basics];
                              newBasics[index] = updated;
                              setFormData({ ...formData, basics: newBasics });
                            }}
                            isFirst={index === 0}
                            onRemove={() => {
                              setFormData({
                                ...formData,
                                basics: formData.basics.filter(
                                  (_, i) => i !== index
                                ),
                              });
                            }}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* ➕ Add button */}
          <button type="button" className="add-form-btn" onClick={addBasicForm}>
            + Add Another Basic Form
          </button>
        </div>
      )}

      {/* ✅ Render draggable ContainerForm OUTSIDE */}
      {formData.infoType === "Container" && (
        <div className="basic-form-section">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="basics">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {formData.basics.map((group, index) => (
                    <Draggable
                      key={index}
                      draggableId={`basic-${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="draggable-form"
                        >
                          <ContainerForm
                            basics={group}
                            setBasics={(updated) => {
                              const newBasics = [...formData.basics];
                              newBasics[index] = updated;
                              setFormData({ ...formData, basics: newBasics });
                            }}
                            isFirst={index === 0}
                            onRemove={() => {
                              setFormData({
                                ...formData,
                                basics: formData.basics.filter(
                                  (_, i) => i !== index
                                ),
                              });
                            }}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* ➕ Add button */}
          <button type="button" className="add-form-btn" onClick={addBasicForm}>
            + Add Another Basic Form
          </button>
        </div>
      )}

    </div>
  );
}

export default AddTabForm;
