import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import "./AdminDashboard.css";
import "./AdminHomeForm.css";

// The values sent to the backend. If your Joi validation uses different
// spellings for any of these, change the "value" here (the label is what the admin sees).
const LENGTH_OF_STAY = [
  { value: "long-term", label: "Long-term" },
  { value: "short-stay", label: "Short-stay" },
  { value: "respite", label: "Respite" },
];

const ROOM_TYPES = [
  { value: "private suite", label: "Private suite" },
  { value: "companion room", label: "Companion room" },
  { value: "one-bedroom residence", label: "One-bedroom residence" },
  { value: "two-bedroom residence", label: "Two-bedroom residence" },
];

const FACILITIES = [
  "Geriatric nutrition",
  "24x7 medical assistance",
  "Holistic care",
  "Personal caregivers",
  "Rehabilitation",
  "Dementia care",
  "Post-operative care",
  "Parkinson's care",
];

const MAX_IMAGES = 10;

// Uploaded images are served from the API origin, without the /api part
const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
const imageUrl = (path = "") =>
  /^(https?:|blob:|data:)/.test(path)
    ? path
    : `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;

const EMPTY_FORM = {
  name: "",
  vendor: "",
  city: "",
  area: "",
  address: "",
  description: "",
  rentPerMonth: "",
  serviceModels: [],
  amenities: [],
  lengthOfStay: [],
  roomTypes: [],
  facilities: [],
};

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const norm = (s) => String(s || "").trim().toLowerCase();

// Accepts { data: { key: [...] } }, { key: [...] } or a plain array
const pickList = (res, key) => {
  const body = res.data;
  if (Array.isArray(body?.data?.[key])) return body.data[key];
  if (Array.isArray(body?.[key])) return body[key];
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body)) return body;
  return [];
};

const pickOne = (res, ...keys) => {
  const data = res.data?.data ?? res.data;
  for (const k of keys) if (data?.[k]) return data[k];
  return data;
};

const idOf = (x) => (x && typeof x === "object" ? x._id : x) || "";

const categoryOf = (a) => {
  const c = a.category;
  const name = c && typeof c === "object" ? c.name : c;
  return name || "Other";
};

const messageOf = (err, fallback) => err.response?.data?.message || fallback;

function CheckItem({ checked, onChange, label }) {
  return (
    <label className={`ad-check ${checked ? "is-checked" : ""}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

export default function AdminHomeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const isEdit = Boolean(id);
  const requestId = isEdit ? "" : searchParams.get("request") || "";
  const isAdmin = readUser()?.role === "admin";

  const [cities, setCities] = useState([]);
  const [serviceModels, setServiceModels] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]); // saved image paths (edit mode)
  const [newFiles, setNewFiles] = useState([]); // chosen files (create mode)

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);

  const [vendorDraft, setVendorDraft] = useState(null);
  const [vendorBusy, setVendorBusy] = useState(false);
  const [vendorError, setVendorError] = useState("");

  // Previews for files chosen on the create form
  const previews = useMemo(
    () => newFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [newFiles]
  );
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const toggle = (key, value) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  // Load dropdown data, then the home (edit) or the provider request (prefill)
  useEffect(() => {
    if (!isAdmin) return undefined;

    const controller = new AbortController();
    const opts = { signal: controller.signal };
    setLoading(true);
    setLoadError("");

    (async () => {
      try {
        const [cityRes, modelRes, amenityRes, vendorRes] = await Promise.all([
          api.get("/cities", opts),
          api.get("/service-models", opts),
          api.get("/amenities", opts),
          api.get("/users/vendors", opts),
        ]);

        const cityList = pickList(cityRes, "cities");
        const modelList = pickList(modelRes, "serviceModels");
        const amenityList = pickList(amenityRes, "amenities");
        const vendorList = pickList(vendorRes, "vendors");

        setCities(cityList);
        setServiceModels(modelList);
        setAmenities(amenityList);
        setVendors(vendorList);

        if (isEdit) {
          const res = await api.get(`/homes/admin/${id}`, opts);
          const home = pickOne(res, "home");
          setForm({
            name: home.name || "",
            vendor: idOf(home.vendor),
            city: idOf(home.city),
            area: home.area || "",
            address: home.address || "",
            description: home.description || "",
            rentPerMonth: home.rentPerMonth ?? "",
            serviceModels: (home.serviceModels || []).map(idOf),
            amenities: (home.amenities || []).map(idOf),
            lengthOfStay: home.lengthOfStay || [],
            roomTypes: home.roomTypes || [],
            facilities: home.facilities || [],
          });
          setImages(home.images || []);
        } else if (requestId) {
          const res = await api.get(`/listing-requests/${requestId}`, opts);
          const req = pickOne(res, "listingRequest");
          const care = norm(req.careTypes);

          const vendor = vendorList.find((v) => norm(v.email) === norm(req.email));
          const city = cityList.find((c) => norm(c.name) === norm(req.city));

          setForm({
            ...EMPTY_FORM,
            name: req.propertyName || "",
            description: req.message || "",
            city: city?._id || "",
            vendor: vendor?._id || "",
            serviceModels: modelList
              .filter((m) => m.name && care.includes(norm(m.name)))
              .map((m) => m._id),
            facilities: FACILITIES.filter((f) => care.includes(norm(f))),
          });

          if (!vendor) {
            setVendorDraft({
              name: req.operatorName || "",
              email: req.email || "",
              phone: String(req.phone || "").replace(/\D/g, "").slice(-10),
              password: "",
            });
          }

          setNotice(
            city
              ? "Filled in from the provider request. Check the details, then add photos."
              : `Filled in from the provider request. The city "${req.city}" did not match, so please pick it.`
          );
        }
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;
        if (err.response?.status === 401) {
          navigate("/login", { replace: true, state: { from: "/admin/homes" } });
          return;
        }
        setLoadError(messageOf(err, "We could not load the form. Try again."));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [isAdmin, isEdit, id, requestId, reloadKey, navigate]);

  // ---------- Vendor creation ----------

  const createVendor = async () => {
    const { name, email, phone, password } = vendorDraft;
    if (!name.trim() || !email.trim() || !/^\d{10}$/.test(phone) || password.length < 6) {
      setVendorError(
        "Enter a name, an email, a 10-digit phone number and a password of at least 6 characters."
      );
      return;
    }

    setVendorBusy(true);
    setVendorError("");

    try {
      const res = await api.post("/users/vendors", {
        name: name.trim(),
        email: email.trim(),
        phone,
        password,
      });
      const vendor = pickOne(res, "vendor", "user");
      setVendors((list) => [...list, vendor]);
      setField("vendor", vendor._id);
      setVendorDraft(null);
    } catch (err) {
      setVendorError(messageOf(err, "We could not create the vendor. Try again."));
    } finally {
      setVendorBusy(false);
    }
  };

  // ---------- Images ----------

  const pickNewFiles = (e) => {
    const chosen = Array.from(e.target.files || []);
    e.target.value = "";
    if (!chosen.length) return;

    if (newFiles.length + chosen.length > MAX_IMAGES) {
      setErrors((er) => ({ ...er, images: `You can add up to ${MAX_IMAGES} photos.` }));
      return;
    }
    setNewFiles((list) => [...list, ...chosen]);
    setErrors((er) => ({ ...er, images: "" }));
  };

  const refreshImages = async () => {
    const res = await api.get(`/homes/admin/${id}`);
    setImages(pickOne(res, "home").images || []);
  };

  const uploadMore = async (e) => {
    const chosen = Array.from(e.target.files || []);
    e.target.value = "";
    if (!chosen.length) return;

    if (images.length + chosen.length > MAX_IMAGES) {
      setErrors((er) => ({ ...er, images: `A home can have up to ${MAX_IMAGES} photos.` }));
      return;
    }

    const data = new FormData();
    chosen.forEach((file) => data.append("images", file));

    setImageBusy(true);
    setErrors((er) => ({ ...er, images: "" }));
    try {
      await api.post(`/homes/${id}/images`, data);
      await refreshImages();
    } catch (err) {
      setErrors((er) => ({ ...er, images: messageOf(err, "We could not upload the photos.") }));
    } finally {
      setImageBusy(false);
    }
  };

  const removeSaved = async (path) => {
    if (images.length <= 1) return;
    if (!window.confirm("Remove this photo from the home?")) return;

    setImageBusy(true);
    setErrors((er) => ({ ...er, images: "" }));
    try {
      await api.delete(`/homes/${id}/images`, { data: { images: [path] } });
      setImages((list) => list.filter((p) => p !== path));
    } catch (err) {
      setErrors((er) => ({ ...er, images: messageOf(err, "We could not remove the photo.") }));
    } finally {
      setImageBusy(false);
    }
  };

  // ---------- Submit ----------

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Enter the home's name.";
    if (!isEdit && !form.vendor) e.vendor = "Choose the vendor who owns this home.";
    if (!form.city) e.city = "Choose a city.";
    if (!form.address.trim()) e.address = "Enter the address.";
    if (!form.description.trim()) e.description = "Enter a description.";
    if (form.rentPerMonth === "" || Number(form.rentPerMonth) < 0 || Number.isNaN(Number(form.rentPerMonth))) {
      e.rentPerMonth = "Enter the monthly rent as a number.";
    }
    if (!isEdit && newFiles.length < 1) e.images = "Add at least 1 photo.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setNotice("");
    if (!validate()) return;

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/homes/${id}`, {
          name: form.name.trim(),
          description: form.description.trim(),
          address: form.address.trim(),
          area: form.area.trim(),
          city: form.city,
          rentPerMonth: Number(form.rentPerMonth),
          serviceModels: form.serviceModels,
          amenities: form.amenities,
          lengthOfStay: form.lengthOfStay,
          roomTypes: form.roomTypes,
          facilities: form.facilities,
        });
        setNotice("Changes saved.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const data = new FormData();
        data.append("name", form.name.trim());
        data.append("vendor", form.vendor);
        data.append("city", form.city);
        data.append("area", form.area.trim());
        data.append("address", form.address.trim());
        data.append("description", form.description.trim());
        data.append("rentPerMonth", String(Number(form.rentPerMonth)));
        if (requestId) data.append("listingRequestId", requestId);

        // Array fields are appended once per value
        ["serviceModels", "amenities", "lengthOfStay", "roomTypes", "facilities"].forEach((key) =>
          form[key].forEach((value) => data.append(key, value))
        );
        newFiles.forEach((file) => data.append("images", file));

        await api.post("/homes", data);
        navigate("/admin/homes");
      }
    } catch (err) {
      setSubmitError(messageOf(err, "We could not save the home. Try again."));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  // ---------- Render ----------

  if (!isAdmin) {
    return (
      <main className="ad">
        <div className="ad-container">
          <div className="ad-state">
            <h2>Admins only</h2>
            <p>Only an admin can add and manage homes.</p>
          </div>
        </div>
      </main>
    );
  }

  const amenityGroups = amenities.reduce((groups, a) => {
    const key = categoryOf(a);
    (groups[key] = groups[key] || []).push(a);
    return groups;
  }, {});

  const fieldError = (key) =>
    errors[key] ? (
      <p className="ad-error" id={`${key}-error`} role="alert">
        {errors[key]}
      </p>
    ) : null;

  const invalid = (key) => (errors[key] ? { "aria-invalid": "true", "aria-describedby": `${key}-error` } : {});

  return (
    <main className="ad">
      <div className="ad-container">
        <button type="button" className="ad-back" onClick={() => navigate("/admin/homes")}>
          ← Back to homes
        </button>

        <header className="ad-head">
          <div>
            <h1>{isEdit ? "Edit home" : "Add home"}</h1>
            <p>
              {isEdit
                ? "Update the details and photos of this home."
                : "Fill in the details of the home and add at least one photo."}
            </p>
          </div>
        </header>

        {loadError ? (
          <div className="ad-state" role="alert">
            <h2>We could not load the form</h2>
            <p>{loadError}</p>
            <button
              type="button"
              className="ad-btn ad-btn--solid"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="ad-skeletons" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="ad-skeleton" />
            ))}
          </div>
        ) : (
          <>
            {notice && (
              <p className="ad-notice" role="status">
                {notice}
              </p>
            )}
            {submitError && (
              <p className="ad-banner" role="alert">
                {submitError}
              </p>
            )}

            <form className="ad-form" onSubmit={submit} noValidate>
              {/* ---------- Basics ---------- */}
              <section className="ad-card">
                <h2>Basic details</h2>
                <p className="ad-card__intro">Where the home is and who owns it.</p>

                {vendorDraft && (
                  <div className="ad-panel" style={{ marginBottom: 20 }}>
                    <h3>Create vendor from this request</h3>
                    <p>
                      No vendor account matches this request's email. Create one, and it will
                      be selected for this home.
                    </p>
                    <div className="ad-grid">
                      <div className="ad-field">
                        <label htmlFor="v-name">Name</label>
                        <input
                          id="v-name"
                          className="ad-input"
                          value={vendorDraft.name}
                          onChange={(e) => setVendorDraft({ ...vendorDraft, name: e.target.value })}
                        />
                      </div>
                      <div className="ad-field">
                        <label htmlFor="v-email">Email</label>
                        <input
                          id="v-email"
                          type="email"
                          className="ad-input"
                          value={vendorDraft.email}
                          onChange={(e) => setVendorDraft({ ...vendorDraft, email: e.target.value })}
                        />
                      </div>
                      <div className="ad-field">
                        <label htmlFor="v-phone">Phone (10 digits)</label>
                        <input
                          id="v-phone"
                          inputMode="numeric"
                          maxLength={10}
                          className="ad-input"
                          value={vendorDraft.phone}
                          onChange={(e) =>
                            setVendorDraft({ ...vendorDraft, phone: e.target.value.replace(/\D/g, "") })
                          }
                        />
                      </div>
                      <div className="ad-field">
                        <label htmlFor="v-password">Temporary password</label>
                        <input
                          id="v-password"
                          type="text"
                          autoComplete="off"
                          className="ad-input"
                          value={vendorDraft.password}
                          onChange={(e) => setVendorDraft({ ...vendorDraft, password: e.target.value })}
                        />
                        <p className="ad-hint">Share this with the vendor so they can sign in.</p>
                      </div>
                    </div>
                    {vendorError && (
                      <p className="ad-error" role="alert" style={{ marginTop: 12 }}>
                        {vendorError}
                      </p>
                    )}
                    <div className="ad-panel__actions">
                      <button
                        type="button"
                        className="ad-btn ad-btn--solid"
                        disabled={vendorBusy}
                        onClick={createVendor}
                      >
                        {vendorBusy ? "Creating…" : "Create vendor"}
                      </button>
                      <button
                        type="button"
                        className="ad-btn ad-btn--ghost"
                        disabled={vendorBusy}
                        onClick={() => setVendorDraft(null)}
                      >
                        Choose from the list instead
                      </button>
                    </div>
                  </div>
                )}

                <div className="ad-grid">
                  <div className="ad-field ad-field--wide">
                    <label htmlFor="name">Home name</label>
                    <input
                      id="name"
                      className="ad-input"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      {...invalid("name")}
                    />
                    {fieldError("name")}
                  </div>

                  <div className="ad-field">
                    <label htmlFor="vendor">Vendor</label>
                    <select
                      id="vendor"
                      className="ad-input"
                      value={form.vendor}
                      disabled={isEdit}
                      onChange={(e) => setField("vendor", e.target.value)}
                      {...invalid("vendor")}
                    >
                      <option value="">Select a vendor</option>
                      {vendors.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.name}
                          {v.email ? ` (${v.email})` : ""}
                        </option>
                      ))}
                    </select>
                    {isEdit && <p className="ad-hint">The vendor cannot be changed after the home is created.</p>}
                    {!isEdit && !vendorDraft && (
                      <button
                        type="button"
                        className="ad-link"
                        style={{ justifySelf: "start" }}
                        onClick={() =>
                          setVendorDraft({ name: "", email: "", phone: "", password: "" })
                        }
                      >
                        Vendor not in the list? Create one
                      </button>
                    )}
                    {fieldError("vendor")}
                  </div>

                  <div className="ad-field">
                    <label htmlFor="city">City</label>
                    <select
                      id="city"
                      className="ad-input"
                      value={form.city}
                      onChange={(e) => setField("city", e.target.value)}
                      {...invalid("city")}
                    >
                      <option value="">Select a city</option>
                      {cities.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {fieldError("city")}
                  </div>

                  <div className="ad-field">
                    <label htmlFor="area">Area</label>
                    <input
                      id="area"
                      className="ad-input"
                      value={form.area}
                      onChange={(e) => setField("area", e.target.value)}
                    />
                  </div>

                  <div className="ad-field">
                    <label htmlFor="rent">Rent per month (₹)</label>
                    <input
                      id="rent"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      className="ad-input"
                      value={form.rentPerMonth}
                      onChange={(e) => setField("rentPerMonth", e.target.value)}
                      {...invalid("rentPerMonth")}
                    />
                    {fieldError("rentPerMonth")}
                  </div>

                  <div className="ad-field ad-field--wide">
                    <label htmlFor="address">Address</label>
                    <input
                      id="address"
                      className="ad-input"
                      value={form.address}
                      onChange={(e) => setField("address", e.target.value)}
                      {...invalid("address")}
                    />
                    <p className="ad-hint">The map location is taken from the city automatically.</p>
                    {fieldError("address")}
                  </div>

                  <div className="ad-field ad-field--wide">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      className="ad-input"
                      value={form.description}
                      onChange={(e) => setField("description", e.target.value)}
                      {...invalid("description")}
                    />
                    {fieldError("description")}
                  </div>
                </div>
              </section>

              {/* ---------- Care ---------- */}
              <section className="ad-card">
                <h2>Care and rooms</h2>
                <p className="ad-card__intro">What kind of care the home offers and how people can stay.</p>

                <div className="ad-grid">
                  <fieldset className="ad-field ad-field--wide">
                    <legend>Service models</legend>
                    {serviceModels.length === 0 ? (
                      <p className="ad-hint">No service models found.</p>
                    ) : (
                      <div className="ad-check-grid">
                        {serviceModels.map((m) => (
                          <CheckItem
                            key={m._id}
                            label={m.name}
                            checked={form.serviceModels.includes(m._id)}
                            onChange={() => toggle("serviceModels", m._id)}
                          />
                        ))}
                      </div>
                    )}
                  </fieldset>

                  <fieldset className="ad-field ad-field--wide">
                    <legend>Length of stay</legend>
                    <div className="ad-check-grid">
                      {LENGTH_OF_STAY.map((o) => (
                        <CheckItem
                          key={o.value}
                          label={o.label}
                          checked={form.lengthOfStay.includes(o.value)}
                          onChange={() => toggle("lengthOfStay", o.value)}
                        />
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="ad-field ad-field--wide">
                    <legend>Room types</legend>
                    <div className="ad-check-grid">
                      {ROOM_TYPES.map((o) => (
                        <CheckItem
                          key={o.value}
                          label={o.label}
                          checked={form.roomTypes.includes(o.value)}
                          onChange={() => toggle("roomTypes", o.value)}
                        />
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="ad-field ad-field--wide">
                    <legend>Facilities</legend>
                    <div className="ad-check-grid">
                      {FACILITIES.map((f) => (
                        <CheckItem
                          key={f}
                          label={f}
                          checked={form.facilities.includes(f)}
                          onChange={() => toggle("facilities", f)}
                        />
                      ))}
                    </div>
                  </fieldset>
                </div>
              </section>

              {/* ---------- Amenities ---------- */}
              <section className="ad-card">
                <h2>Amenities</h2>
                <p className="ad-card__intro">Choose everything the home provides.</p>
                {amenities.length === 0 ? (
                  <p className="ad-hint">No amenities found.</p>
                ) : (
                  Object.entries(amenityGroups).map(([category, list]) => (
                    <div className="ad-group" key={category}>
                      <h3>{category}</h3>
                      <div className="ad-check-grid">
                        {list.map((a) => (
                          <CheckItem
                            key={a._id}
                            label={a.name}
                            checked={form.amenities.includes(a._id)}
                            onChange={() => toggle("amenities", a._id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </section>

              {/* ---------- Photos ---------- */}
              <section className="ad-card">
                <h2>Photos</h2>
                <p className="ad-card__intro">
                  {isEdit
                    ? `A home must keep at least 1 photo (up to ${MAX_IMAGES}). Changes to photos are saved straight away.`
                    : `Add at least 1 photo, up to ${MAX_IMAGES}.`}
                </p>

                {isEdit ? (
                  <>
                    <div className="ad-images">
                      {images.map((path) => (
                        <div className="ad-image" key={path}>
                          <img src={imageUrl(path)} alt="" />
                          <button
                            type="button"
                            className="ad-image__remove"
                            disabled={imageBusy || images.length <= 1}
                            title={images.length <= 1 ? "A home must keep at least 1 photo" : undefined}
                            onClick={() => removeSaved(path)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    {images.length < MAX_IMAGES && (
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="ad-upload"
                        disabled={imageBusy}
                        onChange={uploadMore}
                        aria-label="Add images"
                      />
                    )}
                  </>
                ) : (
                  <>
                    {previews.length > 0 && (
                      <div className="ad-images">
                        {previews.map((p, i) => (
                          <div className="ad-image" key={p.url}>
                            <img src={p.url} alt="" />
                            <button
                              type="button"
                              className="ad-image__remove"
                              onClick={() => setNewFiles((list) => list.filter((_, j) => j !== i))}
                            >
                              Remove
                            </button>
                            <span className="ad-image__name">{p.file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {newFiles.length < MAX_IMAGES && (
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="ad-upload"
                        onChange={pickNewFiles}
                        aria-label="Add images"
                        {...invalid("images")}
                      />
                    )}
                  </>
                )}
                {imageBusy && <p className="ad-hint" style={{ marginTop: 10 }}>Working on the photos…</p>}
                <div style={{ marginTop: 10 }}>{fieldError("images")}</div>
              </section>

              <div className="ad-form__actions">
                <button
                  type="button"
                  className="ad-btn ad-btn--ghost"
                  disabled={saving}
                  onClick={() => navigate("/admin/homes")}
                >
                  {isEdit ? "Back to homes" : "Cancel"}
                </button>
                <button type="submit" className="ad-btn ad-btn--solid" disabled={saving || imageBusy}>
                  {saving ? "Saving…" : isEdit ? "Save changes" : "Add home"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}