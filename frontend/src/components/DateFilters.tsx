import { Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface DateFilterProps {
  onDateChange: (
    startDate: number | undefined,
    endDate: number | undefined
  ) => void;
  heading?: string;
}

const DateFilters = ({ onDateChange, heading }: DateFilterProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const parsedStart = parseFloat(startDate);
    const parsedEnd = parseFloat(endDate);

    const start = isNaN(parsedStart) ? undefined : parsedStart;
    const end = isNaN(parsedEnd) ? undefined : parsedEnd;

    onDateChange(start, end);
  }, [startDate, endDate]);

  return (
    <section>
      <h2 className="font-semibold">{heading ?? "Filter by Julian Date"}</h2>

      <label htmlFor="dateFrom">Start date (2400000+):</label>
      <Input
        id="dataFrom"
        type="text"
        pattern="[0-9]*"
        value={startDate}
        onChange={(e) =>
          e.target.validity.valid && setStartDate(e.target.value)
        }
      />

      <label htmlFor="dateTo">End date (2400000+):</label>
      <Input
        id="dateTo"
        type="text"
        pattern="[0-9]*"
        value={endDate}
        onChange={(e) => e.target.validity.valid && setEndDate(e.target.value)}
      />
    </section>
  );
};

export default DateFilters;
