import React, { useState, useEffect } from "react";
import "../css/TestTable.css";
import { AiOutlineEdit } from "react-icons/ai";
import { MdDeleteOutline } from "react-icons/md";

const sampleTests = [
  {
    id: 1,
    name: "Blood Test",
    status: "recent",
    updatedBy: "Dr. Smith",
    updatedAt: "2025-08-27",
  },
  {
    id: 2,
    name: "Activated Partial Thromboplastin Time (APTT) Test",
    status: "deleted",
    updatedBy: "Nurse Irene Lee Zhi Xuan",
    updatedAt: "2025-08-26",
  },
  {
    id: 3,
    name: "X-Ray",
    status: "recent",
    updatedBy: "Dr. John",
    updatedAt: "2025-08-25",
  },
  {
    id: 4,
    name: "MRI",
    status: "all",
    updatedBy: "Dr. Amy",
    updatedAt: "2025-08-24",
  },
  {
    id: 5,
    name: "Blood Test",
    status: "recent",
    updatedBy: "Dr. Smith",
    updatedAt: "2025-08-27",
  },
  {
    id: 6,
    name: "Urine Test",
    status: "deleted",
    updatedBy: "Nurse Lee",
    updatedAt: "2025-08-26",
  },
  {
    id: 7,
    name: "X-Ray",
    status: "recent",
    updatedBy: "Dr. John",
    updatedAt: "2025-08-25",
  },
  {
    id: 8,
    name: "MRI",
    status: "all",
    updatedBy: "Dr. Amy",
    updatedAt: "2025-08-24",
  },
  {
    id: 9,
    name: "Blood Test",
    status: "recent",
    updatedBy: "Dr. Smith",
    updatedAt: "2025-08-27",
  },
  {
    id: 10,
    name: "Activated Partial Thromboplastin Time (APTT) Test",
    status: "deleted",
    updatedBy: "Nurse Irene Lee Zhi Xuan",
    updatedAt: "2025-08-26",
  },
  {
    id: 11,
    name: "X-Ray",
    status: "recent",
    updatedBy: "Dr. John",
    updatedAt: "2025-08-25",
  },
  {
    id: 12,
    name: "MRI",
    status: "all",
    updatedBy: "Dr. Amy",
    updatedAt: "2025-08-24",
  },
  {
    id: 13,
    name: "Blood Test",
    status: "recent",
    updatedBy: "Dr. Smith",
    updatedAt: "2025-08-27",
  },
  {
    id: 14,
    name: "Urine Test",
    status: "deleted",
    updatedBy: "Nurse Lee",
    updatedAt: "2025-08-26",
  },
  {
    id: 15,
    name: "X-Ray",
    status: "recent",
    updatedBy: "Dr. John",
    updatedAt: "2025-08-25",
  },
  {
    id: 16,
    name: "MRI",
    status: "all",
    updatedBy: "Dr. Amy",
    updatedAt: "2025-08-24",
  },
];

const TestTable = () => {
  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    setTests(sampleTests);
  }, []);

  // Count tests per status
  const getCount = (status) => {
    if (status === "all") return tests.length;
    return tests.filter((t) => t.status === status).length;
  };

  const filteredTests = tests.filter((test) => {
    const matchesTab = activeTab === "all" ? true : test.status === activeTab;
    const matchesSearch = test.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleDelete = (id) => {
    setTests((prev) => prev.filter((t) => t.id !== id));
  };

  const handleEdit = (id) => {
    alert(`Edit test with ID: ${id}`);
  };

  return (
    <div className="table-container">
      {/* Tabs */}
      <div className="tabs-row">
        <div className="tabs">
          {["all", "recent", "deleted"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({getCount(tab)})
            </button>
          ))}
        </div>
        <button className="add-btn">
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
            <col style={{ width: "5%" }} /> {/* No */}
            <col style={{ width: "35%" }} /> {/* Test Name */}
            <col style={{ width: "30%" }} /> {/* Last Updated By */}
            <col style={{ width: "20%" }} /> {/* Last Updated At */}
            <col style={{ width: "10%" }} /> {/* Actions */}
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
                    <AiOutlineEdit
                      className="icon-edit"
                      onClick={() => handleEdit(test.id)}
                    />
                    <MdDeleteOutline
                      className="icon-delete"
                      onClick={() => handleDelete(test.id)}
                    />
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
