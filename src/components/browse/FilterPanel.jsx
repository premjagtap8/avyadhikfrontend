import {
  LOCATION_OPTIONS,
  CARE_OPTIONS,
  STAY_OPTIONS,
  ROOM_OPTIONS,
  RATING_OPTIONS,
  FACILITY_OPTIONS,
} from "../../constants/browseOptions";

function SelectGroup({ id, label, value, options, onChange }) {
  return (
    <div className="fp__group">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value || "all"} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function FilterPanel({ filters, onChange, onReset, open }) {
  const set = (key) => (val) => onChange({ ...filters, [key]: val });

  const toggleFacility = (value) => {
    const has = filters.facilities.includes(value);
    onChange({
      ...filters,
      facilities: has
        ? filters.facilities.filter((f) => f !== value)
        : [...filters.facilities, value],
    });
  };

  return (
    <aside className={`fp ${open ? "fp--open" : ""}`} aria-label="Search filters">
      <div className="fp__head">
        <h2>Refine your search</h2>
        <button type="button" className="fp__reset" onClick={onReset}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reset
        </button>
      </div>

      <SelectGroup id="f-city" label="Location" value={filters.city} options={LOCATION_OPTIONS} onChange={set("city")} />
      <SelectGroup id="f-care" label="Type of care" value={filters.care} options={CARE_OPTIONS} onChange={set("care")} />
      <SelectGroup id="f-stay" label="Length of stay" value={filters.stay} options={STAY_OPTIONS} onChange={set("stay")} />
      <SelectGroup id="f-room" label="Room type" value={filters.room} options={ROOM_OPTIONS} onChange={set("room")} />
      <SelectGroup id="f-rating" label="Minimum rating" value={filters.rating} options={RATING_OPTIONS} onChange={set("rating")} />

      <fieldset className="fp__group fp__facilities">
        <legend>Facilities confirmed available</legend>
        {FACILITY_OPTIONS.map((f) => (
          <label key={f.value} className="fp__check">
            <input
              type="checkbox"
              checked={filters.facilities.includes(f.value)}
              onChange={() => toggleFacility(f.value)}
            />
            <span>{f.label}</span>
          </label>
        ))}
      </fieldset>
    </aside>
  );
}
