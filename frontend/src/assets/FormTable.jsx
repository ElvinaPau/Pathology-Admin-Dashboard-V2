import React, { useState, useEffect } from "react";
import axios from "axios";
import FormCreate from "./FormCreate";
import { AiOutlineEdit } from "react-icons/ai";
import { MdDeleteOutline, MdRestore, MdDeleteForever } from "react-icons/md";

const FormTable = () => {
  const [forms, setForms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [formToEdit, setFormToEdit] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  const fetchForms = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/forms`);
      setForms(res.data);
    } catch (err) {
      console.error("Error fetching forms:", err.message);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const isRecent = (updated_at) => {
    if (!updated_at) return false;
    const updatedDate = new Date(updated_at);
    const now = new Date();
    const diffInHours = (now - updatedDate) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  // Count forms per status
  const getCount = (status) => {
    if (status === "all")
      return forms.filter((f) => f.status !== "deleted").length;
    if (status === "recent")
      return forms.filter(
        (f) => f.status !== "deleted" && isRecent(f.updated_at)
      ).length;
    if (status === "deleted")
      return forms.filter((f) => f.status === "deleted").length;
    return 0;
  };

  const filteredForms = forms.filter((form) => {
    const matchesTab =
      activeTab === "all"
        ? form.status !== "deleted"
        : activeTab === "recent"
        ? form.status !== "deleted" && isRecent(form.updated_at)
        : form.status === "deleted";

    const matchesSearch =
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (form.link_text?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);

    return matchesTab && matchesSearch;
  });

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this form?")) return;
    await axios.put(`${API_BASE}/api/forms/${id}/delete`);
    fetchForms();
  };

  const handleRecover = async (id) => {
    await axios.put(`${API_BASE}/api/forms/${id}/restore`);
    fetchForms();
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm("This will permanently delete the form. Continue?"))
      return;
    await axios.delete(`${API_BASE}/api/forms/${id}`);
    fetchForms();
  };

  return (
    <div>
      <div className="table-container">
        {/* Tabs */}
        <div className="tabs-row">
          <div className="tabs">
            {["all", "recent", "deleted"].map((status) => (
              <button
                key={status}
                className={activeTab === status ? "active" : ""}
                onClick={() => setActiveTab(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} (
                {getCount(status)})
              </button>
            ))}
          </div>
          <button className="add-btn" onClick={() => setShowCreate(true)}>
            + Add Form
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search forms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Table */}
        <div className="table-scroll">
          <table>
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "35%" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>No</th>
                <th>Field</th>
                <th>Form Title</th>
                <th>Form (Link)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredForms.length > 0 ? (
                filteredForms.map((form, index) => (
                  <tr key={form.id}>
                    <td>{index + 1}</td>
                    <td>{form.field}</td>
                    <td>{form.title}</td>
                    <td>
                      {form.form_url ? (
                        <a
                          href={form.form_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "blue",
                            textDecoration: "underline",
                          }}
                        >
                          {form.link_text || "Open Form"}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <div className="action-icons">
                        {form.status === "deleted" ? (
                          <>
                            <MdRestore
                              className="icon-recover"
                              title="Recover"
                              onClick={() => handleRecover(form.id)}
                            />
                            <MdDeleteForever
                              className="icon-permanent-delete"
                              title="Permanent Delete"
                              onClick={() => handlePermanentDelete(form.id)}
                            />
                          </>
                        ) : (
                          <>
                            <AiOutlineEdit
                              className="icon-edit"
                              title="Edit Form"
                              onClick={() => setFormToEdit(form)}
                              style={{ marginRight: "8px" }}
                            />
                            <MdDeleteOutline
                              className="icon-delete"
                              title="Soft Delete"
                              onClick={() => handleSoftDelete(form.id)}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>No forms found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreate && (
        <FormCreate
          onClose={() => setShowCreate(false)}
          onSuccess={fetchForms}
        />
      )}

      {formToEdit && (
        <FormCreate
          formToEdit={formToEdit}
          onClose={() => setFormToEdit(null)}
          onSuccess={() => {
            setFormToEdit(null);
            fetchForms();
          }}
        />
      )}
    </div>
  );
};

export default FormTable;
