import { useEffect, useState } from "react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [s, i, c, m] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/items"),
        api.get("/admin/claims"),
        api.get("/admin/matches/high-confidence"),
      ]);

      setStats(s.data);
      setItems(i.data);
      setClaims(c.data);
      setMatches(m.data);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Admin data unavailable"
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateClaim(id, status) {
    try {
      await api.patch(`/admin/claims/${id}`, {
        status,
      });

      load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Unable to update claim"
      );
    }
  }

  async function status(id, status) {
    try {
      await api.patch(`/admin/items/${id}/status`, {
        status,
      });

      load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Unable to update item status"
      );
    }
  }

  async function returned(id) {
    try {
      await api.patch(`/admin/items/${id}/return`);

      load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Unable to mark item returned"
      );
    }
  }

  return (
    <div>
      {/* HEADER */}
      <div className="topbar">
        <div>
          <p className="eyebrow">Admin / Warden</p>

          <h1>Operations dashboard</h1>

          <p className="muted">
            Verify reports and claims, then close the
            loop when an item is returned.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* STATISTICS */}
      {stats && (
        <div className="stat-grid">
          {Object.entries({
            Reports: stats.totalReports,
            Lost: stats.lostItems,
            Found: stats.foundItems,
            "Pending reports": stats.pendingReports,
            "Pending claims": stats.pendingClaims,
            Returned: stats.returnedItems,
            Rejected: stats.rejected,
          }).map(([key, value]) => (
            <div className="stat-card" key={key}>
              <span>{key}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      )}

      {/* HIGH CONFIDENCE MATCHES */}
      <div className="section-head mt-5">
        <div>
          <h3>
            🔔 High-Confidence Matches
          </h3>

          <p>
            Reports with a matching score of 90% or
            higher require admin verification.
          </p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="empty-state">
          <h5>No high-confidence matches</h5>

          <p className="muted">
            New matches with a score of 90% or higher
            will appear here.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {matches.map((match) => (
            <div
              className="col-12"
              key={match.match_id}
            >
              <div className="table-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <span className="pill">
                      HIGH-CONFIDENCE MATCH
                    </span>

                    <h4 className="mt-3 mb-1">
                      {match.lost_item_name}
                    </h4>

                    <p className="muted mb-0">
                      Match detected between the lost
                      and found reports.
                    </p>
                  </div>

                  <div className="text-end">
                    <div className="muted">
                      Match Confidence
                    </div>

                    <strong
                      style={{
                        fontSize: "2rem",
                      }}
                    >
                      {match.match_score}%
                    </strong>
                  </div>
                </div>

                <div className="row g-3">
                  {/* LOST REPORT */}
                  <div className="col-md-6">
                    <div className="p-3 border rounded">
                      <h6>Lost Report</h6>

                      <strong>
                        {match.lost_item_name}
                      </strong>

                      <p className="mb-1">
                        Category:{" "}
                        {match.lost_category}
                      </p>

                      <p className="mb-1">
                        Location:{" "}
                        {match.lost_location}
                      </p>

                      <p className="mb-1">
                        Date:{" "}
                        {new Date(
                          match.lost_date
                        ).toLocaleDateString()}
                      </p>

                      <p className="mb-0">
                        {match.lost_description}
                      </p>
                    </div>
                  </div>

                  {/* FOUND REPORT */}
                  <div className="col-md-6">
                    <div className="p-3 border rounded">
                      <h6>Found Report</h6>

                      <strong>
                        {match.found_item_name}
                      </strong>

                      <p className="mb-1">
                        Category:{" "}
                        {match.found_category}
                      </p>

                      <p className="mb-1">
                        Location:{" "}
                        {match.found_location}
                      </p>

                      <p className="mb-1">
                        Date:{" "}
                        {new Date(
                          match.found_date
                        ).toLocaleDateString()}
                      </p>

                      <p className="mb-0">
                        {match.found_description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* STATUS */}
                <div className="mt-3">
                  <span className="me-3">
                    Lost status:
                  </span>

                  <StatusBadge
                    status={match.lost_status}
                  />

                  <span className="ms-4 me-3">
                    Found status:
                  </span>

                  <StatusBadge
                    status={match.found_status}
                  />
                </div>
                <div className="mt-4 d-flex gap-2">
  {match.match_status !== "CONFIRMED" && (
    <button
      className="btn btn-primary"
      onClick={async () => {
        try {
          await api.patch(
            `/admin/matches/${match.match_id}/confirm`
          );

          await load();
        } catch (e) {
          setError(
            e.response?.data?.message ||
              "Unable to confirm match"
          );
        }
      }}
    >
      Confirm Match
    </button>
  )}

  {match.match_status === "CONFIRMED" && (
    <button
      className="btn btn-success"
      onClick={async () => {
        try {
          await api.patch(
            `/admin/matches/${match.match_id}/return`
          );

          await load();
        } catch (e) {
          setError(
            e.response?.data?.message ||
              "Unable to mark items returned"
          );
        }
      }}
    >
      Mark Both Returned
    </button>
  )}
</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REPORT MANAGEMENT */}
      <div className="section-head mt-5">
        <div>
          <h3>Report management</h3>

          <p>
            Approve or reject submitted reports and
            close returned items.
          </p>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Type</th>
              <th>Reporter</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.item_id}>
                <td>{item.item_name}</td>

                <td>{item.type}</td>

                <td>{item.reporter_name}</td>

                <td>
                  <StatusBadge
                    status={item.status}
                  />
                </td>

                <td className="actions">
                  <button
                    className="btn btn-sm btn-light"
                    onClick={() =>
                      status(
                        item.item_id,
                        "ACTIVE"
                      )
                    }
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() =>
                      status(
                        item.item_id,
                        "REJECTED"
                      )
                    }
                  >
                    Reject
                  </button>

                  {item.status === "CLAIMED" && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() =>
                        returned(item.item_id)
                      }
                    >
                      Mark returned
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CLAIM MANAGEMENT */}
      <div className="section-head mt-5">
        <div>
          <h3>Claim verification</h3>

          <p>
            Review evidence before approving
            ownership.
          </p>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Claimant</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {claims.map((claim) => (
              <tr key={claim.claim_id}>
                <td>{claim.item_name}</td>

                <td>
                  {claim.claimant_name}
                  <br />
                  <small>
                    {claim.claimant_email}
                  </small>
                </td>

                <td>{claim.reason}</td>

                <td>
                  <StatusBadge
                    status={claim.status}
                  />
                </td>

                <td className="actions">
                  <button
                    className="btn btn-sm btn-light"
                    onClick={() =>
                      updateClaim(
                        claim.claim_id,
                        "UNDER_VERIFICATION"
                      )
                    }
                  >
                    Verify
                  </button>

                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() =>
                      updateClaim(
                        claim.claim_id,
                        "APPROVED"
                      )
                    }
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() =>
                      updateClaim(
                        claim.claim_id,
                        "REJECTED"
                      )
                    }
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}