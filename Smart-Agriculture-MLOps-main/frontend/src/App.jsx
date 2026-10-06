import { useEffect, useMemo, useState } from "react";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.detail || "The request could not be completed.");
  return data;
}

const slides = [
  {
    eyebrow: "Field intelligence · 01",
    title: "Grow more with every season.",
    copy: "Make confident decisions with one calm, clear view of your farm.",
    accent: "From soil to harvest",
    className: "hero-slide-one",
  },
  {
    eyebrow: "Precision agriculture · 02",
    title: "Give every crop its best chance.",
    copy: "Turn weather, soil and crop signals into simple actions for today.",
    accent: "Recommendations that matter",
    className: "hero-slide-two",
  },
  {
    eyebrow: "Smarter harvests · 03",
    title: "The future of farming feels natural.",
    copy: "Spot opportunities early, reduce waste and grow sustainably.",
    accent: "Built for the field",
    className: "hero-slide-three",
  },
];

const tools = [
  { icon: "sprout", label: "Crop recommendation", detail: "Find your ideal crop", color: "mint" },
  { icon: "droplet", label: "Irrigation planner", detail: "Save water, grow better", color: "blue" },
  { icon: "chart", label: "Yield forecast", detail: "Plan with confidence", color: "yellow" },
];

const services = [
  { icon: "sprout", title: "Crop recommendation", copy: "Discover the best crop for your soil, climate and season.", color: "mint" },
  { icon: "leaf", title: "Fertilizer recommendation", copy: "Get a balanced nutrient plan to keep every field thriving.", color: "violet" },
  { icon: "droplet", title: "Irrigation prediction", copy: "Know when and how much to water while saving every drop.", color: "blue" },
  { icon: "chart", title: "Price prediction", copy: "Plan your market timing with data-backed price forecasts.", color: "gold" },
  { icon: "chart", title: "Yield prediction", copy: "Estimate harvest output early and make better farm plans.", color: "orange" },
];

const serviceConfigs = {
  "Crop recommendation": {
    icon: "sprout", color: "mint", kicker: "CROP INTELLIGENCE", title: "Find the right crop for your field.", copy: "Use soil nutrients, climate and rainfall conditions to discover a crop that can thrive.",
    fields: [
      ["N", "Nitrogen (N)", "number", "90"], ["P", "Phosphorus (P)", "number", "42"], ["K", "Potassium (K)", "number", "43"],
      ["temperature", "Temperature (°C)", "number", "24"], ["humidity", "Humidity (%)", "number", "72"], ["ph", "Soil pH", "number", "6.5"], ["rainfall", "Rainfall (mm)", "number", "180"],
    ],
    result: "Rice", resultCopy: "is looking like a strong match for your field.", confidence: "94%",
  },
  "Fertilizer recommendation": {
    icon: "leaf", color: "violet", kicker: "NUTRIENT PLANNER", title: "Build a healthier soil plan.", copy: "Balance soil health and crop needs with a clear fertilizer recommendation for each growth stage.",
    fields: [
      ["Soil_Type", "Soil type", "select", "Loamy", ["Clay", "Loamy", "Sandy", "Black"]],
      ["Soil_pH", "Soil pH", "number", "6.1"], ["Soil_Moisture", "Soil moisture (%)", "number", "35"], ["Organic_Carbon", "Organic carbon", "number", "0.42"],
      ["Nitrogen_Level", "Nitrogen level", "number", "61"], ["Phosphorus_Level", "Phosphorus level", "number", "44"], ["Potassium_Level", "Potassium level", "number", "84"],
      ["Crop_Type", "Crop type", "select", "Wheat", ["Wheat", "Rice", "Cotton", "Maize"]], ["Crop_Growth_Stage", "Growth stage", "select", "Vegetative", ["Germination", "Vegetative", "Flowering", "Harvest"]], ["Season", "Season", "select", "Rabi", ["Kharif", "Rabi", "Summer"]],
    ],
    result: "MOP", resultCopy: "is the recommended fertilizer for this crop stage.", confidence: "91%",
  },
  "Irrigation prediction": {
    icon: "droplet", color: "blue", kicker: "WATER INTELLIGENCE", title: "Water only when your field needs it.", copy: "Combine moisture, weather, crop and field data to make irrigation more efficient.",
    fields: [
      ["Soil_Type", "Soil type", "select", "Clay", ["Clay", "Loamy", "Sandy", "Black"]], ["Soil_pH", "Soil pH", "number", "6.1"], ["Soil_Moisture", "Soil moisture (%)", "number", "36"],
      ["Temperature_C", "Temperature (°C)", "number", "21.9"], ["Humidity", "Humidity (%)", "number", "31"], ["Rainfall_mm", "Rainfall (mm)", "number", "1167"], ["Sunlight_Hours", "Sunlight hours", "number", "4"],
      ["Crop_Type", "Crop type", "select", "Wheat", ["Wheat", "Rice", "Cotton", "Maize"]], ["Crop_Growth_Stage", "Growth stage", "select", "Vegetative", ["Germination", "Vegetative", "Flowering", "Harvest"]], ["Field_Area_hectare", "Field area (hectares)", "number", "4.7"],
    ],
    result: "Low", resultCopy: "irrigation need today. Your field can wait.", confidence: "88%",
  },
  "Price prediction": {
    icon: "chart", color: "gold", kicker: "MARKET OUTLOOK", title: "Plan your selling moment.", copy: "Review commodity, location and market movement to make a more confident price plan.",
    fields: [
      ["month", "Forecast month", "month", "2025-03"], ["commodity_name", "Commodity", "select", "Maize", ["Maize", "Wheat", "Rice", "Cotton", "Soybean"]], ["state_name", "State", "text", "India"], ["district_name", "District", "text", "All"],
      ["avg_modal_price", "Average modal price (₹)", "number", "2341.58"], ["avg_min_price", "Average minimum price (₹)", "number", "2191.23"], ["avg_max_price", "Average maximum price (₹)", "number", "2402.98"], ["change", "Recent change (%)", "number", "-14.43"],
    ],
    result: "₹2,475", resultCopy: "estimated modal price next month.", confidence: "86%",
  },
  "Yield prediction": {
    icon: "chart", color: "orange", kicker: "HARVEST FORECAST", title: "See your harvest before it arrives.", copy: "Estimate yield from your crop, field size, planting date and growing inputs.",
    fields: [
      ["Crop Type", "Crop type", "select", "Soybean", ["Soybean", "Wheat", "Rice", "Maize", "Cotton"]], ["Field Size (hectares)", "Field size (hectares)", "number", "1.04"], ["Planting Date", "Planting date", "date", "2025-06-08"],
      ["Soil Type", "Soil type", "select", "Loamy", ["Clay", "Loamy", "Sandy", "Black"]], ["Fertilizer Used", "Fertilizer used", "select", "Urea", ["Urea", "MOP", "DAP", "NPK"]], ["Irrigation Type", "Irrigation type", "select", "Furrow / Canal irrigation", ["Rainfed", "Drip irrigation", "Furrow / Canal irrigation"]],
    ],
    result: "1.46 t/ha", resultCopy: "estimated yield for this field.", confidence: "89%",
  },
};

function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    sprout: <><path d="M12 21V11" /><path d="M12 15c-3.8 0-6-2.2-6-6 3.8 0 6 2.2 6 6Z" /><path d="M12 12c0-3.8 2.2-6 6-6 0 3.8-2.2 6-6 6Z" /></>,
    droplet: <path d="M12 3.5S5.8 10.1 5.8 14.7a6.2 6.2 0 0 0 12.4 0C18.2 10.1 12 3.5 12 3.5Z" />,
    chart: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 3-4 3 2 5-6" /></>,
    leaf: <><path d="M20 4C10 4 4 8 4 15c0 3 2 5 5 5 7 0 11-6 11-16Z" /><path d="M4 20c3-5 7-8 12-10" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L7.3 8l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.4v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19 8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v2.4h-.2a1.7 1.7 0 0 0-1.5 1Z" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function ServicePage({ serviceName, onBack, showNotice }) {
  const config = serviceConfigs[serviceName];
  const initialValues = Object.fromEntries(config.fields.map(([key, , , value]) => [key, value]));
  const [values, setValues] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
    setSubmitted(false);
    setPrediction(null);
    setError("");
  };

  const submitPrediction = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const endpointByService = {
      "Crop recommendation": "/api/crop/recommend",
      "Fertilizer recommendation": "/api/fertilizer/predict",
      "Irrigation prediction": "/api/irrigation/predict",
      "Price prediction": "/api/price/predict",
      "Yield prediction": "/api/yield/predict",
    };
    const payload = { ...values };
    if (serviceName === "Yield prediction") {
      Object.assign(payload, {
        Crop_Type: payload["Crop Type"],
        Field_Size_hectares: payload["Field Size (hectares)"],
        Planting_Date: payload["Planting Date"],
        Soil_Type: payload["Soil Type"],
        Fertilizer_Used: payload["Fertilizer Used"],
        Irrigation_Type: payload["Irrigation Type"],
      });
      ["Crop Type", "Field Size (hectares)", "Planting Date", "Soil Type", "Fertilizer Used", "Irrigation Type"].forEach((key) => delete payload[key]);
    }

    try {
      const data = await apiRequest(endpointByService[serviceName], {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setPrediction(data.prediction);
      setSubmitted(true);
      showNotice(`${serviceName} completed`);
    } catch (requestError) {
      setError(requestError.message);
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service-page">
      <button className="back-button" onClick={onBack}><Icon name="arrow" size={16} /> Back to overview</button>
      <section className="service-page-header">
        <div className={`service-page-icon ${config.color}`}><Icon name={config.icon} size={29} /></div>
        <div><span className="section-kicker">{config.kicker}</span><h1>{config.title}</h1><p>{config.copy}</p></div>
      </section>
      <div className="service-layout">
        <form className="input-card" onSubmit={submitPrediction}>
          <div className="input-card-heading"><div><span className="section-kicker">FIELD DETAILS</span><h2>Tell us about your field</h2></div><span className="step-count">STEP 1 OF 1</span></div>
          <div className="service-form-grid">{config.fields.map(([key, label, type, value, options]) => <label className="field-label" key={key}>{label}{type === "select" ? <select value={values[key]} onChange={(event) => updateValue(key, event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input type={type} value={values[key]} onChange={(event) => updateValue(key, event.target.value)} />}</label>)}</div>
          <button className="primary-service-button" type="submit" disabled={loading}>{loading ? "Generating..." : `Generate ${serviceName.toLowerCase()}`} {!loading && <Icon name="arrow" size={17} />}</button>
          {error && <p className="form-error">{error}</p>}
        </form>
        <aside className={`service-result ${submitted ? "result-ready" : ""}`}>
          <span className="result-label">YOUR {config.kicker}</span>
          <div className="result-orb"><Icon name={config.icon} size={34} /></div>
          <p className="result-intro">{submitted ? "Your personalized result is ready" : "Your result will appear here"}</p>
          <strong>{submitted ? (serviceName === "Price prediction" ? `₹${Number(prediction).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : serviceName === "Yield prediction" ? `${Number(prediction).toFixed(2)} t/ha` : prediction) : "— —"}</strong>
          <p>{submitted ? config.resultCopy : "Complete the field details to get a clear recommendation."}</p>
          <div className="confidence"><span>Prediction source</span><b>{submitted ? "Live model" : "—"}</b><i><em style={{ width: submitted ? "100%" : "8%" }} /></i></div>
          <small className="frontend-note">Live result from the agriculture model API</small>
        </aside>
      </div>
    </div>
  );
}

function WorkspacePage({ page, onOpenService, showNotice }) {
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("All fields");
  const [fields, setFields] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [fieldsError, setFieldsError] = useState("");
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [newField, setNewField] = useState({ name: "", crop: "Wheat", area_hectares: "", status: "Growing well", progress: 0 });
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [notifications, setNotifications] = useState(true);
  const [units, setUnits] = useState("Metric");
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherCity, setWeatherCity] = useState("");
  const [weatherQuery, setWeatherQuery] = useState("");
  const weatherApiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (page !== "My fields") return undefined;
    let cancelled = false;
    setFieldsLoading(true);
    setFieldsError("");
    apiRequest("/api/fields")
      .then((data) => { if (!cancelled) setFields(data); })
      .catch((error) => { if (!cancelled) setFieldsError(error.message); })
      .finally(() => { if (!cancelled) setFieldsLoading(false); });
    return () => { cancelled = true; };
  }, [page]);

  useEffect(() => {
    if (page !== "Insights") return undefined;
    let cancelled = false;
    apiRequest("/api/insights")
      .then((data) => { if (!cancelled) setInsights(data); })
      .catch((error) => { if (!cancelled) setSettingsMessage(error.message); });
    return () => { cancelled = true; };
  }, [page]);

  useEffect(() => {
    if (page !== "Recommendations") return undefined;
    let cancelled = false;
    apiRequest("/api/fields")
      .then((data) => {
        if (!cancelled) setRecommendations(data.map((field) => ({
          ...field,
          action: field.status === "Needs attention"
            ? "Review field conditions and run the relevant prediction."
            : field.status === "Ready for harvest"
              ? "Check the yield forecast before planning harvest."
              : "Run a crop or irrigation analysis for this field.",
        })));
      })
      .catch((error) => { if (!cancelled) setFieldsError(error.message); });
    return () => { cancelled = true; };
  }, [page]);

  useEffect(() => {
    if (page !== "Settings") return undefined;
    let cancelled = false;
    apiRequest("/api/settings")
      .then((data) => {
        if (cancelled) return;
        setNotifications(data.weather_alerts);
        setUnits(data.units);
        setWeeklyDigest(data.weekly_digest);
      })
      .catch((error) => { if (!cancelled) setSettingsMessage(error.message); });
    return () => { cancelled = true; };
  }, [page]);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const addField = async (event) => {
    event.preventDefault();
    setFieldsError("");
    try {
      const created = await apiRequest("/api/fields", {
        method: "POST",
        body: JSON.stringify({ ...newField, area_hectares: Number(newField.area_hectares) }),
      });
      setFields((current) => [created, ...current]);
      setNewField({ name: "", crop: "Wheat", area_hectares: "", status: "Growing well", progress: 0 });
      setShowFieldForm(false);
      showNotice("Field added");
    } catch (error) {
      setFieldsError(error.message);
    }
  };

  const saveField = async (field) => {
    setFieldsError("");
    try {
      const updated = await apiRequest(`/api/fields/${field.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: field.name,
          crop: field.crop,
          area_hectares: Number(field.area_hectares),
          status: field.status,
          progress: Number(field.progress),
        }),
      });
      setFields((current) => current.map((item) => item.id === updated.id ? updated : item));
      showNotice(`${field.name} updated`);
    } catch (error) {
      setFieldsError(error.message);
    }
  };

  const deleteField = async (field) => {
    setFieldsError("");
    try {
      await apiRequest(`/api/fields/${field.id}`, { method: "DELETE" });
      setFields((current) => current.filter((item) => item.id !== field.id));
      showNotice(`${field.name} removed`);
    } catch (error) {
      setFieldsError(error.message);
    }
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    setSettingsMessage("");
    try {
      const saved = await apiRequest("/api/settings", {
        method: "PUT",
        body: JSON.stringify({ weather_alerts: notifications, units, weekly_digest: weeklyDigest }),
      });
      setNotifications(saved.weather_alerts);
      setUnits(saved.units);
      setWeeklyDigest(saved.weekly_digest);
      setSettingsMessage("Preferences saved.");
    } catch (error) {
      setSettingsMessage(error.message);
    } finally {
      setSettingsSaving(false);
    }
  };

  useEffect(() => {
    if (page !== "Weather station") return undefined;
    let cancelled = false;
    setWeatherLoading(true);
    setWeatherError("");
    const locationQuery = weatherCity ? `?city=${encodeURIComponent(weatherCity)}` : "";
    fetch(`${weatherApiUrl}/api/weather${locationQuery}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Unable to load weather.");
        if (data.configured === false) throw new Error(data.detail);
        return data;
      })
      .then((data) => {
        if (!cancelled) setWeather(data);
      })
      .catch((error) => {
        if (!cancelled) setWeatherError(error.message);
      })
      .finally(() => {
        if (!cancelled) setWeatherLoading(false);
      });
    return () => { cancelled = true; };
  }, [page, weatherApiUrl, weatherCity]);
  const filteredFields = fields.filter(({ name, crop, status }) =>
    `${name} ${crop}`.toLowerCase().includes(search.toLowerCase())
    && (fieldFilter === "All fields" || status === fieldFilter)
  );

  if (page === "My fields") return (
    <div className="workspace-page">
      <div className="workspace-page-heading"><div><span className="section-kicker">FIELD MANAGEMENT</span><h1>Your fields, all in one place.</h1><p>Keep track of crop health, area and the next best action.</p></div><button className="primary-small" onClick={() => setShowFieldForm((open) => !open)}><Icon name="plus" size={16} /> {showFieldForm ? "Cancel" : "Add field"}</button></div>
      {showFieldForm && <form className="input-card field-create-form" onSubmit={addField}><h2>Add a field</h2><div className="service-form-grid"><label className="field-label">Field name<input required maxLength="80" value={newField.name} onChange={(event) => setNewField({ ...newField, name: event.target.value })} /></label><label className="field-label">Crop<select value={newField.crop} onChange={(event) => setNewField({ ...newField, crop: event.target.value })}>{["Wheat", "Rice", "Cotton", "Maize", "Soybean"].map((crop) => <option key={crop}>{crop}</option>)}</select></label><label className="field-label">Area (hectares)<input required type="number" min="0.01" step="0.01" value={newField.area_hectares} onChange={(event) => setNewField({ ...newField, area_hectares: event.target.value })} /></label><label className="field-label">Status<select value={newField.status} onChange={(event) => setNewField({ ...newField, status: event.target.value })}><option>Growing well</option><option>Needs attention</option><option>Ready for harvest</option></select></label></div><button className="primary-service-button" type="submit">Save field</button></form>}
      {fieldsError && <p className="form-error">{fieldsError}</p>}
      <div className="toolbar-card"><div className="search-box">⌕<input placeholder="Search fields or crops" value={search} onChange={(event) => setSearch(event.target.value)} /></div><select className="filter-button" value={fieldFilter} onChange={(event) => setFieldFilter(event.target.value)}><option>All fields</option><option>Growing well</option><option>Needs attention</option><option>Ready for harvest</option></select></div>
      {fieldsLoading ? <p>Loading your saved fields…</p> : filteredFields.length ? <div className="field-grid">{filteredFields.map((field) => <article className="field-card" key={field.id}><div className={`field-image ${field.status === "Needs attention" ? "amber" : field.status === "Ready for harvest" ? "blue" : "green"}`}><span>{field.crop}</span><i>✦</i></div><div className="field-card-body"><div><h3>{field.name}</h3><p>{field.crop} · {Number(field.area_hectares).toFixed(2)} ha</p></div><label className="field-status-select">Status<select value={field.status} onChange={(event) => saveField({ ...field, status: event.target.value })}><option>Growing well</option><option>Needs attention</option><option>Ready for harvest</option></select></label><div className="field-progress"><span>Season progress</span><b>{field.progress}%</b><i><em style={{ width: `${field.progress}%` }} /></i></div><div className="field-actions"><button onClick={() => onOpenService("Crop recommendation")}>Analyze <Icon name="arrow" size={14} /></button><button className="danger-link" onClick={() => deleteField(field)}>Remove</button></div></div></article>)}</div> : <div className="empty-insight"><span>✦</span><div><h3>{search ? "No matching fields" : "No fields added yet"}</h3><p>{search ? "Try a different field name or crop." : "Add your first field to start tracking your farm."}</p></div><button onClick={() => setShowFieldForm(true)}>Add a field <Icon name="arrow" size={14} /></button></div>}
    </div>
  );

  if (page === "Recommendations") return (
    <div className="workspace-page">
      <div className="workspace-page-heading"><div><span className="section-kicker">RECOMMENDATIONS</span><h1>Clear next steps for your farm.</h1><p>Personalized actions based on your field conditions and season.</p></div></div>
      {fieldsError && <p className="form-error">{fieldsError}</p>}
      {recommendations.length ? <div className="recommendation-list">{recommendations.map((field) => <article className="recommendation-row" key={field.id}><span className={`service-icon ${field.status === "Needs attention" ? "violet" : "mint"}`}><Icon name="sprout" size={22} /></span><div><span className="section-kicker">{field.crop.toUpperCase()} · {field.area_hectares} HA</span><h3>{field.name}: {field.status}</h3><p>{field.action}</p></div><button onClick={() => onOpenService(field.status === "Ready for harvest" ? "Yield prediction" : field.status === "Needs attention" ? "Irrigation prediction" : "Crop recommendation")}>Analyze <Icon name="arrow" size={14} /></button></article>)}</div> : !fieldsError && <div className="empty-insight"><span>✦</span><div><h3>Add a field to get started</h3><p>Recommendations are built from your field list. Add a field, then choose an analysis.</p></div><button onClick={() => setActiveNav("My fields")}>Manage fields <Icon name="arrow" size={14} /></button></div>}
      <div className="empty-insight"><span>✦</span><div><h3>Run an AI analysis</h3><p>Use crop, fertilizer, irrigation, price, or yield prediction models for your farm.</p></div><button onClick={() => onOpenService("Crop recommendation")}>Start analysis <Icon name="arrow" size={14} /></button></div>
    </div>
  );

  if (page === "Insights") return (
    <div className="workspace-page">
      <div className="workspace-page-heading"><div><span className="section-kicker">FARM INSIGHTS</span><h1>See the story behind your numbers.</h1><p>Metrics and prediction history from your saved farm data.</p></div><span className="chart-pill">Live farm data</span></div>
      {insights ? <><div className="insight-metric-grid"><article><span>Managed fields</span><strong>{insights.field_count}</strong><b>{insights.crop_count} crop types</b></article><article><span>Tracked land</span><strong>{insights.total_area_hectares} <small>ha</small></strong><b>From your saved fields</b></article><article><span>Model predictions</span><strong>{insights.prediction_count}</strong><b>Completed analyses</b></article></div><div className="insight-panels"><article className="insight-chart-card"><div className="panel-heading"><div><span className="section-kicker">LIVE MODEL HISTORY</span><h3>Recent predictions</h3></div></div>{insights.recent_predictions?.length ? <div className="yield-history">{insights.recent_predictions.map((item, index) => <div key={`${item.date}-${index}`}><span><b>{item.model}</b><small>{new Date(item.date).toLocaleString()}</small></span><strong>{item.model === "Price prediction" ? `₹${Number(item.result).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : item.model === "Yield prediction" ? `${Number(item.result).toFixed(2)} t/ha` : String(item.result)}</strong></div>)}</div> : <p className="empty-copy">Run any prediction model to show its live result here.</p>}</article><article className="insight-tasks"><div className="panel-heading"><div><span className="section-kicker">NEXT ACTIONS</span><h3>Explore farm models</h3></div></div>{["Crop recommendation", "Fertilizer recommendation", "Irrigation prediction", "Price prediction", "Yield prediction"].map((service) => <button className="insight-action" key={service} onClick={() => onOpenService(service)}>{service}<Icon name="arrow" size={14} /></button>)}</article></div></> : <p>{settingsMessage || "Loading your farm insights…"}</p>}
    </div>
  );

  if (page === "Weather station") return (
    <div className="workspace-page">
      <div className="workspace-page-heading"><div><span className="section-kicker">WEATHER STATION</span><h1>Know what the sky is planning.</h1><p>Live conditions and forecast from OpenWeatherMap for the selected city.</p></div><span className="live-chip"><i /> {weatherLoading ? "Updating..." : "Live forecast"}</span></div>
      <form className="weather-location-form" onSubmit={(event) => { event.preventDefault(); setWeatherError(""); setWeather(null); setWeatherCity(weatherQuery.trim()); }}><input name="city" placeholder="Search city, e.g. Hyderabad" value={weatherQuery} onChange={(event) => setWeatherQuery(event.target.value)} /><button className="primary-small" type="submit" disabled={weatherLoading}>Get forecast</button></form>
      {weatherError && <p className="form-error">{weatherError}</p>}
      {!weather && !weatherError && !weatherLoading && <p className="empty-copy">Add an OpenWeatherMap key in backend/.env to enable live weather. You can enter a city and retry when configured.</p>}
      {weather && <><div className="weather-dashboard"><div className="current-weather"><div className="weather-sun large"><Icon name="sun" size={39} /></div><div><strong>{weather.current.temperature}°</strong><span>{weather.current.description}</span><small>{weather.location}{weather.country ? `, ${weather.country}` : ""} · Updated just now</small></div></div><div className="weather-reading"><span>Humidity</span><strong>{weather.current.humidity}%</strong><i><em style={{ width: `${weather.current.humidity}%` }} /></i></div><div className="weather-reading"><span>Wind speed</span><strong>{weather.current.wind_speed} km/h</strong><i><em style={{ width: `${Math.min(weather.current.wind_speed * 3, 100)}%` }} /></i></div><div className="weather-reading"><span>Rain chance</span><strong>{weather.current.rain_probability}%</strong><i><em style={{ width: `${weather.current.rain_probability}%` }} /></i></div></div>
      <div className="forecast-card"><div className="panel-heading"><div><span className="section-kicker">5-DAY OUTLOOK</span><h3>Plan around the weather</h3></div></div><div className="forecast-row">{weather.forecast.map((day) => <div key={day.date}><span>{new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" })}</span><Icon name={day.rain_probability > 40 ? "droplet" : "sun"} size={22} /><strong>{day.high}°</strong><small>{day.rain_probability}% rain</small></div>)}</div></div></>}
    </div>
  );

  return (
    <div className="workspace-page">
      <div className="workspace-page-heading"><div><span className="section-kicker">PREFERENCES</span><h1>Make field.ly work your way.</h1><p>Choose how your workspace looks and keeps you updated.</p></div></div>
      <div className="settings-card"><label><span><strong>Weather alerts</strong><small>Save whether you want weather notifications enabled.</small></span><input type="checkbox" checked={notifications} onChange={(event) => setNotifications(event.target.checked)} /><i /></label><label><span><strong>Measurement units</strong><small>Use the unit system that feels natural for your farm.</small></span><select value={units} onChange={(event) => setUnits(event.target.value)}><option>Metric</option><option>Imperial</option></select></label><label><span><strong>Weekly farm digest</strong><small>Store your weekly farm digest preference.</small></span><input type="checkbox" checked={weeklyDigest} onChange={(event) => setWeeklyDigest(event.target.checked)} /><i /></label></div>
      <button className="primary-small save-settings" onClick={saveSettings} disabled={settingsSaving}>{settingsSaving ? "Saving…" : "Save preferences"}</button>
      {settingsMessage && <p className={settingsMessage === "Preferences saved." ? "success-message" : "form-error"}>{settingsMessage}</p>}
    </div>
  );
}

function App() {
  const [slide, setSlide] = useState(0);
  const [activeNav, setActiveNav] = useState("Overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [overviewInsights, setOverviewInsights] = useState(null);
  const [farmFields, setFarmFields] = useState([]);
  const [overviewError, setOverviewError] = useState("");
  const [selectedTool, setSelectedTool] = useState("Crop recommendation");
  const [crop, setCrop] = useState("Wheat");
  const [notice, setNotice] = useState("");
  const [servicePage, setServicePage] = useState("");
  const [currentWeather, setCurrentWeather] = useState(null);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/weather`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Weather unavailable");
        if (data.configured === false) return null;
        return data;
      })
      .then((data) => {
        if (!cancelled) setCurrentWeather(data);
      })
      .catch(() => {
        if (!cancelled) setCurrentWeather(null);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiRequest("/api/insights"), apiRequest("/api/fields")])
      .then(([insightData, fieldsData]) => {
        if (cancelled) return;
        setOverviewInsights(insightData);
        setFarmFields(fieldsData);
      })
      .catch((error) => { if (!cancelled) setOverviewError(error.message); });
    return () => { cancelled = true; };
  }, []);

  const activeSlide = slides[slide];
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }, []);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Icon name="leaf" size={22} /></div>
          <span>field<span className="brand-dot">.</span>ly</span>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="main-nav">
          {["Overview", "My fields", "Recommendations", "Insights"].map((item, index) => (
            <button className={`nav-item ${activeNav === item ? "active" : ""}`} onClick={() => { setActiveNav(item); setServicePage(""); setMobileMenuOpen(false); }} key={item}>
              <Icon name={["grid", "sprout", "leaf", "chart"][index]} size={19} /><span>{item}</span>{item === "Insights" && <span className="nav-badge">3</span>}
            </button>
          ))}
        </nav>
        <div className="workspace-label tools-label">TOOLS</div>
        <nav className="main-nav">
          <button className={`nav-item ${activeNav === "Weather station" ? "active" : ""}`} onClick={() => { setActiveNav("Weather station"); setServicePage(""); setMobileMenuOpen(false); }}><Icon name="sun" size={19} /><span>Weather station</span></button>
          <button className={`nav-item ${activeNav === "Settings" ? "active" : ""}`} onClick={() => { setActiveNav("Settings"); setServicePage(""); setMobileMenuOpen(false); }}><Icon name="settings" size={19} /><span>Settings</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><Icon name="sprout" size={18} /></div>
            <strong>Need a hand?</strong>
            <p>Our farm guides are here to help.</p>
            <button onClick={() => showNotice("A farm guide will be in touch soon")}>Talk to an expert <Icon name="arrow" size={14} /></button>
          </div>
          <div className="profile">
            <div className="avatar">NS</div><div><strong>Nayan Samrutwar</strong><small>My Farm</small></div><span className="profile-more">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} onClick={() => setMobileMenuOpen((open) => !open)}><Icon name="menu" /></button>
          <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{activeNav}</strong></div>
          <div className="top-actions"><span className="sync-status"><i /> {overviewError ? "Backend unavailable" : "Live data synced"}</span><button className="icon-button" onClick={() => { setActiveNav("Settings"); setServicePage(""); }} aria-label="Preferences"><Icon name="bell" size={19} /></button><button className="new-button" onClick={() => { setActiveNav("My fields"); setServicePage(""); showNotice("Add a field to start tracking it"); }}><Icon name="plus" size={16} /> New field</button></div>
        </header>

        <div className="page-content">
          {servicePage ? <ServicePage serviceName={servicePage} onBack={() => { setServicePage(""); setActiveNav("Overview"); }} showNotice={showNotice} /> : activeNav !== "Overview" ? <WorkspacePage page={activeNav} onOpenService={(name) => { setServicePage(name); setActiveNav("Overview"); }} showNotice={showNotice} /> : <>
          <section className="welcome-row">
            <div><p className="overline">{greeting}, Nayan <span className="wave">✦</span></p><h1>Here’s your farm at a glance.</h1><p className="subheading">A little progress every day adds up to a great season.</p></div>
            <div className="weather-pill"><div className="weather-sun"><Icon name={currentWeather?.current?.rain_probability > 40 ? "droplet" : "sun"} size={24} /></div><div><strong>{currentWeather?.current ? `${currentWeather.current.temperature}°` : "—"} <span>{currentWeather?.current?.description || "Weather unavailable"}</span></strong><small>{currentWeather?.location ? `${currentWeather.location} · Today` : "Connect to weather service"}</small></div></div>
          </section>

          <section className={`hero-banner ${activeSlide.className}`} key={slide}>
            <div className="hero-copy"><span className="hero-eyebrow">{activeSlide.eyebrow}</span><h2>{activeSlide.title}</h2><p>{activeSlide.copy}</p><button className="hero-button" onClick={() => setActiveNav("Insights")}>Explore insights <Icon name="arrow" size={16} /></button></div>
            <div className="hero-visual"><div className="sun-orb" /><div className="hill hill-back" /><div className="hill hill-front" /><div className="hero-plant plant-one">✦</div><div className="hero-plant plant-two">✦</div><span className="hero-accent">{activeSlide.accent}</span></div>
            <div className="hero-dots">{slides.map((item, index) => <button aria-label={`Show slide ${index + 1}`} className={slide === index ? "selected" : ""} onClick={() => setSlide(index)} key={item.eyebrow} />)}</div>
          </section>

          <section className="services-section">
            <div className="section-heading services-heading"><div><span className="section-kicker">SMART FARM SERVICES</span><h2>Everything your farm needs to grow.</h2></div><p>AI-powered guidance for every important decision.</p></div>
            <div className="services-grid">{services.map((service) => <button className="service-card" key={service.title} onClick={() => setServicePage(service.title)}><span className={`service-icon ${service.color}`}><Icon name={service.icon} size={25} /></span><span className="service-card-copy"><strong>{service.title}</strong><small>{service.copy}</small><em>Open service <Icon name="arrow" size={14} /></em></span></button>)}</div>
          </section>

          <section className="section-heading"><div><span className="section-kicker">YOUR SNAPSHOT</span><h2>Small steps, strong roots.</h2></div><button className="text-button" onClick={() => setActiveNav("Insights")}>View all insights <Icon name="arrow" size={15} /></button></section>
          <section className="stats-grid">
            <article className="stat-card"><div className="stat-top"><span className="stat-icon green"><Icon name="sprout" size={20} /></span><span className="trend up">{overviewInsights?.field_count ?? "—"} fields</span></div><strong>{overviewInsights?.total_area_hectares ?? "—"} <small>ha</small></strong><p>Managed growing area</p><div className="mini-bars green-bars"><i /><i /><i /><i /><i /><i /><i /></div></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon blue"><Icon name="droplet" size={20} /></span><span className="trend up">Saved</span></div><strong>{farmFields.filter((field) => field.status === "Needs attention").length}<span className="percent"> fields</span></strong><p>Fields needing attention</p><div className="progress-track"><i style={{ width: farmFields.length ? `${Math.round((farmFields.filter((field) => field.status !== "Needs attention").length / farmFields.length) * 100)}%` : "0%" }} /></div><small className="goal-label">{farmFields.length ? `${farmFields.length - farmFields.filter((field) => field.status === "Needs attention").length} on track` : "Add fields to start tracking"}</small></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon gold"><Icon name="chart" size={20} /></span><span className="trend up">{overviewInsights?.prediction_count ?? "—"} total</span></div><strong>{overviewInsights?.yield_predictions?.length ? Number(overviewInsights.yield_predictions.at(-1).yield_t_per_ha).toFixed(2) : "—"} <small>t/ha</small></strong><p>Latest yield prediction</p><div className="mini-bars gold-bars"><i /><i /><i /><i /><i /><i /><i /></div></article>
          </section>

          <section className="lower-grid">
            <article className="panel activity-panel"><div className="panel-heading"><div><span className="section-kicker">FIELD ACTIVITY</span><h3>Yield predictions</h3></div><span className="period-select">Recorded analyses</span></div>{overviewInsights?.yield_predictions?.length ? <div className="yield-history">{overviewInsights.yield_predictions.slice(-7).map((item, index) => <div key={`${item.date}-${index}`}><span>{new Date(item.date).toLocaleDateString()}</span><b>{Number(item.yield_t_per_ha).toFixed(2)} t/ha</b></div>)}</div> : <div className="empty-chart"><p>{overviewError || "No yield predictions yet. Run a yield forecast to see results here."}</p><button className="text-button" onClick={() => setServicePage("Yield prediction")}>Run yield forecast <Icon name="arrow" size={14} /></button></div>}</article>
            <article className="panel tools-panel"><div className="panel-heading"><div><span className="section-kicker">QUICK ACTIONS</span><h3>Run an analysis</h3></div></div><div className="tool-list">{tools.map((tool) => <button className={`tool-row ${selectedTool === tool.label ? "chosen" : ""}`} key={tool.label} onClick={() => { setSelectedTool(tool.label); setServicePage(tool.label === "Irrigation planner" ? "Irrigation prediction" : tool.label === "Yield forecast" ? "Yield prediction" : tool.label); }}><span className={`tool-icon ${tool.color}`}><Icon name={tool.icon} size={19} /></span><span><strong>{tool.label}</strong><small>{tool.detail}</small></span><Icon name="arrow" size={16} /></button>)}</div><button className="full-action" onClick={() => setActiveNav("Recommendations")}>Review recommendations <Icon name="arrow" size={15} /></button></article>
          </section>

          <section className="recommendation-card"><div className="rec-copy"><span className="section-kicker">PERSONALIZED FOR YOUR FARM</span><h2>Ready for your next best move?</h2><p>Start a model analysis for your selected crop to get a real recommendation.</p></div><div className="rec-form"><label>I’m growing <select value={crop} onChange={(event) => setCrop(event.target.value)}><option>Wheat</option><option>Corn</option><option>Rice</option><option>Tomato</option></select></label><button onClick={() => setServicePage("Crop recommendation")}>Get recommendation <Icon name="arrow" size={16} /></button></div></section>
          <footer className="app-footer">Created by <strong>Nayan Samrutwar</strong> · <a href="https://github.com/Nayan1s62" target="_blank" rel="noreferrer">GitHub: Nayan1s62</a></footer>
          </>}
        </div>
      </main>
      {notice && <div className="toast"><span>✓</span>{notice}</div>}
    </div>
  );
}

export default App;