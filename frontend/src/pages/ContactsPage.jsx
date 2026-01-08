import React, { useState, useEffect, useRef } from "react";
import "../css/ContactsPage.css";
import HomePageHeader from "../assets/HomePageHeader";
import { useNavigation } from "../context/NavigationContext";
import BasicForm from "../assets/BasicForm";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";

const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
  Math.random().toString(36).slice(2, 9);

function reorder(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

function ContactsPage() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
  const { isNavExpanded } = useNavigation();

  const [contacts, setContacts] = useState([]);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const lastFormRef = useRef(null);
  const API_URL = `${API_BASE}/api/contacts`;

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get(API_URL);
        const data = res.data;
        if (Array.isArray(data)) {
          const mapped = data.map((item) => ({
            id: item.id,
            fields: {
              title: item.title || "",
              description: item.description || "",
              image: item.image || null,
            },
            position: item.position,
          }));
          setContacts(
            mapped.sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999))
          );
        }
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    };
    fetchContacts();
  }, []);

  // Add new
  const addContactForm = () => {
    const newContact = {
      id: uid(),
      fields: { title: "", description: "", image: null },
      isNew: true,
    };
    setContacts((prev) => [...prev, newContact]);

    setTimeout(() => {
      lastFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      if (lastFormRef.current) {
        lastFormRef.current.classList.add("newly-added");
        setTimeout(
          () => lastFormRef.current?.classList.remove("newly-added"),
          1200
        );
      }
    }, 100);
  };

  // Remove contact
  const handleRemove = async (index) => {
    const contact = contacts[index];
    if (!window.confirm("Are you sure you want to remove this contact?"))
      return;

    if (typeof contact.id === "number") {
      try {
        await axios.delete(`${API_URL}/${contact.id}`);
      } catch (err) {
        console.error("Error deleting contact:", err);
      }
    }
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  // Reorder
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    setContacts(
      reorder(contacts, result.source.index, result.destination.index)
    );
  };

  // Save all
  const handleSaveAll = async () => {
    try {
      for (let i = 0; i < contacts.length; i++) {
        const c = contacts[i];
        const contactData = {
          title: c.fields.title || "",
          description: c.fields.description,
          position: i + 1,
        };

        if (typeof c.id === "number") {
          await axios.put(`${API_URL}/${c.id}`, contactData);
        } else {
          const res = await axios.post(API_URL, contactData);
          if (res.data.id) c.id = res.data.id;
        }
      }

      alert("Contacts saved successfully!");
      setIsPreviewMode(true);
    } catch (err) {
      console.error("Error saving contacts:", err);
      alert("Failed to save contacts.");
    }
  };

  return (
    <div className={`home-page-content ${isNavExpanded ? "Nav-Expanded" : ""}`}>
      <HomePageHeader />

      {isPreviewMode ? (
        // Preview section
        <div className="prev-header">
          <div className="prev-header-title">
            <div className="prev-page-title">Contact Information</div>
          </div>

          <div className="preview-contact-cards-container">
            {contacts.length > 0 ? (
              contacts.map((contact, index) => {
                const c = contact.fields || {};
                const imageSrc =
                  c.image && typeof c.image === "string"
                    ? c.image.startsWith("http")
                      ? c.image
                      : `${API_BASE}${c.image}`
                    : null;

                return (
                  <div key={index} className="preview-info-card">
                    {c.title?.trim() && (
                      <h2 className="preview-card-title">{c.title}</h2>
                    )}

                    {c.description && (
                      <div
                        className="preview-card-section rich-text-content"
                        dangerouslySetInnerHTML={{ __html: c.description }}
                      />
                    )}

                    {imageSrc && (
                      <div className="preview-card-section">
                        <img
                          src={imageSrc}
                          alt="contact"
                          style={{ maxWidth: "250px", marginTop: "10px" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p>No contacts available</p>
            )}
          </div>

          <div className="preview-edit-btn-wrapper">
            <button
              className="save-all-btn"
              onClick={() => setIsPreviewMode(false)}
            >
              Edit Contacts
            </button>
          </div>
        </div>
      ) : (
        // Edit section
        <div className="form-page-wrapper">
          <div className="table-title">
            <div className="home-title">
              <div>Manage Contacts</div>
            </div>
          </div>
          <div className="add-form-container">
            <h2>Contact Information</h2>
            <p>You can add, edit, reorder, or remove contact sections below.</p>
          </div>

          <div className="basic-form-section">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="contacts">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {contacts.map((contact, index) => (
                      <Draggable
                        key={contact.id}
                        draggableId={String(contact.id)}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={
                              index === contacts.length - 1
                                ? (el) => {
                                    lastFormRef.current = el;
                                    provided.innerRef(el);
                                  }
                                : provided.innerRef
                            }
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="draggable-form"
                          >
                            <BasicForm
                              fields={contact.fields}
                              setFields={(updated) =>
                                setContacts((prev) =>
                                  prev.map((c, i) =>
                                    i === index ? { ...c, fields: updated } : c
                                  )
                                )
                              }
                              onRemove={() => handleRemove(index)}
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

            <div className="form-buttons">
              <button className="add-form-btn" onClick={addContactForm}>
                + Add Contact
              </button>
              <button className="save-all-btn" onClick={handleSaveAll}>
                Save & Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactsPage;
