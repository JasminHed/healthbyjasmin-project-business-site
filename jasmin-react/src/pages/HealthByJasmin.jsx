import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "../styles/app.css";

const supabase = createClient(
  "https://besnxjxiadkapxgmabdz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc254anhpYWRrYXB4Z21hYmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzY0OTIsImV4cCI6MjA5NDI1MjQ5Mn0.VEH6QtlFEieEYtQTuWvXPNPVwAB_Lw19wk-NGYz0oNY"
);

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

const SESSION_DATES = [
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

function BookingSection() {
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

  // Hämta bokade tider från Supabase
  useEffect(() => {
    async function fetchBooked() {
      const { data } = await supabase.from("bookings").select("slot_key");
      if (data) setBookedSlots(data.map((r) => r.slot_key));
    }
    fetchBooked();
  }, []);

  const formValid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.includes("@") &&
    form.phone.trim().length >= 8;

  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function goTo(n) {
    setStep(n);
  }

  function selectDate(i) {
    setDateIdx(i);
    setSlot(null);
  }

  async function submitBooking() {
    setSending(true);
    setSendError(false);

    const bookingKey = `${dateIdx}-${slot.t}`;

    try {
      // Spara i Supabase
      const { error } = await supabase
        .from("bookings")
        .insert({ slot_key: bookingKey });

      if (error) throw error;

      setBookedSlots((prev) => [...prev, bookingKey]);
      setStep(4);
    } catch (err) {
      console.error("Supabase error:", err);
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

  const steps = ["Behandling", "Tid", "Dina uppgifter", "Bekräftelse"];

  return (
    <section className="booking-section">
      <h2>Boka behandling</h2>

      <div className="booking-steps">
        {steps.map((label, i) => {
          const num = i + 1;
          const isDone = step > num;
          const isActive = step === num;
          return (
            <div key={num} className="booking-step-wrapper">
              <div
                className={`booking-step-item${isActive ? " active" : ""}${
                  isDone ? " done" : ""
                }`}
              >
                <div className="booking-step-dot">{isDone ? "✓" : num}</div>
                <span className="booking-step-label">{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`booking-step-line${isDone ? " done" : ""}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Choose treatment ── */}
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
              onClick={() => goTo(2)}
            >
              Välj tid →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Choose date & time ── */}
      {step === 2 && (
        <div className="booking-card-wrapper">
          <div className="booking-card">
            <div className="cal-header">
              <span className="cal-title">Välj datum</span>
              <span className="cal-subtitle">Varannan tisdag</span>
            </div>
            <div className="dates-scroll">
              {SESSION_DATES.map((s, i) => {
                const d = s.date;
                const isPast = d < today;
                return (
                  <button
                    key={i}
                    className={`date-btn${isPast ? " disabled" : ""}${
                      dateIdx === i ? " selected" : ""
                    }`}
                    onClick={() => !isPast && selectDate(i)}
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
                    {SESSION_DATES[dateIdx].slots.map((s, i) => {
                      const key = `${dateIdx}-${s.t}`;
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
            <button className="booking-btn-back" onClick={() => goTo(1)}>
              ← Tillbaka
            </button>
            <button
              className="booking-btn-next"
              disabled={!slot}
              onClick={() => goTo(3)}
            >
              Gå vidare →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Personal details ── */}
      {step === 3 && (
        <div className="booking-card-wrapper">
          <div className="booking-card">
            {dateIdx !== null && slot && (
              <div className="chosen-summary">
                <span className="chosen-label">Bokad tid</span>
                <span className="chosen-value">
                  {treatment.name} &bull;{" "}
                  {SESSION_DATES[dateIdx].date.getDate()}{" "}
                  {MONTHS[SESSION_DATES[dateIdx].date.getMonth()]} &bull;{" "}
                  {slot.t}–{slot.e}
                </span>
              </div>
            )}

            <div className="massage-form">
              <label>
                Förnamn
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleFormChange}
                  placeholder="Ditt förnamn"
                  required
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
                  required
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
                  required
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
                  required
                />
              </label>

              <div className="payment-section-label">Betalningssätt</div>
              <div className="payment-opt selected">
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
            <button className="booking-btn-back" onClick={() => goTo(2)}>
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

      {/* ── Step 4: Confirmation ── */}
      {step === 4 && (
        <div className="booking-card-wrapper">
          <div className="confirm-box">
            <div className="confirm-icon">✓</div>
            <h3>Bokning bekräftad!</h3>
            <p>
              Tack {form.firstName}! Vi ses den{" "}
              {SESSION_DATES[dateIdx].date.getDate()}{" "}
              {MONTHS[SESSION_DATES[dateIdx].date.getMonth()]} kl {slot.t}.
            </p>
          </div>

          <div className="booking-card" style={{ marginTop: "1rem" }}>
            <div className="summary-row">
              <span className="summary-key">Behandling</span>
              <span className="summary-val">{treatment.name} (55 min)</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Datum</span>
              <span className="summary-val">
                {SESSION_DATES[dateIdx].date.getDate()}{" "}
                {MONTHS[SESSION_DATES[dateIdx].date.getMonth()]} 2026
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

          <div className="booking-btn-row">
            <button className="booking-btn-next" onClick={newBooking}>
              Gör en ny bokning
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

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

        <BookingSection />
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
