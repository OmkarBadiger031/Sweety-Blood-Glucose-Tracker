import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import API from "../api";

const getToday = () => {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata"
    }).format(new Date());
};

const formatValue = (value) => {
    return value === null || value === undefined ? "-" : value;
};

const Reports = ({ refreshTrigger }) => {
    const [selectedDate, setSelectedDate] = useState(getToday());

    const [dailyReport, setDailyReport] = useState(null);
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [previousMonthReport, setPreviousMonthReport] = useState(null);
    const [dailyReadings, setDailyReadings] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const dateInputRef = useRef(null);

    useEffect(() => {
        fetchReports();
    }, [selectedDate, refreshTrigger]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError("");

            const [dailyResponse, monthlyResponse, previousResponse] =
                await Promise.all([
                    API.get("/reports/daily", {
                        params: { date: selectedDate }
                    }),
                    API.get("/reports/monthly", {
                        params: { date: selectedDate }
                    }),
                    API.get("/reports/previous-month")
                ]);

            setDailyReport(dailyResponse.data.statistics);
            setDailyReadings(dailyResponse.data.readings || []);
            setMonthlyReport(monthlyResponse.data.statistics);
            setPreviousMonthReport(previousResponse.data.statistics);

        } catch (err) {
            console.error("Reports loading error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load reports. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    const openDatePicker = () => {
        if (dateInputRef.current?.showPicker) {
            dateInputRef.current.showPicker();
        } else {
            dateInputRef.current?.focus();
        }
    };

    const StatRows = ({ data }) => (
        <>
            <div className="report-stat">
                <span>Highest</span>
                <strong>{formatValue(data?.highest)}</strong>
            </div>

            <div className="report-stat">
                <span>Lowest</span>
                <strong>{formatValue(data?.lowest)}</strong>
            </div>

            <div className="report-stat">
                <span>Average</span>
                <strong>{formatValue(data?.average)}</strong>
            </div>

            <div className="report-stat">
                <span>Total Readings</span>
                <strong>{formatValue(data?.count ?? 0)}</strong>
            </div>
        </>
    );

    return (
        <section className="reports-section">

            <h2>Glucose Reports</h2>

            {/* REPORT DATE SELECTOR */}
            <div style={styles.dateSection}>

                <label htmlFor="reportDate" style={styles.dateLabel}>
                    Select Report Date
                </label>

                <div style={styles.dateInputWrapper}>

                    <input
                        ref={dateInputRef}
                        id="reportDate"
                        type="date"
                        value={selectedDate}
                        max={getToday()}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={styles.dateInput}
                    />

                    <button
                        type="button"
                        onClick={openDatePicker}
                        style={styles.calendarButton}
                        aria-label="Open report date calendar"
                    >
                        <CalendarDays size={20} />
                    </button>

                </div>
            </div>

            {loading && (
                <p style={styles.loading}>Loading reports...</p>
            )}

            {error && (
                <p style={styles.error}>{error}</p>
            )}

            {!loading && !error && (
                <div className="reports-grid">

                    {/* DAILY REPORT */}
                    <div className="report-card">

                        <h3>Daily Report</h3>

                        <p style={styles.reportDate}>
                            {selectedDate}
                        </p>

                        <StatRows data={dailyReport} />

                        <h4 style={styles.subHeading}>
                            Individual Readings
                        </h4>

                        {dailyReadings.length === 0 ? (
                            <p style={styles.empty}>
                                No readings found for this date.
                            </p>
                        ) : (
                            <div style={styles.tableWrapper}>

                                <table style={styles.table}>

                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Time Slot</th>
                                            <th style={styles.th}>Value</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {dailyReadings.map((reading) => (
                                            <tr key={reading.id}>

                                                <td style={styles.td}>
                                                    {reading.time_slot}
                                                </td>

                                                <td style={styles.value}>
                                                    {reading.value} mg/dL
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>

                                </table>

                            </div>
                        )}

                    </div>

                    {/* MONTH-TO-DATE REPORT */}
                    <div className="report-card">

                        <h3>Month-to-Date Report</h3>

                        <p style={styles.description}>
                            From the first day of the selected month
                            through {selectedDate}.
                        </p>

                        <StatRows data={monthlyReport} />

                    </div>

                    {/* PREVIOUS MONTH REPORT */}
                    <div className="report-card">

                        <h3>Previous Month Report</h3>

                        <p style={styles.description}>
                            Complete summary of the previous calendar month.
                        </p>

                        <StatRows data={previousMonthReport} />

                    </div>

                </div>
            )}

        </section>
    );
};

const styles = {

    dateSection: {
        marginBottom: "25px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px"
    },

    dateLabel: {
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: "600"
    },

    dateInputWrapper: {
        position: "relative",
        width: "100%",
        maxWidth: "260px"
    },

    dateInput: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 45px 12px 12px",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        background: "#ffffff",
        color: "#1e293b",
        fontSize: "14px",
        cursor: "pointer"
    },

    calendarButton: {
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        border: "none",
        background: "transparent",
        color: "#0f766e",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px"
    },

    reportDate: {
        textAlign: "center",
        color: "#64748b",
        fontSize: "13px",
        marginBottom: "12px"
    },

    description: {
        color: "#64748b",
        textAlign: "center",
        fontSize: "13px",
        marginBottom: "15px",
        minHeight: "38px"
    },

    subHeading: {
        color: "#0f766e",
        fontSize: "15px",
        marginTop: "22px",
        marginBottom: "12px",
        textAlign: "left"
    },

    tableWrapper: {
        width: "100%",
        overflowX: "auto"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left"
    },

    th: {
        padding: "10px 6px",
        background: "#ccfbf1",
        color: "#0f766e",
        fontSize: "12px",
        textAlign: "left"
    },

    td: {
        padding: "10px 6px",
        color: "#334155",
        fontSize: "12px",
        borderBottom: "1px solid #e2e8f0"
    },

    value: {
        padding: "10px 6px",
        color: "#0f766e",
        fontSize: "12px",
        fontWeight: "700",
        borderBottom: "1px solid #e2e8f0"
    },

    empty: {
        padding: "15px 5px",
        color: "#64748b",
        fontSize: "13px",
        textAlign: "center"
    },

    loading: {
        color: "#ffffff",
        textAlign: "center",
        padding: "20px"
    },

    error: {
        color: "#fecaca",
        background: "#7f1d1d",
        padding: "12px",
        borderRadius: "8px",
        textAlign: "center"
    }
};

export default Reports;