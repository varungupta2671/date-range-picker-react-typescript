import React, { useState, useEffect, useMemo } from 'react';
import './DateRangePicker.css';

// Utility to generate weekdays and weekends in a given month
const getWeekdaysAndWeekends = (month: number, year: number) => {
  const weekdays: Date[] = [];
  const weekends: Date[] = [];

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
    if (date.getDay() === 0 || date.getDay() === 6) {
      weekends.push(new Date(date));
    } else {
      weekdays.push(new Date(date));
    }
  }
  return { weekdays, weekends };
};

// Format a date into "YYYY-MM-DD"
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface DateRangePickerProps {
  predefinedRanges?: { label: string; value: number }[];
  onChange: (range: [string, string], weekends: string[]) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ predefinedRanges = [], onChange }) => {
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [weekends, setWeekends] = useState<string[]>([]);

  const { weekdays, weekends: weekendsInMonth } = useMemo(() => getWeekdaysAndWeekends(selectedMonth, selectedYear), [selectedMonth, selectedYear]);

  // Generate options for years and months
  const years = useMemo(() => Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  // Handle month navigation (prev/next)
  const handleMonthNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1));
    } else {
      setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1));
    }
  };

  // Handlers for changing year through dropdown
  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(event.target.value));
  };

  // Handlers for changing month through dropdown
  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(Number(event.target.value));
  };

  // Handlers for predefined range
  const handlePredefinedRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const adjustedStartDate = new Date(startDate.getTime() + startDate.getTimezoneOffset() * 60000);
    const adjustedEndDate = new Date(endDate.getTime() + endDate.getTimezoneOffset() * 60000);

    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    setSelectedStart(adjustedStartDate);
    setSelectedEnd(adjustedEndDate);
  };

  // Generate Eamptry slots for the days before the first day of the month
  const generateEmptySlots = (startDay: number) => {
    return Array.from({ length: startDay }, (_, i) => <div key={`empty-${i}`} className="empty-slot"></div>);
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    adjustedDate.setDate(adjustedDate.getDate() + 1);
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(adjustedDate);
      setSelectedEnd(null);
    } else if (selectedStart && !selectedEnd && adjustedDate > selectedStart) {
      setSelectedEnd(adjustedDate);
    }
  };

  // Update weekends when the range changes
  useEffect(() => {
    if (selectedStart && selectedEnd) {
      const allWeekends = [];
      for (let date = new Date(selectedStart); date <= selectedEnd; date.setDate(date.getDate() + 1)) {
        if (date.getDay() === 0 || date.getDay() === 6) {
          allWeekends.push(formatDate(new Date(date)));
        }
      }
      setWeekends(allWeekends);
    }
  }, [selectedStart, selectedEnd]);

  // Notify parent when the date range or weekends change
  useEffect(() => {
    if (selectedStart && selectedEnd) {
      onChange([formatDate(selectedStart), formatDate(selectedEnd)], weekends);
    }
  }, [selectedStart, selectedEnd, weekends]);

  return (
    <div className="date-range-picker">
      <div className="controls">
        <button onClick={() => handleMonthNavigation('prev')}>Prev</button>
        <div className="month-year">
          <select value={selectedYear} onChange={handleYearChange}>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select value={selectedMonth} onChange={handleMonthChange}>
            {months.map(month => (
              <option key={month} value={month}>{String(month + 1).padStart(2, '0')}</option>
            ))}
          </select>
        </div>
        <button onClick={() => handleMonthNavigation('next')}>
          Next
        </button>
      </div>
      <div className="calendar">
        <div className="weekday-names">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="dates">
          {generateEmptySlots(new Date(selectedYear, selectedMonth, 1).getDay())}
          {[...weekdays, ...weekendsInMonth]
            .sort((a, b) => a.getTime() - b.getTime())
            .map((date) => {
              const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
              adjustedDate.setDate(adjustedDate.getDate() + 1);
              const isSelected = selectedStart && selectedEnd && adjustedDate >= selectedStart && adjustedDate <= selectedEnd;
              const isWeekend = weekendsInMonth.includes(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`date-btn ${isSelected ? 'selected' : ''} ${isWeekend ? 'weekend' : ''}`}
                  disabled={isWeekend}
                >
                  {date.getDate()}
                </button>
              )
            })}
        </div>
      </div>
      <div className="predefined-ranges">
        {predefinedRanges?.length > 0 && (
          <div>
            {predefinedRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => handlePredefinedRange(range.value)}>
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;