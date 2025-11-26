import React, { useState, useEffect } from "react";
import "../css/AdminQuickTable.css"

const AdminQuickTable = () => {
  const [admins, setAdmins] = useState([]);
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

      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id === id ? { ...admin, status: updatedAdmin.status } : admin
        )
      );
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update status. Please try again.");
    }
  };

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
    <div className="admin-quick-table">
      <h3>Admins (Quick Update)</h3>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin, index) => (
            <tr key={admin.id}>
              <td>{index + 1}</td>
              <td>{admin.full_name}</td>
              <td>
                <select
                  className={getStatusClass(admin.status)}
                  value={admin.status}
                  onChange={(e) => handleStatusChange(admin.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </td>
            </tr>
          ))}
          {admins.length === 0 && (
            <tr>
              <td colSpan={3}>No admins found</td>
            </tr>
          )}
        </tbody>
      </table>
      <small>
        Last updated: {lastUpdated ? lastUpdated.toLocaleString() : "Fetching..."}
      </small>
    </div>
  );
};

export default AdminQuickTable;
