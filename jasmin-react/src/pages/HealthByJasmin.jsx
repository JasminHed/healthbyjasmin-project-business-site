import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "../styles/app.css";

const supabase = createClient(
  "https://besnxjxiadkapxgmabdz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc254anhpYWRrYXB4Z21hYmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzY0OTIsImV4cCI6MjA5NDI1MjQ5Mn0.VEH6QtlFEieEYtQTuWvXPNPVwAB_Lw19wk-NGYz0oNY"
);

// ── Data ──────────────────────────────────────────────────────────────────────

const TREATMENTS = [
  {
    id: "abhyanga",
    name: "Abhyanga",
    duration: "55 min",
    price: "750 kr",
    description:
      "Behaglig helkroppsmassage med varm sesamolja inkl. huvud, ansikte och fötter. Fokus djup återhämtning och vila. Avslutas med varmvattenpåse över rygg.",
  },
  {
    id: "vishesh",
    name: "Vishesh",
    duration: "55 min",
    price: "750 kr",
    description:
      "Djupare helkroppsmassage med varm sesamolja, inkl. huvud, ansikte och fötter. Fokus spänningar och vila.",
  },
];

const MASSAGE_DATES = [
  {
    date: new Date(2026, 4, 26),
    slots: [
      { t: "18:00", e: "18:55" },
      { t: "19:10", e: "20:05" },
    ],
  },
  {
    date: new Date(2026, 5, 9),
    slots: [
      { t: "18:00", e: "18:55" },
      { t: "19:10", e: "20:05" },
    ],
  },
  {
    date: new Date(2026, 5, 16),
    slots: [
      { t: "18:00", e: "18:55" },
      { t: "19:10", e: "20:05" },
    ],
  },
];

const YOGA_CLASSES = [
  {
    date: new Date(2026, 5, 20),
    t: "09:30",
    e: "10:30",
    studio: "Home in Yoga",
  },
  {
    date: new Date(2026, 5, 27),
    t: "09:30",
    e: "10:30",
    studio: "Home in Yoga",
  },
  {
    date: new Date(2026, 6, 4),
    t: "09:30",
    e: "10:30",
    studio: "Home in Yoga",
  },
  {
    date: new Date(2026, 6, 11),
    t: "09:30",
    e: "10:30",
    studio: "Home in Yoga",
  },
];

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "maj",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "dec",
];
const DAYS = ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"];

// ── Massage Booking ───────────────────────────────────────────────────────────

function MassageBooking() {
  const [step, setStep] = useState(1);
  const [treatment, setTreatment] = useState(null);
  const [dateIdx, setDateIdx] = useState(null);
  const [slot, setSlot] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    supabase
      .from("bookings")
      .select("slot_key")
      .then(({ data }) => {
        if (data) setBookedSlots(data.map((r) => r.slot_key));
      });
  }, []);

  const formValid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.includes("@") &&
    form.phone.trim().length >= 8;

  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function submitBooking() {
    setSending(true);
    setSendError(false);
    const bookingKey = `massage-${dateIdx}-${slot.t}`;
    try {
      const { error } = await supabase
        .from("bookings")
        .insert({ slot_key: bookingKey });
      if (error) throw error;
      setBookedSlots((prev) => [...prev, bookingKey]);
      setStep(4);
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
  }

  function newBooking() {
    setTreatment(null);
    setDateIdx(null);
    setSlot(null);
    setForm({ firstName: "", lastName: "", email: "", phone: "" });
    setStep(1);
  }

  const steps = ["Behandling", "Tid", "Uppgifter", "Klart"];

  return (
    <div className="booking-panel">
      <h3 className="booking-panel-title">Ayurvedisk massage</h3>

      {/* Steps */}
      <div className="booking-steps">
        {steps.map((label, i) => {
          const num = i + 1;
          return (
            <div key={num} className="booking-step-wrapper">
              <div
                className={`booking-step-item${step === num ? " active" : ""}${
                  step > num ? " done" : ""
                }`}
              >
                <div className="booking-step-dot">{step > num ? "✓" : num}</div>
                <span className="booking-step-label">{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`booking-step-line${step > num ? " done" : ""}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="booking-card-wrapper">
          <div className="booking-card">
            <div className="treatment-grid">
              {TREATMENTS.map((tr) => (
                <div
                  key={tr.id}
                  className={`treatment-card${
                    treatment?.id === tr.id ? " selected" : ""
                  }`}
                  onClick={() => setTreatment(tr)}
                >
                  <h3>{tr.name}</h3>
                  <div className="treatment-meta">{tr.duration}</div>
                  <div className="treatment-price">{tr.price}</div>
                  <p className="treatment-desc">{tr.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="booking-btn-row">
            <button
              className="booking-btn-next"
              disabled={!treatment}
              onClick={() => setStep(2)}
            >
              Välj tid →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="booking-card-wrapper">
          <div className="booking-card">
            <div className="cal-header">
              <span className="cal-title">Välj datum</span>
              <span className="cal-subtitle">Varannan tisdag</span>
            </div>
            <div className="dates-scroll">
              {MASSAGE_DATES.map((s, i) => {
                const d = s.date;
                const isPast = d < today;
                return (
                  <button
                    key={i}
                    className={`date-btn${isPast ? " disabled" : ""}${
                      dateIdx === i ? " selected" : ""
                    }`}
                    onClick={() => {
                      if (!isPast) {
                        setDateIdx(i);
                        setSlot(null);
                      }
                    }}
                    disabled={isPast}
                  >
                    <span className="date-wd">{DAYS[d.getDay()]}</span>
                    <span className="date-dd">{d.getDate()}</span>
                    <span className="date-mo">{MONTHS[d.getMonth()]}</span>
                  </button>
                );
              })}
            </div>
            <div className="times-section">
              {dateIdx === null ? (
                <p className="times-hint">
                  Välj ett datum för att se lediga tider
                </p>
              ) : (
                <>
                  <p className="times-hint">Välj tid</p>
                  <div className="times-grid">
                    {MASSAGE_DATES[dateIdx].slots.map((s, i) => {
                      const key = `massage-${dateIdx}-${s.t}`;
                      const isBooked = bookedSlots.includes(key);
                      return (
                        <div
                          key={i}
                          className={`time-slot${
                            slot === s ? " selected" : ""
                          }${isBooked ? " booked" : ""}`}
                          onClick={() => !isBooked && setSlot(s)}
                        >
                          <div className="time-slot-t">
                            {s.t} – {s.e}
                          </div>
                          <div className="time-slot-s">
                            {isBooked ? "Fullbokad" : "55 min"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="booking-btn-row">
            <button className="booking-btn-back" onClick={() => setStep(1)}>
              ← Tillbaka
            </button>
            <button
              className="booking-btn-next"
              disabled={!slot}
              onClick={() => setStep(3)}
            >
              Gå vidare →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="booking-card-wrapper">
          <div className="booking-card">
            <div className="chosen-summary">
              <span className="chosen-label">Bokad tid</span>
              <span className="chosen-value">
                {treatment.name} &bull; {MASSAGE_DATES[dateIdx].date.getDate()}{" "}
                {MONTHS[MASSAGE_DATES[dateIdx].date.getMonth()]} &bull; {slot.t}
                –{slot.e}
              </span>
            </div>
            <div className="massage-form">
              <label>
                Förnamn
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleFormChange}
                  placeholder="Ditt förnamn"
                />
              </label>
              <label>
                Efternamn
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleFormChange}
                  placeholder="Ditt efternamn"
                />
              </label>
              <label>
                E-postadress
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="din@email.se"
                />
              </label>
              <label>
                Mobilnummer
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  placeholder="07X XXX XX XX"
                />
              </label>
              <div className="payment-section-label">Betalningssätt</div>
              <div className="payment-opt">
                <input type="radio" name="pay" defaultChecked readOnly />
                <div>
                  <div className="payment-opt-title">
                    Faktura – Frilans Finans
                  </div>
                  <div className="payment-opt-sub">
                    Du faktureras via Frilans Finans efter behandlingen
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="booking-btn-row">
            <button className="booking-btn-back" onClick={() => setStep(2)}>
              ← Tillbaka
            </button>
            <button
              className="booking-btn-next"
              disabled={!formValid || sending}
              onClick={submitBooking}
            >
              {sending ? "Skickar..." : "Bekräfta bokning ✓"}
            </button>
          </div>
          {sendError && (
            <p className="send-error">
              Något gick fel. Försök igen eller kontakta
              healthbyjasmin@gmail.com
            </p>
          )}
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="booking-card-wrapper">
          <div className="confirm-box">
            <div className="confirm-icon">✓</div>
            <h3>Bokning bekräftad!</h3>
            <p>
              Tack {form.firstName}! Vi ses den{" "}
              {MASSAGE_DATES[dateIdx].date.getDate()}{" "}
              {MONTHS[MASSAGE_DATES[dateIdx].date.getMonth()]} kl {slot.t}.
            </p>
          </div>
          <div className="booking-card" style={{ marginTop: "0.5rem" }}>
            <div className="summary-row">
              <span className="summary-key">Behandling</span>
              <span className="summary-val">{treatment.name} (55 min)</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Datum</span>
              <span className="summary-val">
                {MASSAGE_DATES[dateIdx].date.getDate()}{" "}
                {MONTHS[MASSAGE_DATES[dateIdx].date.getMonth()]} 2026
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Tid</span>
              <span className="summary-val">
                {slot.t}–{slot.e}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Namn</span>
              <span className="summary-val">
                {form.firstName} {form.lastName}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-key">E-post</span>
              <span className="summary-val">{form.email}</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Mobil</span>
              <span className="summary-val">{form.phone}</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Betalning</span>
              <span className="summary-val">Faktura – Frilans Finans</span>
            </div>
            <div className="summary-row summary-row-total">
              <span className="summary-key">Totalt</span>
              <span className="summary-val">750 kr</span>
            </div>
          </div>
          <div className="booking-card" style={{ marginTop: "0.5rem" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#3F5B6B",
                marginBottom: "12px",
              }}
            >
              Praktisk information
            </div>
            <div className="summary-row">
              <span className="summary-key">Adress</span>
              <span className="summary-val">
                <a
                  href="https://www.google.com/maps/place//data=!4m2!3m1!1s0x465f770ac3f4572b:0xbd82f93b91013157"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#3F5B6B", textDecoration: "underline" }}
                >
                  Åsögatan 166, 116 32 Stockholm
                </a>
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Ankomst</span>
              <span className="summary-val">
                Kom gärna 10 min innan behandlingen
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Kläder</span>
              <span className="summary-val">
                Kom i eller ha med oömma kläder och underkläder
              </span>
            </div>
            <div className="summary-row" style={{ borderBottom: "none" }}>
              <span className="summary-key">Dusch</span>
              <span className="summary-val">
                Dusch finns med handduk, schampo och duschcreme
              </span>
            </div>
          </div>
          <div className="booking-btn-row">
            <button className="booking-btn-next" onClick={newBooking}>
              Gör en ny bokning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Yoga Booking ──────────────────────────────────────────────────────────────

function YogaBooking() {
  const [selectedClass, setSelectedClass] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="booking-panel">
      <h3 className="booking-panel-title">Yogaklass</h3>

      <div className="booking-card" style={{ marginBottom: "1rem" }}>
        <div className="cal-header">
          <span className="cal-title">Välj klass</span>
          <span className="cal-subtitle">Lördagar · Slow Flow · 60 min</span>
        </div>

        <div className="yoga-classes-list">
          {YOGA_CLASSES.map((cls, i) => {
            const isPast = cls.date < today;
            return (
              <div
                key={i}
                className={`yoga-class-row${
                  selectedClass === i ? " selected" : ""
                }${isPast ? " disabled" : ""}`}
                onClick={() => !isPast && setSelectedClass(i)}
              >
                <div className="yoga-class-left">
                  <div className="yoga-class-date">
                    {DAYS[cls.date.getDay()]} {cls.date.getDate()}{" "}
                    {MONTHS[cls.date.getMonth()]}
                  </div>
                  <div className="yoga-class-time">
                    {cls.t} – {cls.e}
                  </div>
                </div>
                <div className="yoga-class-right">
                  <div className="yoga-class-studio">{cls.studio}</div>
                  <div className="yoga-class-teacher">med Jasmin</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedClass !== null && (
        <div
          className="booking-card"
          style={{
            marginBottom: "1rem",
            background:
              "linear-gradient(145deg, rgba(92,124,138,0.08) 0%, rgba(123,168,184,0.08) 100%)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#555",
              textAlign: "left",
              maxWidth: "100%",
            }}
          >
            Bokning sker direkt via{" "}
            <strong>{YOGA_CLASSES[selectedClass].studio}</strong>. Klicka på
            knappen nedan för att boka din plats.
          </p>
        </div>
      )}

      <div className="booking-btn-row">
        <a
          href="https://www.homeinyoga.com/schedule"
          target="_blank"
          rel="noopener noreferrer"
          className={`booking-btn-next booking-link-btn${
            selectedClass === null ? " disabled-link" : ""
          }`}
          onClick={(e) => selectedClass === null && e.preventDefault()}
        >
          {selectedClass === null
            ? "Välj en klass först"
            : `Boka på ${YOGA_CLASSES[selectedClass].studio} →`}
        </a>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HealthByJasmin() {
  return (
    <>
      <header>
        <nav className="navbar">
          <a href="/">
            <img
              src="/assets/lightlogo.png"
              alt="HealthbyJasminlogo"
              className="logo"
            />
          </a>
          <div className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <ul className="nav-links">
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="mailto:healthbyjasmin@gmail.com">Contact</a>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <h1>Yoga and Ayurveda</h1>

        <section className="grid-content">
          <article className="grid-item ashtanga-yoga">
            <img
              src="/assets/ashtanga.jpeg"
              alt="Jasmin i en Ashtanga Yoga-pose"
            />
            <h2>Yoga</h2>
            <p>
              Explore different yoga practices to bring balance, strength, and
              awareness to body and mind.
            </p>
            <a href="/yoga">To Yoga classes &#10132;</a>
          </article>
          <article className="grid-item ayurveda">
            <img src="/assets/ayurveda.jpg" alt="Örter från Ayurveda" />
            <h2>Ayurveda</h2>
            <p>
              Ayurveda offers us the knowledge and tools to strengthen and heal
              ourselves, both physically and mentally.
            </p>
            <a href="/ayurveda">Read about Ayurveda &#10132;</a>
          </article>
        </section>

        {/* ── Booking section moved up here ── */}
        <section className="booking-section">
          <h2>Boka</h2>
          <div className="booking-panels-grid">
            <MassageBooking />
            <YogaBooking />
          </div>
        </section>

        <section className="retreat-section">
          <article className="retreat">
            <img
              src="/assets/retreat.jpg"
              alt="Peaceful yoga retreat in nature"
            />
            <h2>Retreats, Courses and Workshops</h2>
            <span>Coming Soon</span>
          </article>
        </section>

        <section className="quote-section">
          <h2>
            "Because discomfort is not the enemy. It is the pathway to your
            potential" - The Mind Friend
          </h2>
        </section>

        <h2>Journal</h2>
        <section className="grid-journal">
          <article className="journal-post">
            <img src="/assets/journal1.jpg" alt="Journal 1" />
            <h3>#1 See yourself through your Ayurvedic dosha</h3>
            <a href="https://medium.com/@healthbyjasmin/see-yourself-through-the-ayurvedic-lens-of-the-doshas-bb0ee3f25c72">
              <p>
                Looking at yourself through Ayurveda's body/mind constitutions
                can give you a better understanding of who you are.
              </p>
            </a>
          </article>
          <article className="journal-post">
            <img src="/assets/journal2.jpg" alt="Yoga Break" />
            <h3>#2 Me-time. Take a Yoga Break</h3>
            <a href="https://medium.com/@healthbyjasmin/here-are-one-simple-stretch-to-do-at-home-1aa8a2a75f8d">
              <p>Here is one simple stretch to do at home.</p>
            </a>
          </article>
          <article className="journal-post">
            <img src="/assets/clock.jpg" alt="Circadian Rhythm" />
            <h3>#3 Ayurvedic Circadian Rhythm</h3>
            <a href="https://medium.com/@healthbyjasmin/how-the-ayurvedic-clock-can-help-you-find-daily-balance-caa2fab0f74d">
              <p>
                Seeing the day from an Ayurvedic perspective can help us better
                understand what we need and when.
              </p>
            </a>
          </article>
          <article className="journal-post">
            <img src="/assets/meditation.jpg" alt="Meditation" />
            <h3>#4 Short Meditation Practice</h3>
            <a href="#">
              <p>Start by finding a comfortable but awake seated position.</p>
            </a>
          </article>
        </section>
      </main>

      <section className="second-image"></section>

      <footer>
        <div>
          <a
            href="https://www.instagram.com/healthbyjasmin"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a
            href="https://www.facebook.com/jasmin.hedlund/"
            aria-label="Facebook"
          >
            <i className="fab fa-facebook"></i>
          </a>
        </div>
        <p>copyright© 2025 HealthbyJasmin</p>
        <p>
          <a href="mailto:healthbyjasmin@gmail.com">healthbyjasmin@gmail.com</a>
        </p>
      </footer>
    </>
  );
}
