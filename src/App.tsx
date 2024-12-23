import React, { useState, useCallback } from 'react';
import DateRangePicker from './Components/DateRangePicker/DateRangePicker';

// Predefined date ranges
const predefinedRanges = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 30 Days', value: 30 },
];

const App: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<[string, string] | null>(null);
  const [weekends, setWeekends] = useState<string[]>([]);

  const handleDateChange = useCallback((range: [string, string], weekendDates: string[]) => {
    setSelectedRange(range);
    setWeekends(weekendDates);
  }, []);

  return (
    <div className="container">
      <h1>Date Range Picker</h1>
      <DateRangePicker onChange={handleDateChange} predefinedRanges={predefinedRanges} />
      {selectedRange && (
        <div className="selected-range">
          <p>
            <strong>Selected Date Range:</strong>
            <span className="tag">{selectedRange[0]}</span> to
            <span className="tag">{selectedRange[1]}</span>
          </p>
          {weekends.length > 0 && (
            <p>
              <strong>Weekends within range:</strong>
              {weekends.map((weekend, index) => (
                <span key={index} className="tag">{weekend}</span>
              ))}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
