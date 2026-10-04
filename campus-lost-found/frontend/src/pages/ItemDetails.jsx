import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

export default function ItemDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [reason, setReason] = useState("");
  const [proof, setProof] = useState("");
  const [lostDate, setLostDate] = useState("");

  useEffect(() => {
    api
      .get(`/items/${id}`)
      .then((res) => setItem(res.data.item))
      .catch(() => setError("Unable to load item."));
  }, [id]);

  const submitClaim = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    try {
      await api.post("/claims", {
        item_id: id,
        reason,
        proof,
        lost_date: lostDate,
      });

      setMsg("Claim submitted for verification.");
      setShow(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to submit claim."
      );
    }
  };

  if (error && !item) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
        <Link className="back-link" to="/projects">
          ← Back to reports
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container py-4">
        <p>Loading item...</p>
      </div>
    );
  }

  return (
    <div>
      <Link className="back-link" to="/projects">
        ← Back to reports
      </Link>

      <div className="detail-card">
        <div className="detail-image">
          {item.image ? (
            <img
              src={`http://localhost:5000${item.image}`}
              alt={item.item_name}
            />
          ) : (
            <i className="bi bi-box-seam" />
          )}
        </div>

        <div>
          <div className="d-flex gap-2 align-items-center">
            <span className="pill">{item.type}</span>
            <StatusBadge status={item.status} />
          </div>

          <h1 className="mt-3">{item.item_name}</h1>

          <div className="detail-meta">
            <span>
              <i className="bi bi-tag me-2" />
              {item.category}
            </span>

            <span>
              <i className="bi bi-geo-alt me-2" />
              {item.location}
            </span>

            <span>
              <i className="bi bi-calendar3 me-2" />
              {new Date(item.date).toLocaleDateString()}
            </span>
          </div>

          <p className="lead">{item.description}</p>

          {msg && <div className="alert alert-success">{msg}</div>}

          {error && <div className="alert alert-danger">{error}</div>}

          {item.type === "FOUND" &&
            item.status !== "RETURNED" &&
            user && (
              <button
                data-testid="claim-button"
                className="btn btn-primary"
                onClick={() => setShow(!show)}
              >
                Claim this item
              </button>
            )}

          {show && (
            <form className="mt-4" onSubmit={submitClaim}>
              <div className="mb-3">
                <label className="form-label">Why is this yours?</label>
                <textarea
                  className="form-control"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Proof / identifying details
                </label>
                <textarea
                  className="form-control"
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Date you lost it</label>
                <input
                  type="date"
                  className="form-control"
                  value={lostDate}
                  onChange={(e) => setLostDate(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Submit claim
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}