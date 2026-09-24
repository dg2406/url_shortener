import React, {
  useEffect,
  useState
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

import "../styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [expiresAt, setExpiresAt] =
    useState("");

  const [urls, setUrls] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [analyticsId, setAnalyticsId] =
    useState(null);

  const [analyticsData, setAnalyticsData] =
    useState(null);

  const [analyticsLoading, setAnalyticsLoading] =
    useState(false);

  const loadUrls = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } =
        await api.get("/api/urls");

      setUrls(data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load URLs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUrls();
  }, []);

  const createUrl = async (e) => {
    e.preventDefault();

    setError("");

    if (!url.trim()) {
      setError(
        "Please enter a URL."
      );
      return;
    }

    if (
      expiresAt &&
      new Date(expiresAt) <=
        new Date()
    ) {
      setError(
        "Expiration time must be in the future."
      );
      return;
    }

    try {
      setCreating(true);

      await api.post(
        "/api/urls",
        {
          originalUrl:
            url.trim(),

          expiresAt:
            expiresAt
              ? new Date(
                  expiresAt
                ).toISOString()
              : null
        }
      );

      setUrl("");
      setExpiresAt("");

      await loadUrls();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create short URL."
      );
    } finally {
      setCreating(false);
    }
  };

  const deleteUrl = async (id) => {
    const confirmed =
      window.confirm(
        "Delete this short URL?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/api/urls/${id}`
      );

      setUrls((current) =>
        current.filter(
          (item) =>
            item._id !== id
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete URL."
      );
    }
  };

  const toggleUrl = async (id) => {
    try {
      setError("");

      const { data } =
        await api.patch(
          `/api/urls/${id}/toggle`
        );

      setUrls((current) =>
        current.map((item) =>
          item._id === id
            ? {
                ...item,
                active:
                  data.active
              }
            : item
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update URL."
      );
    }
  };

  const loadAnalytics = async (id) => {
    if (analyticsId === id) {
      setAnalyticsId(null);
      setAnalyticsData(null);
      return;
    }

    try {
      setAnalyticsLoading(true);
      setAnalyticsId(id);
      setAnalyticsData(null);
      setError("");

      const { data } =
        await api.get(
          `/api/urls/${id}/analytics`
        );

      setAnalyticsData(data);
    } catch (error) {
      setAnalyticsId(null);

      setError(
        error.response?.data?.message ||
          "Failed to load analytics."
      );
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const copyUrl = async (
    shortCode
  ) => {
    const shortUrl =
      `${import.meta.env.VITE_API_URL}/${shortCode}`;

    try {
      await navigator.clipboard.writeText(
        shortUrl
      );

      window.alert(
        "Short URL copied!"
      );
    } catch {
      setError(
        "Failed to copy URL."
      );
    }
  };

  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    navigate("/login", {
      replace: true
    });
  };

  const getStatus = (item) => {
    if (
      item.expiresAt &&
      new Date(item.expiresAt) <=
        new Date()
    ) {
      return "Expired";
    }

    if (!item.active) {
      return "Disabled";
    }

    return "Active";
  };

  const formatDate = (date) => {
    if (!date) {
      return "Never";
    }

    return new Date(
      date
    ).toLocaleString();
  };

  return (
    <div className="dashboard-page">

      <header className="dashboard-header">

        <div>
          <h1>
            URL Shortener
          </h1>

          <p>
            Create and manage your
            shortened URLs
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={logout}
        >
          Logout
        </button>

      </header>

      <main className="dashboard-container">

        <section className="shorten-card">

          <h2>
            Create Short URL
          </h2>

          <form
            className="shorten-form"
            onSubmit={createUrl}
          >
            <input
              type="url"
              placeholder="https://example.com/very-long-url"
              value={url}
              onChange={(e) =>
                setUrl(
                  e.target.value
                )
              }
              required
            />

            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) =>
                setExpiresAt(
                  e.target.value
                )
              }
            />

            <button
              type="submit"
              disabled={creating}
            >
              {creating
                ? "Creating..."
                : "Shorten URL"}
            </button>
          </form>

          <p className="expiration-help">
            Leave expiration empty
            for a link that never
            expires.
          </p>

        </section>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <section className="urls-section">

          <div className="section-heading">

            <h2>
              Your URLs
            </h2>

            <span>
              {urls.length} link
              {urls.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {loading ? (
            <div className="empty-state">
              Loading your URLs...
            </div>
          ) : urls.length === 0 ? (
            <div className="empty-state">
              You haven't created
              any short URLs yet.
            </div>
          ) : (
            <div className="url-list">

              {urls.map((item) => {
                const shortUrl =
                  `${import.meta.env.VITE_API_URL}/${item.shortCode}`;

                const status =
                  getStatus(item);

                const isExpired =
                  status ===
                  "Expired";

                return (
                  <div
                    className="url-wrapper"
                    key={item._id}
                  >

                    <div className="url-card">

                      <div className="url-info">

                        <div className="url-top-row">

                          <span
                            className={`status-badge ${status.toLowerCase()}`}
                          >
                            {status}
                          </span>

                          <span className="click-count">
                            {item.clicks} click
                            {item.clicks !==
                            1
                              ? "s"
                              : ""}
                          </span>

                        </div>

                        <p className="url-label">
                          Original URL
                        </p>

                        <a
                          className="original-url"
                          href={
                            item.originalUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          {
                            item.originalUrl
                          }
                        </a>

                        <p className="url-label">
                          Short URL
                        </p>

                        <a
                          className={
                            "short-url"
                          }
                          href={
                            shortUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          {shortUrl}
                        </a>

                        <p className="expiration-text">
                          Expires:{" "}
                          {
                            formatDate(
                              item.expiresAt
                            )
                          }
                        </p>

                      </div>

                      <div className="url-actions">

                        <button
                          className="copy-btn"
                          onClick={() =>
                            copyUrl(
                              item.shortCode
                            )
                          }
                        >
                          Copy
                        </button>

                        <button
                          className="analytics-btn"
                          onClick={() =>
                            loadAnalytics(
                              item._id
                            )
                          }
                        >
                          {analyticsId ===
                          item._id
                            ? "Hide Analytics"
                            : "Analytics"}
                        </button>

                        {!isExpired && (
                          <button
                            className={
                              item.active
                                ? "disable-btn"
                                : "enable-btn"
                            }
                            onClick={() =>
                              toggleUrl(
                                item._id
                              )
                            }
                          >
                            {item.active
                              ? "Disable"
                              : "Enable"}
                          </button>
                        )}

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteUrl(
                              item._id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                    {analyticsId ===
                      item._id && (
                      <div className="analytics-panel">

                        {analyticsLoading ? (
                          <p>
                            Loading analytics...
                          </p>
                        ) : analyticsData ? (
                          <>
                            <div className="analytics-summary">

                              <div>
                                <span>
                                  Total clicks
                                </span>

                                <strong>
                                  {
                                    analyticsData.totalClicks
                                  }
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Status
                                </span>

                                <strong>
                                  {analyticsData.active
                                    ? "Active"
                                    : "Disabled"}
                                </strong>
                              </div>

                            </div>

                            <h3>
                              Daily Clicks
                            </h3>

                            {analyticsData
                              .dailyClicks
                              ?.length ===
                            0 ? (
                              <p className="no-data">
                                No clicks yet.
                              </p>
                            ) : (
                              <div className="chart">

                                {analyticsData.dailyClicks.map(
                                  (day) => {
                                    const max =
                                      Math.max(
                                        ...analyticsData.dailyClicks.map(
                                          (
                                            entry
                                          ) =>
                                            entry.clicks
                                        )
                                      );

                                    const width =
                                      Math.max(
                                        (day.clicks /
                                          max) *
                                          100,
                                        5
                                      );

                                    return (
                                      <div
                                        className="chart-row"
                                        key={
                                          day._id
                                        }
                                      >
                                        <span>
                                          {
                                            day._id
                                          }
                                        </span>

                                        <div className="chart-track">
                                          <div
                                            className="chart-bar"
                                            style={{
                                              width: `${width}%`
                                            }}
                                          />
                                        </div>

                                        <strong>
                                          {
                                            day.clicks
                                          }
                                        </strong>
                                      </div>
                                    );
                                  }
                                )}

                              </div>
                            )}

                            <h3>
                              Top Referrers
                            </h3>

                            {analyticsData
                              .topReferrers
                              ?.length ===
                            0 ? (
                              <p className="no-data">
                                No referrer data yet.
                              </p>
                            ) : (
                              <div className="referrer-list">
                                {analyticsData.topReferrers.map(
                                  (
                                    referrer
                                  ) => (
                                    <div
                                      className="referrer-row"
                                      key={
                                        referrer._id
                                      }
                                    >
                                      <span>
                                        {
                                          referrer._id
                                        }
                                      </span>

                                      <strong>
                                        {
                                          referrer.clicks
                                        }
                                      </strong>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </>
                        ) : null}

                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}