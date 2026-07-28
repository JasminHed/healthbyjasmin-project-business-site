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
const EMAILJS_TEMPLATE_CUSTOMER = "template_8rmxsm9";
const EMAILJS_PUBLIC_KEY = "y7Yu8QbgFj3NM0VeM";

// ── Booking dates & slots (language-neutral) ───────────────────────────────────

const BOOKING_SUNDAYS = [
  new Date(2026, 7, 16), new Date(2026, 7, 23), new Date(2026, 7, 30),
  new Date(2026, 8, 6),  new Date(2026, 8, 13), new Date(2026, 8, 20),
  new Date(2026, 8, 27), new Date(2026, 9, 4),  new Date(2026, 9, 11),
  new Date(2026, 9, 18), new Date(2026, 9, 25),
];

const MASSAGE_SLOTS = [
  { t: "09:00", e: "09:55" },
  { t: "10:10", e: "11:05" },
];

const BOOKING_THURSDAYS = [
  new Date(2026, 7, 13),
  new Date(2026, 7, 20),
  new Date(2026, 8, 3),
];

const EVENING_SLOTS = [
  { t: "18:00", e: "18:55" },
];

// Swedish months always used in emails to Jasmin
const SV_MONTHS = ["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];

// ── Translations ───────────────────────────────────────────────────────────────

const TRANSLATIONS = {
  sv: {
    banner: "Nya tider ute för yoga och ayurveda, boka din tid nedan!",
    bannerClose: "Stäng",
    nav: { aboutMe: "Om mig", yoga: "Yoga", ayurveda: "Ayurveda", book: "Boka" },
    hero: {
      eyebrow: "Yoga & Ayurveda · Stockholm · 2015",
      sub: "Välkommen till en plats där kropp och sinne får mötas. Genom yoga och ayurveda erbjuder jag verktyg för att stärka, återhämta och hitta balans i vardagen.",
      scrollLabel: "Scrolla ned",
    },
    cards: {
      massageLabel: "Behandling", massageTitle: "Ayurveda",
      yogaLabel: "Klass", yogaTitle: "Yoga",
      coursesLabel: "Kommande", coursesTitle: "Kurser",
    },
    about: {
      label: "Om mig",
      p1: "Jag är Jasmin, personen bakom Health by Jasmin, ett enmannaföretag baserat i Stockholm, Sverige. Jag har praktiserat främst Ashtanga yoga men även yoga i allmänhet och Ayurveda i nästan 17 år. Det som först drog mig till både yoga och ayurveda var strukturen, rytmen och sättet som båda praktikerna sätter saker i fokus, ibland mjukt, ibland med kraft.",
      p2: "Jag förälskade mig i deras holistiska förhållningssätt och hur de utmanar dig att se på dig själv och dina vanor från en helt annan vinkel. År 2015/2016 startade jag Health by Jasmin för att skapa ett utrymme där jag kunde dela det som verkligen har resonerat med mig under åren.",
      p3: "Det här gör jag i små doser genom yogaklasser, korta kurser, enstaka retreats och naturligtvis de magiska ayurvediska massagerna. Jag erbjuder också föreläsningar och introduktioner till Ayurveda, för att hjälpa människor få en bättre förståelse för dess grund.",
    },
    yoga: {
      label: "Rörelse",
      intro: "Yoga är mer än rörelse, det är en praktik av närvaro och koppling mellan kropp och sinne.",
      ashtangaTitle: "Ashtanga Yoga",
      ashtangaP1: "Ashtanga är en praktik där andningen är kärnan, synkroniserad med mjuka, dynamiska rörelser. Metoden kommer från Indien och betraktar hela människan, kropp, sinne och allt däremellan. Vi börjar där vi är och arbetar med det vi har.",
      ashtangaP2: "Det finns två huvudstilar: Mysore, en självpraktik där du i din egen takt lär dig en sekvens av positioner med stöd från en lärare, och den mer välkända guidade klassen där alla rör sig tillsammans med instruktioner.",
      ashtangaSoon: "Klasser kommer snart",
      yinTitle: "Yin Yoga",
      yinP1: "Yin yoga är en långsam, meditativ praktik med fokus på stillhet och djup avslappning. Positioner hålls i flera minuter för att nå bindväven, ligamenten och lederna snarare än musklerna. Det ger ökad rörlighet, bättre ledfunktion och en lugnande effekt på nervsystemet. Yin bjuder in till att vända blicken inåt.",
      yinSchedule: "60 min · Söndagar · 12:15–13:15",
      yinBookVia: "Bokas via Home in Yoga",
      yinPricing: "Priser",
      yogaAyurvedaTitle: "Yoga & Ayurveda",
      yogaAyurvedaSub: "60 min · Torsdagar · 20:00–21:00",
      yogaAyurvedaP1: "En klass i två delar. Vi börjar med en kort delning om ayurveda, kanske om sömn, dygnsrytm, mat, matsmältning eller doshornas natur. Något du kan ta med dig ut i vardagen.",
      yogaAyurvedaP2: "Sedan yoga. Rörelserna är alltid anpassade så att alla doshor mår bra av dem, men stilen varierar. Ibland mer dynamiskt och i flöde, ibland långsammare och mer stilla. Vi blandar kroppscanning och meditation när det passar in.",
      yogaAyurvedaP3: "Varje klass är sin egen. Det enda som är konstant är att du lämnar med mer kunskap om dig själv, och en kropp som fått röra sig.",
    },
    ayurveda: {
      label: "Hälsa & välmående",
      p1: "Ayurveda ger oss kunskap och verktyg för att stärka och läka oss själva, både fysiskt och mentalt. Det är ett holistiskt förhållningssätt till hälsa med rötter i Indien och över 6000 år av tradition.",
      p2: "Ayurveda ser hela människan, kropp, sinne och allt däremellan. Ingenting står ensamt. Har du huvudvärk beror det sällan bara på huvudet, det finns troligtvis något annat i kroppen eller livet som hänger samman.",
      massageTitle: "Ayurvedisk massage",
      massageP1: "En av de finaste delarna av Ayurveda är behandlingarna, framförallt massagerna. De är ofta värmande och djupt lugnande, med varm sesamolja. Sesamolja är antiseptisk och antiinflammatorisk, värmande och mjukar naturligt upp muskelspänningar. Den är gynnsam för alla doshor: vata, pitta och kapha.",
      massageP2: "Ayurvediska massager utförs med varm sesamolja och vid specifika behandlingar används varmvattenpåsar. Vi masserar huvud, ansikte, fram- och baksida av kroppen inklusive fötter. Sesamoljan är antiseptisk och antiinflammatorisk, värmande och mjukar naturligt upp muskelspänningar. Den är gynnsam för alla doshor: vata, pitta och kapha.",
    },
    booking: {
      title: "Boka",
      plats: "Plats", dag: "Dag", sondagar: "Söndagar", torsdagar: "Torsdagar",
      valjBehandling: "Välj behandling", valjDatum: "Välj datum",
      gaVidare: "Gå vidare", andra: "Ändra", tillbaka: "Tillbaka",
      bekrafta: "Bekräfta bokning", skickar: "Skickar...", gorNyBokning: "Gör en ny bokning",
      firstName: "Förnamn", firstNamePh: "Ditt förnamn",
      lastName: "Efternamn", lastNamePh: "Ditt efternamn",
      email: "E-post", emailPh: "din@email.se",
      phone: "Telefon", phonePh: "07X XXX XX XX",
      betalning: "Betalning", betalningTitle: "Faktura via Frilans Finans", betalningDesc: "Du faktureras efter behandlingen",
      fullbooked: "Fullbokad", duration: "55 min", pris: "750 kr", rowPris: "Pris",
      confirmTitle: "Bokning bekräftad",
      confirmSub: (name) => `Tack ${name}! Din bokning är registrerad.`,
      rowBehandling: "Behandling", rowDatum: "Datum", rowTid: "Tid",
      rowPlats: "Plats", rowBetalning: "Betalning", rowFaktura: "Faktura via Frilans Finans",
      info1: "Kom gärna 10 min innan behandlingen.",
      info2: "Ta med eller kom i oömma kläder och underkläder.",
      info3: "Dusch finns med handduk, schampo och duschcreme.",
      info4pre: "Avbokning senast 24 timmar innan via",
      errorMsg: "Något gick fel. Kontakta healthbyjasmin@gmail.com",
      yogaLabel: "Yoga", yogaBookSub: "Bokas direkt via Home in Yoga",
      yogaInfo: "Yin Yoga · 60 min · 12:15–13:15 · Söndagar", bokaNYoga: "Boka",
      behandlingHint: "Välj en behandling ovan för att gå vidare.",
      bokaBehandling: "Boka behandling",
      stangBokning: "Stäng",
    },
    treatments: [
      { id: "abhyanga", name: "Abhyanga", description: "Helkroppsmassage med varm sesamolja. Fokus djup återhämtning och vila." },
      { id: "vishesh",  name: "Vishesh",  description: "Djupare helkroppsmassage med varm sesamolja. Fokus spänningar och balans." },
    ],
    months: ["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"],
    days: ["Sön","Mån","Tis","Ons","Tor","Fre","Lör"],
    quote: '"Rörelse är medicin för kroppen, stillhet är medicin för sinnet."',
    reviews: {
      label: "Recensioner", title: "Vad andra säger",
      items: [
        { text: '"Den ayurvediska massagen var precis vad jag behövde. Djup avslappning och en verkligt professionell behandling. Jag lämnade med en känsla av fullständig återhämtning."', author: "Sofia L." },
        { text: '"Yin yogaklassen med Jasmin är en av veckorutinens höjdpunkter. Lugn, inkluderande och meningsfull. Jag märker skillnaden i kroppen direkt efteråt."', author: "Anna M." },
        { text: '"Jasmin har ett unikt sätt att förmedla både yoga och ayurveda. Känslan av helhet och närvaro stannar kvar länge efter behandlingen."', author: "Marcus K." },
      ],
      instagram: "Följ @healthbyjasmin",
    },
    faq: {
      label: "Vanliga frågor", title: "FAQ",
      items: [
        { q: "Var hålls klasser och behandlingar?", a: "Alla yogaklasser hålls i Vasastan på Birkagatan 23. Ayurvediska behandlingar hålls på två ställen: söndagar i Vasastan (Birkagatan 23) och torsdagskvällar på Södermalm (Åsögatan 166). Se bokningssektionen ovan för aktuella tider." },
        { q: "Hur bokar jag yoga?", a: "Yoga bokas via länken i yogasektionen ovan." },
        { q: "Hur bokar jag ayurvedisk behandling?", a: "Behandlingar bokas direkt via formuläret ovan. Välj plats, datum och tid direkt på sidan." },
        { q: "Vad gäller vid avbokning?", a: "Avbokning av behandling görs senast 24 timmar innan. Mejla healthbyjasmin@gmail.com. För yogaklasser gäller studiots avbokningsregler." },
        { q: "Hur betalas behandlingen?", a: "Betalning sker via Frilans Finans. Du faktureras efter genomförd behandling." },
        { q: "Blir man oljig av massagen?", a: "Ja, oljan är en viktig del av behandlingen. Det finns dusch på plats med handduk, schampo och duschcreme." },
        { q: "Vilken massage ska jag välja?", a: "Välj den behandling du känner att du behöver. Abhyanga fokuserar på djup återhämtning och vila, medan Vishesh riktar sig mer mot spänningar och balans." },
        { q: "Vad ska jag ha med mig till massagen?", a: "Ta med eller kom i oömma kläder och ombyte. Underkläder behövs under behandlingen." },
      ],
    },
    courses: { title: "Kurser", soon: "Kommer snart" },
    footer: { location: "Vasastan, Stockholm" },
  },

  en: {
    banner: "New times available for yoga and ayurveda, book your spot below!",
    bannerClose: "Close",
    nav: { aboutMe: "About me", yoga: "Yoga", ayurveda: "Ayurveda", book: "Book" },
    hero: {
      eyebrow: "Yoga & Ayurveda · Stockholm · 2015",
      sub: "Welcome to a place where body and mind can meet. Through yoga and ayurveda I offer tools to strengthen, recover and find balance in everyday life.",
      scrollLabel: "Scroll down",
    },
    cards: {
      massageLabel: "Treatment", massageTitle: "Ayurveda",
      yogaLabel: "Class", yogaTitle: "Yoga",
      coursesLabel: "Upcoming", coursesTitle: "Courses",
    },
    about: {
      label: "About me",
      p1: "I am Jasmin, the person behind Health by Jasmin, a sole proprietorship based in Stockholm, Sweden. I have practised mainly Ashtanga yoga but also yoga in general and Ayurveda for almost 17 years. What first drew me to both yoga and ayurveda was the structure, the rhythm and the way both practices bring things into focus, sometimes gently, sometimes with force.",
      p2: "I fell in love with their holistic approach and how they challenge you to look at yourself and your habits from a completely different angle. In 2015/2016 I started Health by Jasmin to create a space where I could share what has truly resonated with me over the years.",
      p3: "I do this in small doses through yoga classes, short courses, occasional retreats and of course the magical ayurvedic massages. I also offer lectures and introductions to Ayurveda, to help people gain a better understanding of its foundations.",
    },
    yoga: {
      label: "Movement",
      intro: "Yoga is more than movement. It is a practice of presence and connection between body and mind.",
      ashtangaTitle: "Ashtanga Yoga",
      ashtangaP1: "Ashtanga is a practice where the breath is the core, synchronised with soft, dynamic movements. The method originates from India and regards the whole person: body, mind and everything in between. We start where we are and work with what we have.",
      ashtangaP2: "There are two main styles: Mysore, a self-practice where you learn a sequence of postures at your own pace with support from a teacher, and the more well-known led class where everyone moves together with instructions.",
      ashtangaSoon: "Classes coming soon",
      yinTitle: "Yin Yoga",
      yinP1: "Yin yoga is a slow, meditative practice with a focus on stillness and deep relaxation. Poses are held for several minutes to reach the connective tissue, ligaments and joints rather than the muscles. It increases flexibility, improves joint function and has a calming effect on the nervous system. Yin invites you to turn your gaze inward.",
      yinSchedule: "60 min · Sundays · 12:15–13:15",
      yinBookVia: "Book via Home in Yoga",
      yinPricing: "Pricing",
      yogaAyurvedaTitle: "Yoga & Ayurveda",
      yogaAyurvedaSub: "60 min · Thursdays · 20:00–21:00",
      yogaAyurvedaP1: "A class in two parts. We begin with a short sharing on ayurveda, perhaps about sleep, the body's daily rhythm, food, digestion or the nature of the doshas. Something to carry with you into everyday life.",
      yogaAyurvedaP2: "Then yoga. The movements are always adapted so that all doshas benefit, but the style varies. Sometimes more dynamic and flowing, sometimes slower and more still. We weave in body scanning and meditation when it fits.",
      yogaAyurvedaP3: "Every class is its own. The one constant is that you leave with a little more knowledge about yourself, and a body that has had the chance to move.",
    },
    ayurveda: {
      label: "Health & wellbeing",
      p1: "Ayurveda gives us knowledge and tools to strengthen and heal ourselves, both physically and mentally. It is a holistic approach to health with roots in India and over 6,000 years of tradition.",
      p2: "Ayurveda sees the whole person: body, mind and everything in between. Nothing stands alone. If you have a headache, it is rarely just about your head; there is likely something else in the body or in life that is connected.",
      massageTitle: "Ayurvedic massage",
      massageP1: "One of the most beautiful parts of Ayurveda is the treatments, especially the massages. They are often warming and deeply soothing, using warm sesame oil. Sesame oil is antiseptic and anti-inflammatory, warming and naturally softens muscle tension. It is beneficial for all doshas: vata, pitta and kapha.",
      massageP2: "Ayurvedic massages are performed with warm sesame oil and for specific treatments warm water bags are used. We massage the head, face, front and back of the body including the feet. The sesame oil is antiseptic and anti-inflammatory, warming and naturally softens muscle tension. It is beneficial for all doshas: vata, pitta and kapha.",
    },
    booking: {
      title: "Book",
      plats: "Location", dag: "Day", sondagar: "Sundays", torsdagar: "Thursdays",
      valjBehandling: "Choose treatment", valjDatum: "Choose date",
      gaVidare: "Continue", andra: "Change", tillbaka: "Back",
      bekrafta: "Confirm booking", skickar: "Sending...", gorNyBokning: "Make a new booking",
      firstName: "First name", firstNamePh: "Your first name",
      lastName: "Last name", lastNamePh: "Your last name",
      email: "Email", emailPh: "your@email.com",
      phone: "Phone", phonePh: "07X XXX XX XX",
      betalning: "Payment", betalningTitle: "Invoice via Frilans Finans", betalningDesc: "You will be invoiced after the treatment",
      fullbooked: "Fully booked", duration: "55 min", pris: "750 kr", rowPris: "Price",
      confirmTitle: "Booking confirmed",
      confirmSub: (name) => `Thank you ${name}! Your booking is registered.`,
      rowBehandling: "Treatment", rowDatum: "Date", rowTid: "Time",
      rowPlats: "Location", rowBetalning: "Payment", rowFaktura: "Invoice via Frilans Finans",
      info1: "Please arrive 10 minutes before your treatment.",
      info2: "Bring or wear comfortable clothes and underwear.",
      info3: "Shower available with towel, shampoo and shower gel.",
      info4pre: "Cancellation no later than 24 hours before via",
      errorMsg: "Something went wrong. Contact healthbyjasmin@gmail.com",
      yogaLabel: "Yoga", yogaBookSub: "Book directly via Home in Yoga",
      yogaInfo: "Yin Yoga · 60 min · 12:15–13:15 · Sundays", bokaNYoga: "Book",
      behandlingHint: "Choose a treatment above to continue.",
      bokaBehandling: "Book treatment",
      stangBokning: "Close",
    },
    treatments: [
      { id: "abhyanga", name: "Abhyanga", description: "Full-body massage with warm sesame oil. Focus on deep recovery and rest." },
      { id: "vishesh",  name: "Vishesh",  description: "Deeper full-body massage with warm sesame oil. Focus on tension and balance." },
    ],
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    days: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    quote: '"Movement is medicine for the body, stillness is medicine for the mind."',
    reviews: {
      label: "Reviews", title: "What others say",
      items: [
        { text: '"The ayurvedic massage was exactly what I needed. Deep relaxation and a truly professional treatment. I left with a feeling of complete recovery."', author: "Sofia L." },
        { text: '"The yin yoga class with Jasmin is one of the highlights of my weekly routine. Calm, inclusive and meaningful. I notice the difference in my body right after."', author: "Anna M." },
        { text: '"Jasmin has a unique way of conveying both yoga and ayurveda. The feeling of wholeness and presence stays with you long after the treatment."', author: "Marcus K." },
      ],
      instagram: "Follow @healthbyjasmin",
    },
    faq: {
      label: "Frequently asked questions", title: "FAQ",
      items: [
        { q: "Where are classes and treatments held?", a: "All yoga classes are held in Vasastan at Birkagatan 23. Ayurvedic treatments are held at two locations: Sundays in Vasastan (Birkagatan 23) and Thursday evenings in Södermalm (Åsögatan 166). See the booking section above for current times." },
        { q: "How do I book yoga?", a: "Yoga is booked via the link in the yoga section above." },
        { q: "How do I book an ayurvedic treatment?", a: "Treatments are booked via the form above. Choose your location, date and time directly on the page." },
        { q: "What is the cancellation policy?", a: "Treatments must be cancelled no later than 24 hours in advance. Email healthbyjasmin@gmail.com. For yoga classes, the studio's cancellation policy applies." },
        { q: "How is payment handled?", a: "Payment is made via Frilans Finans. You will be invoiced after the completed treatment." },
        { q: "Will I be oily after the massage?", a: "Yes, the oil is an important part of the treatment. There is a shower on site with towel, shampoo and shower gel." },
        { q: "Which massage should I choose?", a: "Choose the treatment you feel you need. Abhyanga focuses on deep recovery and rest, while Vishesh targets tension and balance." },
        { q: "What should I bring to the massage?", a: "Bring or wear comfortable clothes and a change of clothes. Underwear is needed during the treatment." },
      ],
    },
    courses: { title: "Courses", soon: "Coming soon" },
    footer: { location: "Vasastan, Stockholm" },
  },
};

// ── Summer Banner ─────────────────────────────────────────────────────────────

function SummerBanner({ t }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="summer-banner">
      <span>{t.banner}</span>
      <button
        className="summer-banner-close"
        onClick={() => setVisible(false)}
        aria-label={t.bannerClose}
      >
        x
      </button>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ t, lang, setLang }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);
  const toggleLang = () => { setLang(lang === "sv" ? "en" : "sv"); close(); };

  return (
    <nav className="navbar">
      <a href="#top" className="nav-logo-link" onClick={close}>
        <img src="/assets/lightlogo.png" alt="Health by Jasmin logotyp" className="logo" />
      </a>
      <button
        className={`hamburger${menuOpen ? " toggle" : ""}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={t.nav.aboutMe}
      >
        <span /><span /><span />
      </button>
      <ul className={`nav-links${menuOpen ? " nav-active" : ""}`}>
        <li><a href="#om-mig" onClick={close}>{t.nav.aboutMe}</a></li>
        <li><a href="#yoga" onClick={close}>{t.nav.yoga}</a></li>
        <li><a href="#ayurveda" onClick={close}>{t.nav.ayurveda}</a></li>
        <li><a href="#boka" onClick={close}>{t.nav.book}</a></li>
      </ul>
      <button className="lang-toggle" onClick={toggleLang} aria-label="Switch language">
        {lang === "sv" ? "EN" : "SV"}
      </button>
    </nav>
  );
}

// ── Booking ───────────────────────────────────────────────────────────────────

function Booking({ t, dates, slots, address, slotPrefix }) {
  const [dateIdx, setDateIdx] = useState(null);
  const [slot, setSlot] = useState(null);
  const [treatment, setTreatment] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [step, setStep] = useState("select");
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
    const key = `${slotPrefix}-${dateIdx}-${slot.t}`;
    const d = dates[dateIdx];
    const dateStr = `${d.getDate()} ${SV_MONTHS[d.getMonth()]} 2026`;
    const timeStr = `${slot.t}–${slot.e}`;
    const fullName = `${form.firstName} ${form.lastName}`;
    const treatmentName = t.treatments.find((tr) => tr.id === treatment).name;

    try {
      const { data: ins, error } = await supabase
        .from("bookings")
        .insert({ slot_key: key, customer_email: form.email, customer_name: fullName, treatment: treatmentName, date: dateStr, time: timeStr })
        .select()
        .single();
      if (error) throw error;

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_JASMIN, {
        treatment: `${treatmentName} (55 min)`,
        date: dateStr, time: timeStr,
        customer_name: fullName, customer_email: form.email, customer_phone: form.phone,
        booking_id: ins.booking_id,
        address,
      }, EMAILJS_PUBLIC_KEY);

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_CUSTOMER, {
        customer_name: form.firstName,
        customer_email: form.email,
        treatment: `${treatmentName} (55 min)`,
        date: dateStr,
        time: timeStr,
        address,
      }, EMAILJS_PUBLIC_KEY);

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
    setDateIdx(null); setSlot(null); setTreatment(null);
    setForm({ firstName: "", lastName: "", email: "", phone: "" });
    setStep("select");
  }

  const selectedDate = dateIdx !== null ? dates[dateIdx] : null;
  const b = t.booking;

  return (
    <div className="booking-wrap">

      {step !== "done" && (
        <>
          {/* Behandlingsval */}
          <div className="booking-treatments">
            <p className="booking-row-label">{b.valjBehandling}</p>
            <div className="treatment-pick-grid">
              {t.treatments.map((tr) => (
                <button
                  key={tr.id}
                  className={`treatment-pick-card${treatment === tr.id ? " selected" : ""}`}
                  onClick={() => setTreatment(tr.id)}
                >
                  <span className="treatment-pick-name">{tr.name}</span>
                  <span className="treatment-pick-desc">{tr.description}</span>
                  <span className="treatment-pick-price">{b.pris}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Datumväljare */}
          <div className="booking-dates">
            <p className="booking-row-label">{b.valjDatum}</p>
            <div className="dates-scroll">
              {dates.map((d, i) => {
                const isPast = d < today;
                return (
                  <button
                    key={i}
                    className={`date-btn${isPast ? " disabled" : ""}${dateIdx === i ? " selected" : ""}`}
                    disabled={isPast}
                    onClick={() => handleDate(i)}
                  >
                    <span className="date-wd">{t.days[d.getDay()]}</span>
                    <span className="date-dd">{d.getDate()}</span>
                    <span className="date-mo">{t.months[d.getMonth()]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Massage tider */}
          {dateIdx !== null && step === "select" && (
            <div className="booking-services">
              <div className="service-row">
                <div className="times-grid">
                  {slots.map((s, i) => {
                    const key = `${slotPrefix}-${dateIdx}-${s.t}`;
                    const booked = bookedSlots.includes(key);
                    return (
                      <div
                        key={i}
                        className={`time-slot${slot === s ? " selected" : ""}${booked ? " booked" : ""}`}
                        onClick={() => !booked && setSlot(s)}
                      >
                        <div className="time-slot-t">{s.t} – {s.e}</div>
                        <div className="time-slot-s">{booked ? b.fullbooked : b.duration}</div>
                      </div>
                    );
                  })}
                </div>
                {slot && treatment && (
                  <button className="booking-btn-next" style={{ marginTop: "1rem" }} onClick={() => setStep("form")}>
                    {b.gaVidare}
                  </button>
                )}
                {slot && !treatment && (
                  <p style={{ fontSize: "13px", color: "#888", margin: "0.75rem 0 0", maxWidth: "100%" }}>
                    {b.behandlingHint}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Bokningsformulär */}
          {step === "form" && selectedDate && slot && (
            <div className="booking-form-wrap">
              <div className="booking-form-summary">
                <div>
                  <span className="booking-form-summary-label">
                    {t.treatments.find((tr) => tr.id === treatment)?.name} &middot; 55 min
                  </span>
                  <span className="booking-form-summary-value">
                    {selectedDate.getDate()} {t.months[selectedDate.getMonth()]} &middot; {slot.t}–{slot.e}
                  </span>
                </div>
                <button className="booking-change-btn" onClick={() => setStep("select")}>{b.andra}</button>
              </div>

              <div className="massage-form">
                <label>{b.firstName}<input type="text" name="firstName" value={form.firstName} onChange={handleField} placeholder={b.firstNamePh} /></label>
                <label>{b.lastName}<input type="text" name="lastName" value={form.lastName} onChange={handleField} placeholder={b.lastNamePh} /></label>
                <label>{b.email}<input type="email" name="email" value={form.email} onChange={handleField} placeholder={b.emailPh} /></label>
                <label>{b.phone}<input type="tel" name="phone" value={form.phone} onChange={handleField} placeholder={b.phonePh} /></label>
                <div className="payment-section-label">{b.betalning}</div>
                <div className="payment-opt">
                  <input type="radio" name="pay" defaultChecked readOnly />
                  <div>
                    <div className="payment-opt-title">{b.betalningTitle}</div>
                    <div className="payment-opt-sub">{b.betalningDesc}</div>
                  </div>
                </div>
              </div>

              <div className="booking-btn-row" style={{ marginTop: "1.25rem" }}>
                <button className="booking-btn-back" onClick={() => setStep("select")}>{b.tillbaka}</button>
                <button className="booking-btn-next" disabled={!formValid || sending} onClick={submit}>
                  {sending ? b.skickar : b.bekrafta}
                </button>
              </div>
              {sendError && <p className="send-error">{b.errorMsg}</p>}
            </div>
          )}
        </>
      )}

      {/* Bekräftelse */}
      {step === "done" && selectedDate && slot && (
        <div className="booking-confirm">
          <p className="booking-confirm-title">{b.confirmTitle}</p>
          <p className="booking-confirm-sub">{b.confirmSub(form.firstName)}</p>
          <div className="booking-confirm-rows">
            {[
              [b.rowBehandling, `${t.treatments.find((tr) => tr.id === treatment)?.name} · 55 min`],
              [b.rowDatum, `${selectedDate.getDate()} ${t.months[selectedDate.getMonth()]} 2026`],
              [b.rowTid, `${slot.t}–${slot.e}`],
              [b.rowPlats, address],
              [b.rowPris, b.pris],
              [b.rowBetalning, b.rowFaktura],
            ].map(([k, v]) => (
              <div key={k} className="summary-row">
                <span className="summary-key">{k}</span>
                <span className="summary-val">{v}</span>
              </div>
            ))}
          </div>
          <div className="booking-confirm-info">
            <p>{b.info1}</p>
            <p>{b.info2}</p>
            <p>{b.info3}</p>
            <p>{b.info4pre} <a href="mailto:healthbyjasmin@gmail.com">healthbyjasmin@gmail.com</a></p>
          </div>
          <button className="booking-btn-next" onClick={reset}>{b.gorNyBokning}</button>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HealthByJasmin() {
  const [lang, setLang] = useState("sv");
  const [activeLocation, setActiveLocation] = useState(null);
  const t = TRANSLATIONS[lang];
  const b = t.booking;

  function toggleLocation(loc) {
    setActiveLocation((prev) => (prev === loc ? null : loc));
  }

  return (
    <>
      <SummerBanner t={t} />

      <header className="site-header">
        <Navbar t={t} lang={lang} setLang={setLang} />
      </header>

      <main>
        {/* Hero */}
        <section id="top" className="page-hero">
          <div className="page-hero-inner">
            <span className="hero-eyebrow">{t.hero.eyebrow}</span>
            <h1 className="hero-title">Health by Jasmin</h1>
            <p className="hero-sub">{t.hero.sub}</p>
            <a href="#om-mig" className="hero-scroll-arrow" aria-label={t.hero.scrollLabel}>
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
              <span className="service-card-label">{t.cards.massageLabel}</span>
              <h3>{t.cards.massageTitle}</h3>
            </a>
            <a href="#yoga" className="service-card">
              <span className="service-card-label">{t.cards.yogaLabel}</span>
              <h3>{t.cards.yogaTitle}</h3>
            </a>
            <a href="#boka" className="service-card">
              <span className="service-card-label">{t.cards.coursesLabel}</span>
              <h3>{t.cards.coursesTitle}</h3>
            </a>
          </div>
        </section>

        {/* Om mig */}
        <section id="om-mig" className="content-section about-bg">
          <div className="section-inner">
            <div className="about-split">
              <div className="about-split-head">
                <span className="section-label">{t.about.label}</span>
                <h2>Jasmin<br />Hedlund</h2>
              </div>
              <div className="about-split-body">
                <p>{t.about.p1}</p>
                <p>{t.about.p2}</p>
                <p>{t.about.p3}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="img-divider" style={{ backgroundImage: "url(/assets/last.jpeg)" }} role="presentation" />

        {/* Yoga */}
        <section id="yoga" className="content-section yoga-text-section">
          <div className="section-inner">
            <div className="yoga-split-top">
              <span className="section-label">{t.yoga.label}</span>
              <h2>Yoga</h2>
              <p className="yoga-intro">{t.yoga.intro}</p>
            </div>
            <div className="yoga-cards-grid">
              <div className="yoga-card">
                <h3>{t.yoga.ashtangaTitle}</h3>
                <p>{t.yoga.ashtangaP1}</p>
                <p>{t.yoga.ashtangaP2}</p>
                <div className="yoga-card-footer">
                  <span className="yoga-coming-soon">{t.yoga.ashtangaSoon}</span>
                </div>
              </div>
              <div className="yoga-card">
                <h3>{t.yoga.yinTitle}</h3>
                <p>{t.yoga.yinP1}</p>
                <div className="yoga-card-footer">
                  <span className="yoga-col-schedule">{t.yoga.yinSchedule}</span>
                </div>
              </div>
              <div className="yoga-card">
                <h3>{t.yoga.yogaAyurvedaTitle}</h3>
                <p>{t.yoga.yogaAyurvedaP1}</p>
                <p>{t.yoga.yogaAyurvedaP2}</p>
                <p>{t.yoga.yogaAyurvedaP3}</p>
                <div className="yoga-card-footer">
                  <span className="yoga-col-schedule">{t.yoga.yogaAyurvedaSub}</span>
                </div>
              </div>
            </div>

            <div className="yoga-shared-btns">
              <div className="yoga-col-btns">
                <a href="https://www.homeinyoga.com/schedule" target="_blank" rel="noopener noreferrer" className="yoga-row-btn">
                  {t.booking.bokaNYoga}
                </a>
                <a href="https://www.homeinyoga.com/pricing" target="_blank" rel="noopener noreferrer" className="yoga-row-btn">
                  {t.yoga.yinPricing}
                </a>
              </div>
              <span className="yoga-col-via">{t.yoga.yinBookVia}</span>
            </div>
          </div>
        </section>

        {/* Ayurveda */}
        <section id="ayurveda" className="content-section">
          <div className="section-inner editorial-grid">
            <div className="editorial-media">
              <img src="/assets/ayurveda.jpg" alt="Ayurvediska örter och oljor" className="editorial-img" />
            </div>
            <div className="editorial-text">
              <span className="section-label">{t.ayurveda.label}</span>
              <h2>Ayurveda</h2>
              <p>{t.ayurveda.p1}</p>
              <p>{t.ayurveda.p2}</p>
              <h3>{t.ayurveda.massageTitle}</h3>
              <p>{t.ayurveda.massageP1}</p>
              <p>{t.ayurveda.massageP2}</p>
            </div>
          </div>
          <div id="boka" className="ayurveda-booking-area">
            <div className="section-inner">
              <div className="booking-location-grid">

                {/* Söndagar – Birkagatan 23 */}
                <div className={`booking-location-card${activeLocation === "sun" ? " active" : ""}`}>
                  <div className="booking-location-card-header">
                    <div className="booking-location-info">
                      <span className="booking-location-day">{b.sondagar}</span>
                      <span className="booking-location-address">Birkagatan 23, Stockholm</span>
                      <span className="booking-location-times">09:00–09:55 &nbsp;·&nbsp; 10:10–11:05</span>
                    </div>
                    <button
                      className={`boka-behandling-btn${activeLocation === "sun" ? " open" : ""}`}
                      onClick={() => toggleLocation("sun")}
                    >
                      {activeLocation === "sun" ? b.stangBokning : b.bokaBehandling}
                    </button>
                  </div>
                  {activeLocation === "sun" && (
                    <Booking
                      t={t}
                      dates={BOOKING_SUNDAYS}
                      slots={MASSAGE_SLOTS}
                      address="Birkagatan 23, Stockholm"
                      slotPrefix="massage"
                    />
                  )}
                </div>

                {/* Torsdagar – Åsögatan 166 */}
                <div className={`booking-location-card${activeLocation === "thu" ? " active" : ""}`}>
                  <div className="booking-location-card-header">
                    <div className="booking-location-info">
                      <span className="booking-location-day">{b.torsdagar}</span>
                      <span className="booking-location-address">Åsögatan 166, Stockholm</span>
                      <span className="booking-location-times">18:00–18:55</span>
                    </div>
                    <button
                      className={`boka-behandling-btn${activeLocation === "thu" ? " open" : ""}`}
                      onClick={() => toggleLocation("thu")}
                    >
                      {activeLocation === "thu" ? b.stangBokning : b.bokaBehandling}
                    </button>
                  </div>
                  {activeLocation === "thu" && (
                    <Booking
                      t={t}
                      dates={BOOKING_THURSDAYS}
                      slots={EVENING_SLOTS}
                      address="Åsögatan 166, Stockholm"
                      slotPrefix="thu-massage"
                    />
                  )}
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Kurser */}
        <section className="retreat-section">
          <article className="retreat">
            <img src="/assets/retreat.jpg" alt="Kurser och workshops inom yoga och ayurveda" />
            <h2>{t.courses.title}</h2>
            <span>{t.courses.soon}</span>
          </article>
        </section>

        {/* Quote */}
        <section className="quote-section">
          <p>{t.quote}</p>
        </section>

        {/* Recensioner */}
        <section className="testimonials-section">
          <div className="section-inner">
            <span className="section-label">{t.reviews.label}</span>
            <h2>{t.reviews.title}</h2>
            <div className="testimonials-grid">
              {t.reviews.items.map((r) => (
                <div key={r.author} className="testimonial-card">
                  <p className="testimonial-text">{r.text}</p>
                  <span className="testimonial-author">{r.author}</span>
                </div>
              ))}
            </div>
            <div className="instagram-cta">
              <a href="https://www.instagram.com/healthbyjasmin/" target="_blank" rel="noopener noreferrer" className="instagram-btn">
                <i className="fab fa-instagram" />
                {t.reviews.instagram}
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="content-section faq-section">
          <div className="section-inner">
            <span className="section-label">{t.faq.label}</span>
            <h2>{t.faq.title}</h2>
            <div className="faq-grid">
              {t.faq.items.map(({ q, a }) => (
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
          <a href="https://www.instagram.com/healthbyjasmin/" aria-label="Instagram">
            <i className="fab fa-instagram" />
          </a>
        </div>
        <p>{t.footer.location}</p>
        <p><a href="mailto:healthbyjasmin@gmail.com">healthbyjasmin@gmail.com</a></p>
      </footer>
    </>
  );
}
