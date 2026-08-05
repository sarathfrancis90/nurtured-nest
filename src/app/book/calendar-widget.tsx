'use client';

import { useEffect, useMemo, useState } from 'react';

type CalendarWidgetProps = {
  value: string;
  onChange: (value: string) => void;
  timezone: string;
};

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayInTimezone(timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function fromDateValue(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export default function CalendarWidget({ value, onChange, timezone }: CalendarWidgetProps) {
  const today = useMemo(() => todayInTimezone(timezone), [timezone]);
  const [month, setMonth] = useState(() => {
    const date = fromDateValue(value);
    return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
  });

  useEffect(() => {
    const selected = fromDateValue(value);
    if (selected.getFullYear() !== month.getFullYear() || selected.getMonth() !== month.getMonth()) {
      setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1, 12, 0, 0, 0));
    }
  }, [value, month]);

  const days = useMemo(() => {
    const firstDayOffset = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(month.getFullYear(), month.getMonth(), index - firstDayOffset + 1, 12, 0, 0, 0);
      const dateValue = toDateValue(date);
      return {
        date,
        dateValue,
        isCurrentMonth: date.getMonth() === month.getMonth(),
        isSelected: dateValue === value,
        isUnavailable: dateValue < today || date.getDay() === 0,
      };
    });
  }, [month, today, value]);

  const monthLabel = new Intl.DateTimeFormat('en-CA', { month: 'long', year: 'numeric' }).format(month);
  const previousMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1, 12, 0, 0, 0);
  const canGoBack = toDateValue(new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0, 12, 0, 0, 0)) >= today;

  return (
    <section className="calendar-widget" aria-label="Choose a consultation date">
      <div className="calendar-heading">
        <div>
          <p className="eyebrow">Choose a day</p>
          <h2>{monthLabel}</h2>
          <p className="calendar-helper">Times are shown in {timezone}.</p>
        </div>
        <div className="calendar-nav" aria-label="Calendar navigation">
          <button
            type="button"
            className="icon-button"
            aria-label="Previous month"
            disabled={!canGoBack}
            onClick={() => setMonth(previousMonth)}
          >
            ←
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Next month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1, 12, 0, 0, 0))}
          >
            →
          </button>
        </div>
      </div>

      <div className="calendar-weekdays" aria-hidden="true">
        {weekdayLabels.map((label) => <span key={label}>{label}</span>)}
      </div>
      <div className="calendar-grid" role="grid" aria-label={`${monthLabel} availability`}>
        {days.map(({ date, dateValue, isCurrentMonth, isSelected, isUnavailable }) => (
          <button
            key={dateValue}
            type="button"
            role="gridcell"
            className={`calendar-day ${isCurrentMonth ? '' : 'outside-month'} ${isSelected ? 'selected' : ''}`}
            aria-label={new Intl.DateTimeFormat('en-CA', { dateStyle: 'full' }).format(date)}
            aria-pressed={isSelected}
            disabled={isUnavailable}
            onClick={() => onChange(dateValue)}
          >
            <span>{date.getDate()}</span>
            {isSelected && <small>Selected</small>}
          </button>
        ))}
      </div>
      <div className="calendar-legend" aria-hidden="true">
        <span><i className="legend-dot selected-dot" /> Selected day</span>
        <span><i className="legend-dot" /> Sunday unavailable</span>
      </div>
    </section>
  );
}
