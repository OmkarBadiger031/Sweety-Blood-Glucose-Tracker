import { useEffect, useState } from "react";
import API from "../api";
import Reports from "./Reports";
import DatePicker from "./DatePicker";

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function Dashboard() {
    const [formData, setFormData] = useState({
        reading_date: getTodayDate(),
        time_slot: "Morning fasting",
        value: ""
    });

    const [readings, setReadings] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [reportsRefreshKey, setReportsRefreshKey] = useState(0);

    // Automatically clear messages after 5 seconds
    useEffect(() => {
        if (!message && !error) return;

        const timer = setTimeout(() => {
            setMessage("");
            setError("");
        }, 5000);

        return () => clearTimeout(timer);
    }, [message, error]);

    // Fetch reading history
    const fetchReadings = async () => {
        try {
            const response = await API.get("/readings");
            setReadings(response.data.readings || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load readings."
            );
        }
    };

    // Load readings when dashboard opens
    useEffect(() => {
        fetchReadings();
    }, []);

    // Handle form inputs
    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Add or update reading
    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const payload = {
                reading_date: formData.reading_date,
                time_slot: formData.time_slot,
                value: Number(formData.value)
            };

            if (editingId) {
                await API.put(`/readings/${editingId}`, payload);
                setMessage("Reading updated successfully!");
                setEditingId(null);
            } else {
                await API.post("/readings", payload);
                setMessage("Reading added successfully!");
            }

            setFormData({
                reading_date: getTodayDate(),
                time_slot: "Morning fasting",
                value: ""
            });

            await fetchReadings();

            setReportsRefreshKey((prev) => prev + 1);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        }
    };

    // Edit reading
    const handleEdit = (reading) => {
        setEditingId(reading.id);

        setFormData({
            reading_date: String(reading.reading_date).slice(0, 10),
            time_slot: reading.time_slot,
            value: String(reading.value)
        });

        setMessage("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingId(null);

        setFormData({
            reading_date: getTodayDate(),
            time_slot: "Morning fasting",
            value: ""
        });

        setMessage("");
        setError("");
    };

    // Delete reading
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this reading?"
        );

        if (!confirmed) return;

        setMessage("");
        setError("");

        try {
            await API.delete(`/readings/${id}`);

            setMessage("Reading deleted successfully!");

            await fetchReadings();

            setReportsRefreshKey((prev) => prev + 1);

            if (editingId === id) {
                handleCancelEdit();
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete reading."
            );
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <div className="dashboard">

            {/* Dashboard Header */}
            <header className="dashboard-header">
                <div>
                    <h1>Sweety</h1>
                    <p>Blood Glucose Tracker</p>
                </div>

                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </header>

            <main className="dashboard-content">

                {/* Welcome Section */}
                <section className="welcome-section">
                    <h2>Welcome to Your Dashboard</h2>
                    <p>
                        Track your glucose readings and monitor
                        your daily progress.
                    </p>
                </section>

                {/* Add Reading Form */}
                <section className="reading-form-card">

                    <h2>
                        {editingId
                            ? "Update Glucose Reading"
                            : "Add Glucose Reading"}
                    </h2>

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label>Reading Date</label>

                            <DatePicker
                                value={formData.reading_date}
                                maxDate={getTodayDate()}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="time_slot">
                                Time Slot
                            </label>

                            <select
                                id="time_slot"
                                name="time_slot"
                                value={formData.time_slot}
                                onChange={handleChange}
                                required
                            >
                                <option value="Morning fasting">
                                    Morning fasting
                                </option>

                                <option value="After breakfast">
                                    After breakfast
                                </option>

                                <option value="After lunch">
                                    After lunch
                                </option>

                                <option value="After dinner">
                                    After dinner
                                </option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="value">
                                Glucose Level (mg/dL)
                            </label>

                            <input
                                type="number"
                                id="value"
                                name="value"
                                value={formData.value}
                                onChange={handleChange}
                                placeholder="Enter glucose level"
                                min="40"
                                max="600"
                                required
                            />
                        </div>

                        {message && (
                            <p className="message success">
                                {message}
                            </p>
                        )}

                        {error && (
                            <p className="message error">
                                {error}
                            </p>
                        )}

                        <div className="form-buttons">

                            <button type="submit">
                                {editingId
                                    ? "Update Reading"
                                    : "Add Reading"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                    </form>
                </section>

                {/* Reading History */}
                <section className="history-card">

                    <h2>Reading History</h2>

                    {readings.length === 0 ? (
                        <p className="empty-message">
                            No readings available. Add your first reading!
                        </p>
                    ) : (

                        <div className="table-container">

                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time Slot</th>
                                        <th>Glucose Level</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {readings.map((reading) => (

                                        <tr key={reading.id}>

                                            <td>
                                                {String(
                                                    reading.reading_date
                                                ).slice(0, 10)}
                                            </td>

                                            <td>
                                                {reading.time_slot}
                                            </td>

                                            <td>
                                                {reading.value} mg/dL
                                            </td>

                                            <td>
                                                <div className="action-buttons">

                                                    <button
                                                        type="button"
                                                        className="edit-button"
                                                        onClick={() =>
                                                            handleEdit(reading)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="delete-button"
                                                        onClick={() =>
                                                            handleDelete(reading.id)
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>

                                    ))}
                                </tbody>
                            </table>

                        </div>
                    )}

                </section>

                {/* Reports */}
                <Reports
                    refreshTrigger={reportsRefreshKey}
                />

            </main>

        </div>
    );
}

export default Dashboard;