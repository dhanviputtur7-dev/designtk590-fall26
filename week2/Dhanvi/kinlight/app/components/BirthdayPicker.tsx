"use client";

/*
  Birthday = just a month and a day (no year), from the sketch: a little cake,
  then Month and Day. Any date can be picked, including ones later this year.
  Value format matches what's saved: "MM-DD", or "" for no birthday.
*/

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Props = {
  value: string;
  onChange: (value: string) => void;
  idPrefix: string;
};

function daysInMonth(month: number) {
  return new Date(2000, month, 0).getDate(); // 2000 is a leap year, so Feb 29 is allowed
}

export default function BirthdayPicker({ value, onChange, idPrefix }: Props) {
  const [monthText, dayText] = value ? value.split("-") : ["", ""];
  const month = Number(monthText) || 0;
  const day = Number(dayText) || 0;

  function update(nextMonth: number, nextDay: number) {
    if (!nextMonth) {
      onChange("");
      return;
    }
    const safeDay = Math.min(nextDay || 1, daysInMonth(nextMonth));
    onChange(`${String(nextMonth).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`);
  }

  return (
    <fieldset className="birthday-picker">
      <legend>
        <svg className="birthday-picker-cake" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path d="M11 9V5m5 4V4m5 5V5" stroke="#2c4337" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M5 17v10h22V17Z" fill="#f6cf71" stroke="#2c4337" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M7 11h18v6H7Z" fill="#ff9fc4" stroke="#2c4337" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M5 21c3 2 5 2 7 0s5-2 7 0 5 2 8 0" fill="none" stroke="#fff7e6" strokeWidth="1.6" />
        </svg>
        Birthday <span className="birthday-picker-optional">(optional)</span>
      </legend>
      <div className="birthday-picker-row">
        <label htmlFor={`${idPrefix}-month`}>
          Month
          <select
            id={`${idPrefix}-month`}
            className="field"
            value={month}
            onChange={(event) => update(Number(event.target.value), day)}
          >
            <option value={0}>No birthday</option>
            {MONTHS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`${idPrefix}-day`}>
          Day
          <select
            id={`${idPrefix}-day`}
            className="field"
            value={day}
            disabled={!month}
            onChange={(event) => update(month, Number(event.target.value))}
          >
            {!month && <option value={0}>—</option>}
            {month > 0 &&
              Array.from({ length: daysInMonth(month) }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
          </select>
        </label>
      </div>
    </fieldset>
  );
}
