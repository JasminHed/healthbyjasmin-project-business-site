import emailjs from "@emailjs/browser";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import "../styles/app.css";

const supabase = createClient(
  "https://besnxjxiadkapxgmabdz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc254anhpYWRrYXB4Z21hYmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzY0OTIsImV4cCI6MjA5NDI1MjQ5Mn0.VEH6QtlFEieEYtQTuWvXPNPVwAB_Lw19wk-NGYz0oNY"
);

const EMAILJS_SERVICE_ID = "service_mjw4cpb";
const EMAILJS_TEMPLATE_JASMIN = "template_m9afbud";
const EMAILJS_PUBLIC_KEY = "y7Yu8QbgFj3NM0VeM";

// ── Data ──────────────────────────────────────────────────────────────────────

const TREATMENTS = [
  {
    id: "abhyanga",
    name: "Abhyanga",
    description: "Helkroppsmassage med varm sesamolja. Fokus djup återhämtning och vila.",
  },
  {
    id: "vishesh",
    name: "Vishesh",
    description: "Djupare helkroppsmassage med varm sesamolja. Fokus spänningar och balans.",
  },
];

// Söndagar från 3:e söndagen i augusti 2026
const BOOKING_SUNDAYS = [
  new Date(2026, 7, 16),
  new Date(2026, 7, 23),
  new Date(2026, 7, 30),
  new Date(2026, 8, 6),
  new Date(2026, 8, 13),
  new Date(2026, 8, 20),
  new Date(2026, 8, 27),
  new Date(2026, 9, 4),
  new Date(2026, 9, 11),
  new Date(2026, 9, 18),
  new Date(2026, 9, 25),
];

const MASSAGE_SLOTS = [
  { t: "09:00", e: "09:55" },
  { t: "10:10", e: "11:05" },
];

const MONTHS = [
  "jan", "feb", "mar", "apr", "maj", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];
const DAYS = ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"];

// ── Summer Banner ─────────────────────────────────────────────────────────────

function SummerBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="summer-banner">
      <span>
        Nya tider ute för yoga och ayurveda, boka din tid nedan!
      </span>
      <button
        className="summer-banner-close"
        onClick={() => setVisible(false)}
        aria-label="Stäng"
      >
        x
      </button>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);
  return (
    <nav className="navbar">
      <a href="#top" className="nav-logo-link" onClick={close}>
        <img
          src="/assets/lightlogo.png"
          alt="Health by Jasmin logotyp"
          className="logo"
        />
      </a>
      <button
        className={`hamburger${menuOpen ? " toggle" : ""}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Öppna meny"
      >
        <span />
        <span />
        <span />
      </button>
      <ul className={`nav-links${menuOpen ? " nav-active" : ""}`}>
        <li><a href="#om-mig" onClick={close}>Om mig</a></li>
        <li><a href="#yoga" onClick={close}>Yoga</a></li>
        <li><a href="#ayurveda" onClick={close}>Ayurveda</a></li>
        <li><a href="#boka" onClick={close}>Boka</a></li>
      </ul>
    </nav>
  );
}

// ── Booking ───────────────────────────────────────────────────────────────────

function Booking() {
  const [dateIdx, setDateIdx] = useState(null);
  const [slot, setSlot] = useState(null);
  const [treatment, setTreatment] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [step, setStep] = useState("select"); // select | form | done
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
    form.phone.trim().length >= 8 &&
    treatment !== null;

  function handleDate(i) {
    setDateIdx(i);
    setSlot(null);
    if (step === "form") setStep("select");
  }

  function handleField(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function submit() {
    setSending(true);
    setSendError(false);
    const key = `massage-${dateIdx}-${slot.t}`;
    const d = BOOKING_SUNDAYS[dateIdx];
    const dateStr = `${d.getDate()} ${MONTHS[d.getMonth()]} 2026`;
    const timeStr = `${slot.t}–${slot.e}`;
    const fullName = `${form.firstName} ${form.lastName}`;
    const treatmentName = TREATMENTS.find((t) => t.id === treatment).name;

    try {
      const { data: ins, error } = await supabase
        .from("bookings")
        .insert({
          slot_key: key,
          customer_email: form.email,
          customer_name: fullName,
          treatment: treatmentName,
          date: dateStr,
          time: timeStr,
        })
        .select()
        .single();
      if (error) throw error;

      const params = {
        treatment: `${treatmentName} (55 min)`,
        date: dateStr,
        time: timeStr,
        customer_name: fullName,
        customer_email: form.email,
        customer_phone: form.phone,
        booking_id: ins.booking_id,
      };

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_JASMIN, params, EMAILJS_PUBLIC_KEY);
      setBookedSlots((prev) => [...prev, key]);
      setStep("done");
    } catch (err) {
      console.error(err);
      setSendError(true);
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setDateIdx(null);
    setSlot(null);
    setTreatment(null);
    setForm({ firstName: "", lastName: "", email: "", phone: "" });
    setStep("select");
  }

  const selectedDate = dateIdx !== null ? BOOKING_SUNDAYS[dateIdx] : null;

  return (
    <div className="booking-wrap">

      {/* Platsinformation */}
      <div className="booking-place">
        <div className="booking-place-col">
          <span className="booking-place-label">Plats</span>
          <span className="booking-place-value">Home in Yoga, Birkagatan 23, Stockholm</span>
        </div>
        <div className="booking-place-col">
          <span className="booking-place-label">Dag</span>
          <span className="booking-place-value">Söndagar</span>
        </div>
      </div>

      {step !== "done" && (
        <>
          {/* Behandlingsval */}
          <div className="booking-treatments">
            <p className="booking-row-label">Välj behandling</p>
            <div className="treatment-pick-grid">
              {TREATMENTS.map((tr) => (
                <button
                  key={tr.id}
                  className={`treatment-pick-card${treatment === tr.id ? " selected" : ""}`}
                  onClick={() => setTreatment(tr.id)}
                >
                  <span className="treatment-pick-name">{tr.name}</span>
                  <span className="treatment-pick-desc">{tr.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Datumväljare */}
          <div className="booking-dates">
            <p className="booking-row-label">Välj datum</p>
            <div className="dates-scroll">
              {BOOKING_SUNDAYS.map((d, i) => {
                const isPast = d < today;
                return (
                  <button
                    key={i}
                    className={`date-btn${isPast ? " disabled" : ""}${dateIdx === i ? " selected" : ""}`}
                    disabled={isPast}
                    onClick={() => handleDate(i)}
                  >
                    <span className="date-wd">{DAYS[d.getDay()]}</span>
                    <span className="date-dd">{d.getDate()}</span>
                    <span className="date-mo">{MONTHS[d.getMonth()]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tillgängliga tider + yoga */}
          {step === "select" && (
            <div className="booking-services">

              {/* Massage tider – visas när datum är valt */}
              {dateIdx !== null && (
                <div className="service-row">
                  <div className="times-grid">
                    {MASSAGE_SLOTS.map((s, i) => {
                      const key = `massage-${dateIdx}-${s.t}`;
                      const booked = bookedSlots.includes(key);
                      return (
                        <div
                          key={i}
                          className={`time-slot${slot === s ? " selected" : ""}${booked ? " booked" : ""}`}
                          onClick={() => !booked && setSlot(s)}
                        >
                          <div className="time-slot-t">{s.t} – {s.e}</div>
                          <div className="time-slot-s">{booked ? "Fullbokad" : "55 min"}</div>
                        </div>
                      );
                    })}
                  </div>
                  {slot && treatment && (
                    <button
                      className="booking-btn-next"
                      style={{ marginTop: "1rem" }}
                      onClick={() => setStep("form")}
                    >
                      Gå vidare
                    </button>
                  )}
                  {slot && !treatment && (
                    <p style={{ fontSize: "13px", color: "#888", margin: "0.75rem 0 0", maxWidth: "100%" }}>
                      Välj en behandling ovan för att gå vidare.
                    </p>
                  )}
                </div>
              )}

              {/* Yoga – alltid synlig */}
              <div className="service-row">
                <div className="yoga-single-row">
                  <span className="yoga-single-info">Yin Yoga &middot; 60 min &middot; 12:15–13:15</span>
                  <a
                    href="https://www.homeinyoga.com/schedule"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="yoga-row-btn"
                  >
                    Boka
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Bokningsformulär */}
          {step === "form" && selectedDate && slot && (
            <div className="booking-form-wrap">
              <div className="booking-form-summary">
                <div>
                  <span className="booking-form-summary-label">
                    {TREATMENTS.find((t) => t.id === treatment)?.name} &middot; 55 min
                  </span>
                  <span className="booking-form-summary-value">
                    {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]} &middot; {slot.t}–{slot.e}
                  </span>
                </div>
                <button className="booking-change-btn" onClick={() => setStep("select")}>
                  Ändra
                </button>
              </div>

              <div className="massage-form">
                <label>
                  Förnamn
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleField}
                    placeholder="Ditt förnamn"
                  />
                </label>
                <label>
                  Efternamn
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleField}
                    placeholder="Ditt efternamn"
                  />
                </label>
                <label>
                  E-post
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleField}
                    placeholder="din@email.se"
                  />
                </label>
                <label>
                  Telefon
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleField}
                    placeholder="07X XXX XX XX"
                  />
                </label>
                <div className="payment-section-label">Betalning</div>
                <div className="payment-opt">
                  <input type="radio" name="pay" defaultChecked readOnly />
                  <div>
                    <div className="payment-opt-title">Faktura via Frilans Finans</div>
                    <div className="payment-opt-sub">
                      Du faktureras efter behandlingen
                    </div>
                  </div>
                </div>
              </div>

              <div className="booking-btn-row" style={{ marginTop: "1.25rem" }}>
                <button className="booking-btn-back" onClick={() => setStep("select")}>
                  Tillbaka
                </button>
                <button
                  className="booking-btn-next"
                  disabled={!formValid || sending}
                  onClick={submit}
                >
                  {sending ? "Skickar..." : "Bekräfta bokning"}
                </button>
              </div>
              {sendError && (
                <p className="send-error">
                  Något gick fel. Kontakta healthbyjasmin@gmail.com
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Bekräftelse */}
      {step === "done" && selectedDate && slot && (
        <div className="booking-confirm">
          <p className="booking-confirm-title">Bokning bekräftad</p>
          <p className="booking-confirm-sub">
            Tack {form.firstName}! Din bokning är registrerad.
          </p>

          <div className="booking-confirm-rows">
            {[
              ["Behandling", `${TREATMENTS.find((t) => t.id === treatment)?.name} · 55 min`],
              ["Datum", `${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]} 2026`],
              ["Tid", `${slot.t}–${slot.e}`],
              ["Plats", "Home in Yoga, Birkagatan 23, Stockholm"],
              ["Betalning", "Faktura via Frilans Finans"],
            ].map(([k, v]) => (
              <div key={k} className="summary-row">
                <span className="summary-key">{k}</span>
                <span className="summary-val">{v}</span>
              </div>
            ))}
          </div>

          <div className="booking-confirm-info">
            <p>Kom gärna 10 min innan behandlingen.</p>
            <p>Ta med eller kom i oömma kläder och underkläder.</p>
            <p>Dusch finns med handduk, schampo och duschcreme.</p>
            <p>
              Avbokning senast 24 timmar innan via{" "}
              <a href="mailto:healthbyjasmin@gmail.com">healthbyjasmin@gmail.com</a>
            </p>
          </div>

          <button className="booking-btn-next" onClick={reset}>
            Gör en ny bokning
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HealthByJasmin() {
  return (
    <>
      <SummerBanner />

      <header className="site-header">
        <Navbar />
      </header>

      <main>
        {/* Hero */}
        <section id="top" className="page-hero">
          <div className="page-hero-inner">
            <span className="hero-eyebrow">Yoga &amp; Ayurveda · Stockholm · 2015</span>
            <h1 className="hero-title">Health by Jasmin</h1>
            <p className="hero-sub">
              Välkommen till en plats där kropp och sinne får mötas. Genom yoga
              och ayurveda erbjuder jag verktyg för att stärka, återhämta och
              hitta balans i vardagen.
            </p>
            <a href="#om-mig" className="hero-scroll-arrow" aria-label="Scrolla ned">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </a>
          </div>
        </section>

        {/* Servicekort */}
        <section className="service-cards-section">
          <div className="service-cards-inner">
            <a href="#ayurveda" className="service-card">
              <span className="service-card-label">Behandling</span>
              <h3>Ayurvedisk massage</h3>
              <p>55 min &middot; Söndagar</p>
            </a>
            <a href="#yoga" className="service-card">
              <span className="service-card-label">Klass</span>
              <h3>Yin Yoga</h3>
              <p>60 min &middot; Söndagar</p>
            </a>
            <a href="#boka" className="service-card">
              <span className="service-card-label">Kommande</span>
              <h3>Retreats &amp; Kurser</h3>
              <p>Workshops, retreats och fördjupning</p>
            </a>
          </div>
        </section>

        {/* Om mig */}
        <section id="om-mig" className="content-section about-bg">
          <div className="section-inner">
            <div className="about-split">
              <div className="about-split-head">
                <span className="section-label">Om mig</span>
                <h2>
                  Jasmin<br />Hedlund
                </h2>
              </div>
              <div className="about-split-body">
                <p>
                  Jag är Jasmin, personen bakom Health by Jasmin, ett
                  enmannaföretag baserat i Stockholm, Sverige. Jag har praktiserat
                  främst Ashtanga yoga men även yoga i allmänhet och Ayurveda i
                  nästan 17 år. Det som först drog mig till både yoga och ayurveda
                  var strukturen, rytmen och sättet som båda praktikerna sätter
                  saker i fokus, ibland mjukt, ibland med kraft.
                </p>
                <p>
                  Jag förälskade mig i deras holistiska förhållningssätt och hur
                  de utmanar dig att se på dig själv och dina vanor från en helt
                  annan vinkel. År 2015/2016 startade jag Health by Jasmin för att
                  skapa ett utrymme där jag kunde dela det som verkligen har
                  resonerat med mig under åren.
                </p>
                <p>
                  Det här gör jag i små doser genom yogaklasser, korta kurser,
                  enstaka retreats och naturligtvis de magiska ayurvediska
                  massagerna. Jag erbjuder också föreläsningar och introduktioner
                  till Ayurveda, för att hjälpa människor få en bättre förståelse
                  för dess grund.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div
          className="img-divider"
          style={{ backgroundImage: "url(/assets/last.jpeg)" }}
          role="presentation"
        />

        {/* Yoga */}
        <section id="yoga" className="content-section yoga-text-section">
          <div className="section-inner">
            <div className="yoga-split-top">
              <span className="section-label">Rörelse</span>
              <h2>Yoga</h2>
              <p className="yoga-intro">
                Yoga är mer än rörelse, det är en praktik av närvaro och
                koppling mellan kropp och sinne.
              </p>
            </div>
            <div className="yoga-split-grid">
              <div className="yoga-split-col">
                <h3>Ashtanga Yoga</h3>
                <p>
                  Ashtanga är en praktik där andningen är kärnan, synkroniserad
                  med mjuka, dynamiska rörelser. Metoden kommer från Indien och
                  betraktar hela människan, kropp, sinne och allt däremellan.
                  Vi börjar där vi är och arbetar med det vi har.
                </p>
                <p>
                  Det finns två huvudstilar: Mysore, en självpraktik där du i
                  din egen takt lär dig en sekvens av positioner med stöd från
                  en lärare, och den mer välkända guidade klassen där alla rör
                  sig tillsammans med instruktioner.
                </p>
              </div>
              <div className="yoga-split-col">
                <h3>Yin Yoga</h3>
                <p>
                  Yin yoga är en långsam, meditativ praktik med fokus på
                  stillhet och djup avslappning. Positioner hålls i flera
                  minuter för att nå bindväven, ligamenten och lederna snarare
                  än musklerna. Det ger ökad rörlighet, bättre ledfunktion och
                  en lugnande effekt på nervsystemet. Yin bjuder in till att
                  vända blicken inåt.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ayurveda */}
        <section id="ayurveda" className="content-section">
          <div className="section-inner editorial-grid">
            <div className="editorial-media">
              <img
                src="/assets/ayurveda.jpg"
                alt="Ayurvediska örter och oljor"
                className="editorial-img"
              />
            </div>
            <div className="editorial-text">
              <span className="section-label">Hälsa &amp; välmående</span>
              <h2>Ayurveda</h2>
              <p>
                Ayurveda ger oss kunskap och verktyg för att stärka och läka oss
                själva, både fysiskt och mentalt. Det är ett holistiskt
                förhållningssätt till hälsa med rötter i Indien och över 6000 år
                av tradition.
              </p>
              <p>
                Ayurveda ser hela människan, kropp, sinne och allt däremellan.
                Ingenting står ensamt. Har du huvudvärk beror det sällan bara på
                huvudet, det finns troligtvis något annat i kroppen eller livet
                som hänger samman.
              </p>
              <h3>Ayurvedisk massage</h3>
              <p>
                En av de finaste delarna av Ayurveda är behandlingarna,
                framförallt massagerna. De är ofta värmande och djupt lugnande,
                med varm sesamolja. Sesamolja är antiseptisk och
                antiinflammatorisk, värmande och mjukar naturligt upp
                muskelspänningar. Den är gynnsam för alla doshor: vata, pitta
                och kapha.
              </p>
              <p>
                Ayurvediska massager utförs med varm sesamolja och vid
                specifika behandlingar används varmvattenpåsar. Vi masserar
                huvud, ansikte, fram- och baksida av kroppen inklusive fötter.
                Sesamoljan är antiseptisk och antiinflammatorisk, värmande och
                mjukar naturligt upp muskelspänningar. Den är gynnsam för alla
                doshor: vata, pitta och kapha.
              </p>
            </div>
          </div>
        </section>

        {/* Boka */}
        <section id="boka" className="booking-bg">
          <div className="booking-section">
            <h2>Boka</h2>
            <Booking />
          </div>
        </section>

        {/* Retreats */}
        <section className="retreat-section">
          <article className="retreat">
            <img
              src="/assets/retreat.jpg"
              alt="Fridfull yogaretreat i naturen"
            />
            <h2>Retreats, kurser &amp; workshops</h2>
            <span>Kommer snart</span>
          </article>
        </section>

        {/* Quote */}
        <section className="quote-section">
          <p>
            "Rörelse är medicin för kroppen, stillhet är medicin för sinnet."
          </p>
        </section>

        {/* Recensioner */}
        <section className="testimonials-section">
          <div className="section-inner">
            <span className="section-label">Recensioner</span>
            <h2>Vad andra säger</h2>
            <div className="testimonials-grid">
              <div className="testimonial-card">
                <p className="testimonial-text">
                  "Den ayurvediska massagen var precis vad jag behövde. Djup
                  avslappning och en verkligt professionell behandling. Jag
                  lämnade med en känsla av fullständig återhämtning."
                </p>
                <span className="testimonial-author">Sofia L.</span>
              </div>
              <div className="testimonial-card">
                <p className="testimonial-text">
                  "Yin yogaklassen med Jasmin är en av veckorutinens höjdpunkter.
                  Lugn, inkluderande och meningsfull. Jag märker skillnaden i
                  kroppen direkt efteråt."
                </p>
                <span className="testimonial-author">Anna M.</span>
              </div>
              <div className="testimonial-card">
                <p className="testimonial-text">
                  "Jasmin har ett unikt sätt att förmedla både yoga och ayurveda.
                  Känslan av helhet och närvaro stannar kvar länge efter
                  behandlingen."
                </p>
                <span className="testimonial-author">Marcus K.</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="content-section faq-section">
          <div className="section-inner">
            <span className="section-label">Vanliga frågor</span>
            <h2>FAQ</h2>
            <div className="faq-grid">
              {[
                {
                  q: "Var befinner ni er?",
                  a: "Vi håller till i Vasastan, Stockholm. Exakt adress är Birkagatan 23.",
                },
                {
                  q: "Blir man oljig av massagen?",
                  a: "Ja, oljan är en viktig del av behandlingen. Det finns dusch på plats med handduk, schampo och duschcreme.",
                },
                {
                  q: "Kan man delta i yoga direkt efter en massagebehandling?",
                  a: "Absolut, du är välkommen på både ayurveda och yoga samma dag. Tänk på att dusch krävs efter massagebehandlingen innan du deltar i yogaklassen.",
                },
                {
                  q: "Vad ska jag ha med mig till massagen?",
                  a: "Ta med eller kom i oömma kläder och ombyte. Underkläder behövs under behandlingen.",
                },
                {
                  q: "Vilken massage ska jag välja?",
                  a: "Välj den behandling du känner att du har behov av. Abhyanga fokuserar på djup återhämtning och vila, medan Vishesh riktar sig mer mot spänningar och balans.",
                },
                {
                  q: "Hur bokar jag yoga?",
                  a: "Yin Yoga bokas via Home in Yoga. Du hittar bokningslänken direkt i bokningssektionen nedan.",
                },
                {
                  q: "Hur betalas behandlingen?",
                  a: "Betalning sker via Frilans Finans och du faktureras efter genomförd behandling.",
                },
                {
                  q: "Kommer det fler kurser och workshops?",
                  a: "Kurser inom ayurveda är på väg. Håll utkik i bannern längst upp på sidan för uppdateringar.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="faq-item">
                  <h3>{q}</h3>
                  <p>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <section className="second-image" aria-hidden="true" />

      <footer>
        <div>
          <a
            href="https://www.instagram.com/healthbyjasmin/"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram" />
          </a>
        </div>
        <p>Vasastan, Stockholm</p>
        <p>
          <a href="mailto:healthbyjasmin@gmail.com">healthbyjasmin@gmail.com</a>
        </p>
      </footer>
    </>
  );
}
