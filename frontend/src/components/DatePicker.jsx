import { useState } from "react";

function DatePicker({ value, onChange, maxDate }) {
    const [isOpen, setIsOpen] = useState(false);

    const maximumDate = new Date(maxDate + "T00:00:00");

    const selectedDate = value
        ? new Date(value + "T00:00:00")
        : maximumDate;

    const [viewDate, setViewDate] = useState(
        new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            1
        )
    );

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthNames = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];

    const previousMonth = () => {
        setViewDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        const next = new Date(year, month + 1, 1);

        if (
            next <= new Date(
                maximumDate.getFullYear(),
                maximumDate.getMonth(),
                1
            )
        ) {
            setViewDate(next);
        }
    };

    // Select date
    const selectDate = (day) => {
        const selected = new Date(year, month, day);

        if (selected > maximumDate) return;

        const formattedDate = [
            selected.getFullYear(),
            String(selected.getMonth() + 1).padStart(2, "0"),
            String(selected.getDate()).padStart(2, "0")
        ].join("-");

        // FIX: Send date string directly to Dashboard
        onChange(formattedDate);

        setIsOpen(false);
    };

    const isFutureMonth =
        year > maximumDate.getFullYear() ||
        (
            year === maximumDate.getFullYear() &&
            month >= maximumDate.getMonth()
        );

    const formattedValue = value
        ? selectedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
        : "Select reading date";

    return (
        <div className="date-picker">

            <button
                type="button"
                className="date-picker-input"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{formattedValue}</span>
                <span>▦</span>
            </button>

            {isOpen && (
                <div className="calendar-popup">

                    <div className="calendar-header">

                        <button
                            type="button"
                            onClick={previousMonth}
                            aria-label="Previous month"
                        >
                            ‹
                        </button>

                        <strong>
                            {monthNames[month]} {year}
                        </strong>

                        <button
                            type="button"
                            onClick={nextMonth}
                            disabled={isFutureMonth}
                            aria-label="Next month"
                        >
                            ›
                        </button>

                    </div>

                    <div className="calendar-grid">

                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <div className="calendar-weekday" key={day}>
                                {day}
                            </div>
                        ))}

                        {Array.from({ length: firstDay }).map((_, index) => (
                            <div key={"empty-" + index}></div>
                        ))}

                        {Array.from(
                            { length: daysInMonth },
                            (_, index) => index + 1
                        ).map(day => {

                            const currentDate = new Date(year, month, day);

                            const isFuture = currentDate > maximumDate;

                            const isSelected =
                                value === [
                                    year,
                                    String(month + 1).padStart(2, "0"),
                                    String(day).padStart(2, "0")
                                ].join("-");

                            const isToday =
                                currentDate.toDateString() ===
                                maximumDate.toDateString();

                            return (
                                <button
                                    type="button"
                                    key={day}
                                    disabled={isFuture}
                                    className={[
                                        "calendar-day",
                                        isSelected ? "selected" : "",
                                        isToday ? "today" : "",
                                        isFuture ? "disabled" : ""
                                    ].join(" ")}
                                    onClick={() => selectDate(day)}
                                >
                                    {day}
                                </button>
                            );
                        })}

                    </div>

                    <div className="calendar-footer">
                        Future dates are not selectable
                    </div>

                </div>
            )}

        </div>
    );
}

export default DatePicker;