import React, { useState, useEffect } from "react";
import "../css/TestTable.css";

const AdminTable = () => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch admins from backend
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/admins");
        const data = await res.json();
        setAdmins(data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Failed to fetch admins", err);
      }
    };

    fetchAdmins();
  }, []);

  // Update status in backend
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/api/admins/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      const updatedAdmin = await res.json();

      // update local state
      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id === id ? { ...admin, status: updatedAdmin.status } : admin
        )
      );

      setLastUpdated(new Date()); // refresh timestamp
    } catch (err) {
      console.error("Error updating status:", err);
      alert("❌ Failed to update status. Please try again.");
    }
  };

  // Count admins per status
  const getCount = (status) => {
    if (status === "all") return admins.length;
    return admins.filter((t) => t.status === status).length;
  };

  const filteredAdmins = admins.filter((admin) => {
    const matchesTab = activeTab === "all" ? true : admin.status === activeTab;
    const matchesSearch = admin.full_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "status approved";
      case "pending":
        return "status pending";
      case "rejected":
        return "status rejected";
      default:
        return "status";
    }
  };

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>Admin Request(s)</h2>
      {/* Summary Cards */}
      <div className="admin-summary-container">
        <div className="admin-summary-row">
          {/* Card 1 */}
          <div className="admin-summary-card">
            <h3>Total Admin</h3>
            <p className="count">{getCount("all")}</p>
            <small>
              Last updated:{" "}
              {lastUpdated ? lastUpdated.toLocaleString() : "Fetching..."}
            </small>
          </div>

          <div className="table-divider"></div>

          {/* Card 2 */}
          <div className="admin-summary-card">
            <h3>Total Approved</h3>
            <p className="count">{getCount("approved")}</p>
            <small>
              Last updated:{" "}
              {lastUpdated ? lastUpdated.toLocaleString() : "Fetching..."}
            </small>
          </div>

          <div className="table-divider"></div>

          {/* Card 3 */}
          <div className="admin-summary-card">
            <h3>Total Rejected</h3>
            <p className="count">{getCount("rejected")}</p>
            <small>
              Last updated:{" "}
              {lastUpdated ? lastUpdated.toLocaleString() : "Fetching..."}
            </small>
          </div>
        </div>
      </div>
      <div className="table-container">
        {/* Tabs */}
        <div className="tabs-row">
          <div className="tabs">
            {["all", "pending", "approved", "rejected"].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({getCount(tab)})
              </button>
            ))}
          </div>
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
              <col style={{ width: "2%" }} /> {/* No */}
              <col style={{ width: "15%" }} /> {/* Name */}
              <col style={{ width: "10%" }} /> {/* Department */}
              <col style={{ width: "20%" }} /> {/* Email Address */}
              <col style={{ width: "20%" }} /> {/* Notes */}
              <col style={{ width: "13%" }} /> {/* Time */}
              <col style={{ width: "13%" }} /> {/* Status */}
            </colgroup>

            <thead>
              <tr>
                <th>No</th>
                <th>Name</th>
                <th>Department</th>
                <th>Email Address</th>
                <th>Notes</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin, index) => (
                <tr key={admin.id}>
                  <td>{index + 1}</td>
                  <td>{admin.full_name}</td>
                  <td>{admin.department}</td>
                  <td>{admin.email}</td>
                  <td>{admin.notes}</td>
                  <td>{admin.time}</td>
                  <td>
                    <select
                      className={getStatusClass(admin.status)}
                      value={admin.status}
                      onChange={(e) =>
                        handleStatusChange(admin.id, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan={7}>No results found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminTable;
