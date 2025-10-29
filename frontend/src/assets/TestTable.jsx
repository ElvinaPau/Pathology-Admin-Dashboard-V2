import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/TestTable.css";
import { AiOutlineEdit } from "react-icons/ai";
import { MdDeleteOutline, MdRestore, MdDeleteForever } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";

const TestTable = () => {
  const { id } = useParams(); // Category ID
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const isRecent = (updatedAt) => {
    if (!updatedAt) return false;
    const updatedDate = new Date(updatedAt);
    const now = new Date();
    const diffInHours = (now - updatedDate) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  // Fetch tests from backend

  const fetchTests = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/tests?category_id=${id}`
      );
      setTests(res.data);
    } catch (err) {
      console.error("Error fetching tests:", err);
    }
  };
  useEffect(() => {
    fetchTests();
  }, [id]);

  // Count tests per status
  const getCount = (status) => {
    if (status === "all")
      return tests.filter((t) => t.status !== "deleted").length;
    if (status === "recent")
      return tests.filter(
        (t) => t.status !== "deleted" && isRecent(t.updatedAt)
      ).length;
    if (status === "deleted")
      return tests.filter((t) => t.status === "deleted").length;
    return 0;
  };

  // Filter tests by tab and search
  const filteredTests = tests.filter((test) => {
    const matchesTab =
      activeTab === "all"
        ? test.status !== "deleted"
        : activeTab === "recent"
        ? test.status !== "deleted" && isRecent(test.updatedAt)
        : test.status === "deleted";
    const matchesSearch = test.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // --- Actions ---
  const handleSoftDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/tests/${id}`);
      await fetchTests();
    } catch (err) {
      console.error("Error deleting test:", err);
    }
  };

  const handleRecover = async (id) => {
    try {
      await axios.put(`http://localhost:5001/api/tests/${id}/recover`);
      await fetchTests();
    } catch (err) {
      console.error("Error recovering test:", err);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this test?")
    )
      return;
    try {
      await axios.delete(`http://localhost:5001/api/tests/${id}/permanent`);
      setTests((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error permanently deleting test:", err);
    }
  };

  const handleEdit = (testId) => {
    navigate(`/categories/${id}/edit/${testId}`);
  };

  return (
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
        <button
          className="add-btn"
          onClick={() => navigate(`/categories/${id}/add`)}
        >
          + Add Test / Tab
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Scrollable Table */}
      <div className="table-scroll">
        <table>
          <colgroup>
            <col style={{ width: "5%" }} />
            <col style={{ width: "35%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>No</th>
              <th>Test/ Tab Name</th>
              <th>Last Updated By</th>
              <th>Last Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTests.map((test, index) => (
              <tr key={test.id}>
                <td>{index + 1}</td>
                <td>{test.name}</td>
                <td>{test.updatedBy}</td>
                <td>{test.updatedAt}</td>
                <td>
                  <div className="action-icons">
                    {test.status === "deleted" ? (
                      <>
                        <MdRestore
                          className="icon-recover"
                          title="Recover"
                          onClick={() => handleRecover(test.id)}
                        />
                        <MdDeleteForever
                          className="icon-permanent-delete"
                          title="Permanently Delete"
                          onClick={() => handlePermanentDelete(test.id)}
                        />
                      </>
                    ) : (
                      <>
                        <AiOutlineEdit
                          className="icon-edit"
                          title="Edit"
                          onClick={() => handleEdit(test.id)}
                        />
                        <MdDeleteOutline
                          className="icon-delete"
                          title="Soft Delete"
                          onClick={() => handleSoftDelete(test.id)}
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredTests.length === 0 && (
              <tr>
                <td colSpan={5}>No results found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestTable;
