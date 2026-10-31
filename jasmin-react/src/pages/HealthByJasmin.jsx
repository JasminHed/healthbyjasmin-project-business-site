import emailjs from "@emailjs/browser";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

import "../styles/app.css";

/* ============================================================================
   HEALTH BY JASMIN – hela hemsidan i en fil

   Innehåll (sök på rubrikerna nedan med Ctrl/Cmd+F):
     1. INSTÄLLNINGAR      – Supabase + EmailJS
     2. BOKNINGSTIDER      – datum och klockslag
     3. TEXTER             – all text på svenska (sv) och engelska (en)
     4. MENY               – Navbar
     5. BOKNINGSFORMULÄR   – själva bokningen (välj behandling, tid, uppgifter)
     6. STARTSIDAN         – hero, om mig, ayurveda, yoga, citat, recensioner
     7. BOKA-SIDAN         – egen sida (nås via #boka)
     8. SIDFOT
     9. APP                – väljer vilken sida som visas
   ============================================================================ */

/* ============================================================================
   1. INSTÄLLNINGAR
   ============================================================================ */

const supabase = createClient(
  "https://besnxjxiadkapxgmabdz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc254anhpYWRrYXB4Z21hYmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzY0OTIsImV4cCI6MjA5NDI1MjQ5Mn0.VEH6QtlFEieEYtQTuWvXPNPVwAB_Lw19wk-NGYz0oNY",
);

const EMAILJS_SERVICE_ID = "service_mjw4cpb";
const EMAILJS_TEMPLATE = "template_8rmxsm9";
const EMAILJS_PUBLIC_KEY = "y7Yu8QbgFj3NM0VeM";

// Bilder på startsidan
const HERO_IMAGES = [
  "/assets/header.jpeg",
  "/assets/ayurveda.jpg",
  "/assets/ashtanga.jpeg",
];

/* ============================================================================
   2. BOKNINGSTIDER
   ============================================================================ */

// Tre tider per torsdagskväll, 55 min per behandling med 15 min mellan.
const BIRKA_SLOTS = [
  { t: "18:00", e: "18:55" },
  { t: "19:15", e: "20:10" },
  { t: "20:30", e: "21:25" },
];

// Torsdagar som är bokade på annan plats (visas som "Bokad")
const BOOKED_DATES = ["2026-10-22", "2026-11-12", "2026-11-26"];

// Bygger listan med alla torsdagar 15 okt – 17 dec 2026
const TORSDAG_ENTRIES = [];
for (
  const d = new Date(2026, 9, 15);
  d <= new Date(2026, 11, 17);
  d.setDate(d.getDate() + 7)
) {
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const booked = BOOKED_DATES.includes(iso);
  BIRKA_SLOTS.forEach((s) =>
    TORSDAG_ENTRIES.push({ date: new Date(d), slots: [s], booked }),
  );
}

// Svenska månader som alltid används i mejlet till Jasmin
const SV_MONTHS = [
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

/* ============================================================================
   3. TEXTER
   ============================================================================ */

const TRANSLATIONS = {
  /* ───────────── SVENSKA ───────────── */
  sv: {
    nav: {
      aboutMe: "Om mig",
      yoga: "Yoga & Ayurveda",
      ayurveda: "Ayurveda",
      book: "Boka",
    },
    buttons: {
      book: "Boka",
      interest: "Intresseanmälan",
    },
    home: {
      treatLabel: "Behandlingar",
      treatTitle: "Hitta din behandling",
      treatLink: "Boka →",
      stepsLabel: "Så går det till",
      stepsTitle: "Enkelt från start till ro",
      steps: [
        {
          title: "Boka online",
          text: "Välj behandling och en tid som passar. Du får ett bekräftelsemejl direkt. Avboka senast 24 timmar innan.",
        },
        {
          title: "Kom och landa",
          text: "Kom i oömma kläder, underkläder används under behandlingen. Vi börjar lugnt så att du hinner landa.",
        },
        {
          title: "Återhämta dig",
          text: "Ta det lugnt efteråt och duscha ordentligt hemma, så får oljan göra sitt.",
        },
      ],
    },
    hero: {
      eyebrow: "Yoga & Ayurveda · Stockholm · 2015",
      sub: "Välkommen. Genom yoga och ayurveda erbjuder jag verktyg för att stärka, återhämta och hitta balans i vardagen.",
      scrollLabel: "Scrolla ned",
    },
    about: {
      label: "Om mig",
      p1: "Jag är Jasmin, personen bakom Health by Jasmin, ett enmannaföretag baserat i Stockholm, Sverige. Jag har praktiserat Ayurveda och Yoga sedan 2013. Det som först drog mig till både yoga och ayurveda var strukturen, rytmen och sättet som båda praktikerna sätter saker i fokus, ibland mjukt, ibland med kraft.",
      p2: "Jag förälskade mig i deras holistiska förhållningssätt och hur de utmanar dig att se på dig själv och dina vanor från en helt annan vinkel. År 2015/2016 startade jag Health by Jasmin för att skapa ett utrymme där jag kunde dela det som verkligen har resonerat med mig under åren.",
      p3: "Det här gör jag i små doser genom Ayurveda & Yoga kurser, Ayurvediska behandlingar och Retreats där båda får ta plats.",
    },
    ayurveda: {
      label: "Hälsa & välmående",
      p1: "Ayurveda ger oss kunskap och verktyg för att stärka och läka oss själva, både fysiskt och mentalt. Det är ett holistiskt förhållningssätt till hälsa med rötter i Indien och över 6000 år av tradition.",
      p2: "Ayurveda ser hela människan, kropp, sinne och allt däremellan. Har du huvudvärk beror det sällan bara på huvudet, det finns troligtvis något annat i kroppen eller livet som hänger samman.",
      massageTitle: "Ayurvedisk massage",
      massageP1:
        "En av de finaste delarna av Ayurveda är behandlingarna, framförallt massagerna. De är ofta värmande och djupt lugnande, med varm sesamolja. Den är gynnsam för alla doshor: vata, pitta och kapha.",
      massageP2:
        "Ayurvediska massager utförs med varm sesamolja och vid specifika behandlingar används varmvattenpåsar. Vi masserar huvud, ansikte, fram- och baksida av kroppen inklusive fötter.",
      radgivningTitle: "Ayurvedisk rådgivning",
      radgivningP1:
        "En individuell konsultation där vi läser pulsen och undersöker egenskaper som tillhör vata, pitta och kapha. Utifrån det samtalar vi om ditt välmående, din kropp och din livssituation. Du får sedan egna råd och tips som stödjer eventuella obalanser och som är anpassade efter just dig. Det kan handla om rutiner, sömn, dygnsrytm, mat och mycket mer.",
    },
    yoga: {
      label: "Kurs",
      intro:
        "Lär dig förstå dig själv, din kropp och dina vanor, och rör på dig i en lugn och skön yogaklass.",
      sub: "Bokning öppnar snart",
      p1: "Ayurveda är en av världens äldsta kunskapstraditioner om hälsa. På den här kursen lär du dig förstå dig själv, din kropp och dina vanor, och får samtidigt röra på dig i en lugn och skön yogaklass.",
      p2Title: "Varje tillfälle är 90 minuter och har två delar:",
      p2: "30 min ayurveda: du lär dig något nytt om ayurveda.\n60 min yoga: flödesklass med stående och sittande positioner som är bra för vata, pitta och kapha (tridoshisk). Vi avslutar alltid med kroppsscanning.",
      p3Title: "Kursens innehåll",
      p3: "Tillfälle 1 · 17:30–19:00\nAyurveda, vad är det?\nYoga (tridoshisk) och kroppsscanning\n\nTillfälle 2 · 17:30–19:00\nDoshorna, vårt utseende och våra personligheter\nYoga (tridoshisk) och kroppsscanning\n\nTillfälle 3 · 17:30–19:00\nDoshorna, vår fysik och våra sinnen\nYoga (tridoshisk) och kroppsscanning\n\nTillfälle 4 · 17:30–19:00\nLivets rytmer\nYoga (tridoshisk) och kroppsscanning\n\nTillfälle 5 · 17:30–19:00\nAgni och ama\nYoga (tridoshisk) och kroppsscanning\n\nTillfälle 6 · 17:30–19:00\nMat som medicin\nYoga (tridoshisk) och kroppsscanning",
    },
    quote: '"Rörelse är medicin för kroppen, stillhet är medicin för sinnet."',
    reviews: {
      label: "Recensioner",
      title: "Vad våra kunder säger",
      items: [
        {
          text: '"Den ayurvediska massagen var precis vad jag behövde. Djup avslappning och en verkligt professionell behandling. Jag lämnade med en känsla av fullständig återhämtning."',
          author: "Frida",
        },
        {
          text: '"Ayurveda & Yoga klassen med Jasmin är en av veckorutinens höjdpunkter. Lugn, och trygg. Jag märker skillnaden i kroppen direkt efteråt."',
          author: "Anna",
        },
        {
          text: '"Jasmin har ett unikt sätt att förmedla både yoga och ayurveda."',
          author: "Juan",
        },
        {
          text: '"Har fått en underbar varm skön ayurveda massage av Jasmin. I en lugn trygg och mysig lokal. Jag kommer verkligen unna mig att komma tillbaka igen."',
          author: "Maria",
        },
      ],
    },
    // Behandlingarna som visas på Boka-sidan
    treatments: [
      {
        id: "abhyanga",
        name: "Abhyanga",
        price: "750 kr",
        description:
          "Klassisk helkroppsmassage med varm sesamolja i långa, mjuka drag, från huvud till fötter. Ger återhämtning, grundning och ro, och mjukar upp muskler och leder.",
      },
      {
        id: "vishesh",
        name: "Vishesh",
        price: "750 kr",
        description:
          "Som Abhyanga, men med fastare tryck och lite högre tempo. Når djupare spänningar, ökar cirkulationen och ger lätthet i kropp och sinne.",
      },
      {
        id: "marma",
        name: "Marma",
        price: "750 kr",
        description:
          "Börjar med samtal och pulsläsning. Sedan en subtil beröring över marmapunkter, valda efter din dosha, med fokus på huvud, hjärta, mage, knän och fötter. Balanserar doshan och ger ofta djup återhämtning.",
      },
      {
        id: "halsradgivning",
        name: "Ayurvedisk hälsorådgivning",
        price: "695 kr",
        description:
          "Enskilt samtal där jag läser din puls och din konstitution. Du får enkla, personliga råd om kost, sömn och rutiner.",
      },
    ],
    // Boka-sidans rubriker och de tre raderna
    bookPage: {
      label: "Boka",
      title: "Boka din tid",
      colLabel: "Välj vad du vill boka",
      openLabel: "Boka",
      closeLabel: "Stäng",
      rows: [
        {
          id: "massage",
          type: "Ayurvedisk massage",
          loc: "(Vasastan · ej dusch)",
          time: "55 min",
          price: "",
        },
        {
          id: "radgivning",
          type: "Ayurvedisk hälsorådgivning",
          loc: "(Vasastan)",
          time: "55 min",
          price: "",
        },
        {
          id: "kurs",
          type: "Yoga & Ayurveda kurs",
          loc: "",
          time: "6 tillfällen · 90 min",
          price: "",
        },
      ],
      courseText:
        "Bokningen till kursen öppnar snart. Skicka en intresseanmälan så hör jag av mig när det är dags.",
      courseMailLabel: "Skicka intresseanmälan",
      courseMailSubject: "Intresseanmälan Yoga & Ayurveda kurs",
    },
    booking: {
      andra: "Ändra",
      tillbaka: "Tillbaka",
      bekrafta: "Bekräfta bokning",
      skickar: "Skickar...",
      name: "Namn",
      namePh: "För- och efternamn",
      email: "E-post",
      emailPh: "din@email.se",
      phone: "Telefon",
      phonePh: "07X XXX XX XX",
      betalning: "Betalning",
      betalningTitle: "Swish eller faktura",
      betalningDesc:
        "Betalning sker via Swish eller faktura. Faktura finns för dig som vill använda friskvårdsbidrag.",
      fullbooked: "Bokad",
      confirmTitle: "Bokning bekräftad",
      confirmSub: (name) => `Tack ${name}! Din bokning är registrerad.`,
      confirmEmailNote:
        "Du har fått ett bekräftelsemejl till den e-postadress du angav i bokningen.",
      confirmTreatment: "Behandling",
      confirmDate: "Datum",
      confirmTime: "Tid",
      confirmAddress: "Adress",
      errorMsg: "Något gick fel. Kontakta healthbyjasmin@gmail.com",
      slotTakenMsg:
        "Den här tiden bokades precis av någon annan. Välj en annan tid.",
      behandlingHint: "Välj en behandling ovan för att gå vidare.",
      stepTreatmentTime: "Behandling & tid",
      stepDetails: "Uppgifter",
      nextSlotsLabel: "Nästa lediga tider",
      showAllDates: "Visa alla datum ↓",
      hideAllDates: "Dölj alla datum ↑",
      noSlotsMsg:
        "Inga lediga tider just nu – hör av dig på Instagram eller mail.",
    },
    months: [
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
    ],
    days: ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"],
    footer: {
      location: "Stockholm",
      tagline: "Yoga & Ayurveda · Stockholm",
      linkAboutMe: "Om mig",
      linkAyurveda: "Ayurveda",
      linkYoga: "Yoga",
      linkBook: "Boka",
      copyright: "© 2015 Health by Jasmin",
      instagramHandle: "@healthbyjasmin",
    },
  },

  /* ───────────── ENGELSKA ───────────── */
  en: {
    nav: {
      aboutMe: "About me",
      yoga: "Yoga",
      ayurveda: "Ayurveda",
      book: "Book",
    },
    buttons: {
      book: "Book",
      interest: "Register interest",
    },
    home: {
      treatLabel: "Treatments",
      treatTitle: "Find your treatment",
      treatLink: "Book →",
      stepsLabel: "How it works",
      stepsTitle: "Simple from start to calm",
      steps: [
        {
          title: "Book online",
          text: "Choose a treatment and a time that suits you. You get a confirmation email right away. Cancel at least 24 hours before.",
        },
        {
          title: "Arrive and settle",
          text: "Wear comfortable clothes, underwear is worn during the treatment. We start slowly so you can settle in.",
        },
        {
          title: "Recover",
          text: "Take it easy afterwards and shower thoroughly at home, so the oil can do its work.",
        },
      ],
    },
    hero: {
      eyebrow: "Yoga & Ayurveda · Stockholm · 2015",
      sub: "Welcome. Through yoga and ayurveda I offer tools to strengthen, recover and find balance in everyday life.",
      scrollLabel: "Scroll down",
    },
    about: {
      label: "About me",
      p1: "I am Jasmin, the person behind Health by Jasmin, a sole entrepreneur based in Stockholm, Sweden. I have practised Ayurveda and Yoga since 2013. What first drew me to both yoga and ayurveda was the structure, the rhythm and the way both practices bring things into focus, sometimes gently, sometimes with force.",
      p2: "I fell in love with their holistic approach and how they challenge you to look at yourself and your habits from a completely different angle. In 2015/2016 I started Health by Jasmin to create a space where I could share what has truly resonated with me over the years.",
      p3: "I do this in small doses through Ayurveda and Yoga courses, Ayurvedic treatments and retreats containing them both.",
    },
    ayurveda: {
      label: "Health & wellbeing",
      p1: "Ayurveda gives us knowledge and tools to strengthen and heal ourselves, both physically and mentally. It is a holistic approach to health with roots in India and over 6,000 years of tradition.",
      p2: "Ayurveda sees the whole person: body, mind and everything in between. If you have a headache, it is rarely just about your head; there is likely something else in the body or in life that is connected.",
      massageTitle: "Ayurvedic massage",
      massageP1:
        "One of the most beautiful parts of Ayurveda is the treatments, especially the massages. They are often warming and deeply soothing, using warm sesame oil. It is beneficial for all doshas: vata, pitta and kapha.",
      massageP2:
        "Ayurvedic massages are performed with warm sesame oil and for specific treatments warm water bags are used. We massage the head, face, front and back of the body including the feet.",
      radgivningTitle: "Ayurvedic consultation",
      radgivningP1:
        "An individual consultation where we read the pulse and look for qualities belonging to vata, pitta and kapha. Based on that, we talk about your wellbeing, your body and your life situation. You then receive personal advice and tips tailored to support any imbalances and adapted to you specifically. This may include routines, sleep, daily rhythm, food and much more.",
    },
    yoga: {
      label: "Course",
      intro:
        "Learn to understand yourself, your body and your habits, while moving in a calm and enjoyable yoga class.",
      sub: "More info coming soon",
      p1: "Ayurveda is one of the world's oldest traditions of knowledge about health. In this course you learn to understand yourself, your body and your habits, while moving in a calm and enjoyable yoga class.",
      p2Title: "Each session is 90 minutes and has two parts:",
      p2: "30 min ayurveda: you learn something new about ayurveda.\n60 min yoga: a flow class with standing and seated poses that benefit vata, pitta and kapha (tridoshic). We always finish with a body scan.",
      p3Title: "Course content",
      p3: "Session 1 · 17:30–19:00\nWhat is ayurveda?\nYoga (tridoshic) and body scan\n\nSession 2 · 17:30–19:00\nThe doshas, our appearance and personalities\nYoga (tridoshic) and body scan\n\nSession 3 · 17:30–19:00\nThe doshas, our physiology and senses\nYoga (tridoshic) and body scan\n\nSession 4 · 17:30–19:00\nThe rhythms of life\nYoga (tridoshic) and body scan\n\nSession 5 · 17:30–19:00\nAgni and ama\nYoga (tridoshic) and body scan\n\nSession 6 · 17:30–19:00\nFood as medicine\nYoga (tridoshic) and body scan",
    },
    quote:
      '"Movement is medicine for the body, stillness is medicine for the mind."',
    reviews: {
      label: "Reviews",
      title: "What our clients say",
      items: [
        {
          text: '"The ayurvedic massage was exactly what I needed. Deep relaxation and a truly professional treatment. I left with a feeling of complete recovery."',
          author: "Frida",
        },
        {
          text: '"The ayurveda and yoga class with Jasmin is one of the highlights of my weekly routine."',
          author: "Anna",
        },
        {
          text: '"Jasmin has a unique way of conveying both yoga and ayurveda."',
          author: "Juan",
        },
        {
          text: '"I had a wonderful, warm and soothing ayurvedic massage with Jasmin. In a calm, safe and cosy space. I will definitely treat myself to coming back again."',
          author: "Maria",
        },
      ],
    },
    treatments: [
      {
        id: "abhyanga",
        name: "Abhyanga",
        price: "750 kr",
        description:
          "Classic full-body massage with warm sesame oil in long, soft strokes, from head to feet. Brings recovery, grounding and calm, and softens muscles and joints.",
      },
      {
        id: "vishesh",
        name: "Vishesh",
        price: "750 kr",
        description:
          "Like Abhyanga, but with firmer pressure and a slightly faster pace. Reaches deeper tension, boosts circulation and brings lightness to body and mind.",
      },
      {
        id: "marma",
        name: "Marma",
        price: "750 kr",
        description:
          "Begins with a conversation and pulse reading. Then a subtle touch over marma points, chosen for your dosha, focusing on the head, heart, stomach, knees and feet. Balances the dosha and often brings deep recovery.",
      },
      {
        id: "halsradgivning",
        name: "Ayurvedic health consultation",
        price: "695 kr",
        description:
          "Individual session where I read your pulse and constitution. You get simple, personal advice on food, sleep and routines.",
      },
    ],
    bookPage: {
      label: "Book",
      title: "Book your time",
      colLabel: "Choose what you want to book",
      openLabel: "Book",
      closeLabel: "Close",
      rows: [
        {
          id: "massage",
          type: "Ayurvedic massage",
          loc: "(Vasastan · no shower)",
          time: "55 min",
          price: "",
        },
        {
          id: "radgivning",
          type: "Ayurvedic health consultation",
          loc: "(Vasastan)",
          time: "55 min",
          price: "",
        },
        {
          id: "kurs",
          type: "Yoga & Ayurveda course",
          loc: "",
          time: "6 sessions · 90 min",
          price: "",
        },
      ],
      courseText:
        "Booking for the course opens soon. Send an expression of interest and I will get back to you when it is time.",
      courseMailLabel: "Send expression of interest",
      courseMailSubject: "Interest in Yoga & Ayurveda course",
    },
    booking: {
      andra: "Change",
      tillbaka: "Back",
      bekrafta: "Confirm booking",
      skickar: "Sending...",
      name: "Name",
      namePh: "First and last name",
      email: "Email",
      emailPh: "your@email.com",
      phone: "Phone",
      phonePh: "07X XXX XX XX",
      betalning: "Payment",
      betalningTitle: "Swish or invoice",
      betalningDesc:
        "Payment via Swish or invoice. Invoice is available for those who want to use their wellness benefit (friskvårdsbidrag).",
      fullbooked: "Booked",
      confirmTitle: "Booking confirmed",
      confirmSub: (name) => `Thank you ${name}! Your booking is registered.`,
      confirmEmailNote:
        "A confirmation email has been sent to the email address you provided.",
      confirmTreatment: "Treatment",
      confirmDate: "Date",
      confirmTime: "Time",
      confirmAddress: "Address",
      errorMsg: "Something went wrong. Contact healthbyjasmin@gmail.com",
      slotTakenMsg:
        "This time was just booked by someone else. Please choose another time.",
      behandlingHint: "Choose a treatment above to continue.",
      stepTreatmentTime: "Treatment & time",
      stepDetails: "Your details",
      nextSlotsLabel: "Next available times",
      showAllDates: "Show all dates ↓",
      hideAllDates: "Hide all dates ↑",
      noSlotsMsg:
        "No available times right now – reach out on Instagram or email.",
    },
    months: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    footer: {
      location: "Stockholm",
      tagline: "Yoga & Ayurveda · Stockholm",
      linkAboutMe: "About me",
      linkAyurveda: "Ayurveda",
      linkYoga: "Ayurveda & Yoga",
      linkBook: "Book",
      copyright: "© 2015 Health by Jasmin",
      instagramHandle: "@healthbyjasmin",
    },
  },
};

/* ============================================================================
   4. MENY
   ============================================================================ */

function Navbar({ t, lang, setLang }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  function toggleLang() {
    setLang(lang === "sv" ? "en" : "sv");
    close();
  }

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
        aria-label={t.nav.aboutMe}
      >
        <span />
        <span />
        <span />
      </button>

      <ul className={`nav-links${menuOpen ? " nav-active" : ""}`}>
        <li>
          <a href="#om-mig" onClick={close}>
            {t.nav.aboutMe}
          </a>
        </li>
        <li>
          <a href="#ayurveda" onClick={close}>
            {t.nav.ayurveda}
          </a>
        </li>
        <li>
          <a href="#yoga" onClick={close}>
            {t.nav.yoga}
          </a>
        </li>
        <li className="nav-book-mobile">
          <a
            href="#boka"
            onClick={close}
            className="nav-book-btn"
            style={{ display: "inline-flex" }}
          >
            {t.nav.book}
          </a>
        </li>
      </ul>

      <a href="#boka" className="nav-book-btn nav-book-desktop" onClick={close}>
        {t.nav.book}
      </a>

      <button
        className="lang-toggle"
        onClick={toggleLang}
        aria-label="Switch language"
      >
        {lang === "sv" ? "EN" : "SV"}
      </button>
    </nav>
  );
}

/* ============================================================================
   5. BOKNINGSFORMULÄR
   ============================================================================ */

function Booking({ t, entries, address, slotPrefix, treatmentIds, onDone }) {
  const b = t.booking;
  const treatments = t.treatments.filter((tr) => treatmentIds.includes(tr.id));

  // ── Vad kunden har valt ──
  const [dateIdx, setDateIdx] = useState(null);
  const [slot, setSlot] = useState(null);
  const [treatment, setTreatment] = useState(
    treatments.length === 1 ? treatments[0].id : null,
  );
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  // ── Vad som redan är bokat (hämtas från Supabase) ──
  const [bookedSlots, setBookedSlots] = useState([]);
  const [bookedDates, setBookedDates] = useState(new Set());

  // ── Status ──
  const [step, setStep] = useState("select"); // "select" | "form" | "done"
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [slotTaken, setSlotTaken] = useState(false);
  const [showAllDates, setShowAllDates] = useState(false);

  const formRef = useRef(null);
  const datesRef = useRef(null);
  const confirmRef = useRef(null);
  const prevStep = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Scrolla till rätt ställe när steget ändras
  useEffect(() => {
    if (step === "form" && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (step === "select" && prevStep.current === "form" && datesRef.current) {
      datesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (step === "done" && confirmRef.current) {
      confirmRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    prevStep.current = step;
  }, [step]);

  // Efter 10 sek på bekräftelsen: nollställ och stäng
  useEffect(() => {
    if (step !== "done") return;
    const timer = setTimeout(() => {
      setStep("select");
      setDateIdx(null);
      setSlot(null);
      onDone?.();
    }, 10000);
    return () => clearTimeout(timer);
  }, [step]);

  // Hämta redan bokade tider när sidan öppnas
  useEffect(() => {
    supabase
      .from("bookings")
      .select("slot_key, date, time")
      .then(({ data }) => {
        if (!data) return;
        setBookedSlots(data.map((r) => r.slot_key));
        setBookedDates(
          new Set(
            data
              .filter((r) => r.date && r.time)
              .map((r) => `${r.date}|${r.time}`),
          ),
        );
      });
  }, []);

  // ── Hjälpfunktioner för tider ──

  function fmtDate(d) {
    return `${d.getDate()} ${SV_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  // Någon har redan bokat samma datum + tid (gäller massage och rådgivning)
  function isDateBooked(d, s) {
    return bookedDates.has(`${fmtDate(d)}|${s.t}–${s.e}`);
  }

  // Är tid nummer i redan bokad?
  function isEntryBooked(i) {
    const { date, slots, booked } = entries[i];
    const key = `${slotPrefix}-${i}-${slots[0].t}`;
    return (
      bookedSlots.includes(key) || !!booked || isDateBooked(date, slots[0])
    );
  }

  // Låst = en dag där inget är bokat än, och det här inte är dagens första tid.
  // Då går bara första tiden att boka (inga luckor). När något är bokat
  // den dagen öppnas resten.
  function isEntryLocked(i) {
    const dayKey = entries[i].date.toDateString();
    const sameDay = [];
    entries.forEach((e, j) => {
      if (e.date.toDateString() === dayKey) sameDay.push(j);
    });
    const first = sameDay.reduce(
      (best, j) =>
        entries[j].slots[0].t < entries[best].slots[0].t ? j : best,
      sameDay[0],
    );
    if (i === first) return false;
    return !sameDay.some((j) => isEntryBooked(j));
  }

  // Mindre än 24 timmar kvar?
  function isTooSoon(date, time) {
    const dt = new Date(date);
    const [h, m] = time.split(":").map(Number);
    dt.setHours(h, m, 0, 0);
    return dt - Date.now() < 24 * 60 * 60 * 1000;
  }

  // De 4 närmaste lediga tiderna
  const nextAvailable = [];
  for (let i = 0; i < entries.length && nextAvailable.length < 4; i++) {
    const { date, slots } = entries[i];
    if (date < today) continue;
    if (isEntryBooked(i) || isEntryLocked(i)) continue;
    if (isTooSoon(date, slots[0].t)) continue;
    nextAvailable.push({ i, date, slotTime: slots[0].t });
  }

  const currentStep = step === "form" ? 2 : 1;

  const formValid =
    form.name.trim().length > 1 &&
    form.email.includes("@") &&
    form.phone.trim().length >= 8 &&
    treatment !== null;

  // ── Klick-funktioner ──

  function handleDate(i) {
    const available = !isEntryBooked(i) && !isEntryLocked(i);
    setDateIdx(i);
    setSlot(available ? entries[i].slots[0] : null);
    if (available && treatment !== null) setStep("form");
    else if (step === "form") setStep("select");
  }

  function selectTreatment(id) {
    setTreatment(id);
    if (dateIdx !== null && slot !== null) setStep("form");
  }

  function handleField(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  // ── Skicka bokningen ──
  async function submit() {
    setSending(true);
    setSendError(false);
    setSlotTaken(false);

    const key = `${slotPrefix}-${dateIdx}-${slot.t}`;
    const dateStr = fmtDate(entries[dateIdx].date);
    const timeStr = `${slot.t}–${slot.e}`;
    const fullName = form.name.trim();
    const treatmentName = treatments.find((tr) => tr.id === treatment).name;

    try {
      // Kolla en sista gång att tiden är ledig
      const { data: existing } = await supabase
        .from("bookings")
        .select("slot_key")
        .eq("slot_key", key)
        .maybeSingle();
      if (existing) {
        setBookedSlots((prev) => [...prev, key]);
        setSlotTaken(true);
        setSending(false);
        return;
      }

      // Första tiden måste vara bokad före resterande tider
      if (isEntryLocked(dateIdx)) {
        setSlotTaken(true);
        setSending(false);
        return;
      }

      // Spara i databasen
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

      // Skicka bekräftelsemejl
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE,
        {
          customer_name: fullName,
          customer_email: form.email,
          treatment: `${treatmentName} (55 min)`,
          date: dateStr,
          time: timeStr,
          address,
          booking_id: ins.booking_id,
          customer_phone: form.phone,
        },
        EMAILJS_PUBLIC_KEY,
      );

      setBookedSlots((prev) => [...prev, key]);
      setBookedDates((prev) => new Set([...prev, `${dateStr}|${timeStr}`]));
      setStep("done");
    } catch (err) {
      console.error(err);
      setSendError(true);
    } finally {
      setSending(false);
    }
  }

  const selectedDate = dateIdx !== null ? entries[dateIdx].date : null;
  const selectedTreatment = treatments.find((tr) => tr.id === treatment);

  return (
    <div className="booking-wrap">
      {step !== "done" && (
        <>
          {/* ── Stegindikator (1 → 2) ── */}
          <div className="booking-stepper">
            <div
              className={`bks-step${currentStep >= 1 ? " bks-active" : ""}${currentStep > 1 ? " bks-done" : ""}`}
            >
              <span className="bks-num">{currentStep > 1 ? "✓" : "1"}</span>
              <span className="bks-label">{b.stepTreatmentTime}</span>
            </div>
            <div className="bks-line" />
            <div className={`bks-step${currentStep >= 2 ? " bks-active" : ""}`}>
              <span className="bks-num">2</span>
              <span className="bks-label">{b.stepDetails}</span>
            </div>
          </div>

          {/* ── Välj behandling (bara om det finns fler än en) ── */}
          {treatments.length > 1 && step !== "form" && (
            <div className="booking-treatments">
              <div className="treatment-pick-grid">
                {treatments.map((tr) => (
                  <button
                    key={tr.id}
                    className={`treatment-pick-card${treatment === tr.id ? " selected" : ""}`}
                    onClick={() => selectTreatment(tr.id)}
                  >
                    <div className="tpc-top">
                      <span className="treatment-pick-name">{tr.name}</span>
                      <span className="treatment-pick-price">{tr.price}</span>
                    </div>
                    <span className="treatment-pick-desc">
                      {tr.description}
                    </span>
                  </button>
                ))}
              </div>
              {!treatment && (
                <p className="booking-treatment-hint">{b.behandlingHint}</p>
              )}
            </div>
          )}

          {/* ── Välj tid ── */}
          {step !== "form" && (
            <div className="booking-next-slots" ref={datesRef}>
              <p className="booking-row-label">{b.nextSlotsLabel}</p>

              {nextAvailable.length === 0 ? (
                <p className="booking-no-slots">{b.noSlotsMsg}</p>
              ) : (
                <div className="next-slot-row">
                  {nextAvailable.map(({ i, date, slotTime }) => (
                    <button
                      key={i}
                      className={`next-slot-btn${dateIdx === i ? " selected" : ""}${!treatment ? " no-treatment" : ""}`}
                      disabled={!treatment}
                      onClick={() => handleDate(i)}
                    >
                      <span className="nsb-day">{t.days[date.getDay()]}</span>
                      <span className="nsb-date">
                        {date.getDate()} {t.months[date.getMonth()]}
                      </span>
                      <span className="nsb-time">{slotTime}</span>
                    </button>
                  ))}
                </div>
              )}

              <button
                className="booking-show-all"
                onClick={() => setShowAllDates((p) => !p)}
              >
                {showAllDates ? b.hideAllDates : b.showAllDates}
              </button>

              {/* Alla datum */}
              {showAllDates && (
                <div className="dates-grid" style={{ marginTop: "1rem" }}>
                  {(() => {
                    // Gruppera tiderna per dag
                    const days = [];
                    const seen = new Map();
                    entries.forEach(({ date, slots }, i) => {
                      const dk = date.toDateString();
                      if (!seen.has(dk)) {
                        seen.set(dk, days.length);
                        days.push({ date, items: [] });
                      }
                      days[seen.get(dk)].items.push({ slots, i });
                    });

                    return days.map(({ date, items }) => (
                      <div key={date.toDateString()} className="dates-grid-row">
                        <div className="dates-grid-label">
                          <span className="dgr-wd">
                            {t.days[date.getDay()]}
                          </span>
                          <span className="dgr-dd">{date.getDate()}</span>
                          <span className="dgr-mo">
                            {t.months[date.getMonth()]}
                          </span>
                        </div>

                        {items.map(({ slots, i }) => {
                          const booked = isEntryBooked(i);
                          const tooSoon = isTooSoon(date, slots[0].t);
                          const unavailable =
                            date < today ||
                            booked ||
                            tooSoon ||
                            isEntryLocked(i) ||
                            !treatment;
                          return (
                            <button
                              key={i}
                              className={`dgr-slot${unavailable ? " disabled" : ""}${dateIdx === i ? " selected" : ""}`}
                              disabled={unavailable}
                              onClick={() => handleDate(i)}
                            >
                              <span className="dgr-time">
                                {booked || tooSoon ? b.fullbooked : slots[0].t}
                              </span>
                            </button>
                          );
                        })}

                        {items.length === 1 && (
                          <div className="dgr-slot-spacer" />
                        )}
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          )}

          {/* ── Uppgifter (steg 2) ── */}
          {step === "form" && selectedDate && slot && (
            <div className="booking-form-wrap" ref={formRef}>
              <div className="booking-form-summary">
                <div>
                  <span className="booking-form-summary-label">
                    {selectedTreatment?.name} &middot; 55 min
                  </span>
                  <span className="booking-form-summary-value">
                    {selectedDate.getDate()} {t.months[selectedDate.getMonth()]}{" "}
                    &middot; {slot.t}
                  </span>
                </div>
                <button
                  className="booking-change-btn"
                  onClick={() => setStep("select")}
                >
                  {b.andra}
                </button>
              </div>

              <div className="massage-form">
                <label className="full-row">
                  {b.name}
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleField}
                    placeholder={b.namePh}
                  />
                </label>
                <label>
                  {b.email}
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleField}
                    placeholder={b.emailPh}
                  />
                </label>
                <label>
                  {b.phone}
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleField}
                    placeholder={b.phonePh}
                  />
                </label>

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
                <button
                  className="booking-btn-back"
                  onClick={() => setStep("select")}
                >
                  {b.tillbaka}
                </button>
                <button
                  className="booking-btn-next"
                  disabled={!formValid || sending}
                  onClick={submit}
                >
                  {sending ? b.skickar : b.bekrafta}
                </button>
              </div>

              {slotTaken && <p className="send-error">{b.slotTakenMsg}</p>}
              {sendError && <p className="send-error">{b.errorMsg}</p>}
            </div>
          )}
        </>
      )}

      {/* ── Bekräftelse ── */}
      {step === "done" && selectedDate && slot && (
        <div className="booking-confirm" ref={confirmRef}>
          <p className="booking-confirm-title">{b.confirmTitle}</p>
          <p className="booking-confirm-sub">
            {b.confirmSub(form.name.trim().split(" ")[0])}
          </p>
          <div className="booking-confirm-details">
            <div className="bcd-row">
              <span className="bcd-label">{b.confirmTreatment}</span>
              <span className="bcd-value">{selectedTreatment?.name}</span>
            </div>
            <div className="bcd-row">
              <span className="bcd-label">{b.confirmDate}</span>
              <span className="bcd-value">
                {selectedDate.getDate()} {t.months[selectedDate.getMonth()]}{" "}
                {selectedDate.getFullYear()}
              </span>
            </div>
            <div className="bcd-row">
              <span className="bcd-label">{b.confirmTime}</span>
              <span className="bcd-value">
                {slot.t}–{slot.e}
              </span>
            </div>
            <div className="bcd-row">
              <span className="bcd-label">{b.confirmAddress}</span>
              <span className="bcd-value">{address}</span>
            </div>
          </div>
          <p className="booking-confirm-email-note">{b.confirmEmailNote}</p>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   6. STARTSIDAN
   ============================================================================ */

function HomePage({ t, lang }) {
  const [heroImg, setHeroImg] = useState(0);
  const shelfRef = useRef(null);

  // Byt bakgrundsbild i hero var 5:e sekund
  useEffect(() => {
    const id = setInterval(
      () => setHeroImg((i) => (i + 1) % HERO_IMAGES.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);

  // Pilarna i recensionerna
  function scrollShelf(dir) {
    const el = shelfRef.current;
    if (!el) return;
    const card = el.querySelector(".testimonial-card");
    const cardW = card ? card.offsetWidth + 20 : 300;
    el.scrollBy({ left: dir * cardW, behavior: "smooth" });
  }

  // Tona in element med klassen "fade-up" när de syns
  useEffect(() => {
    const els = document.querySelectorAll(".fade-up");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.1 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lang]);

  return (
    <>
      {/* ───────── HERO (överst) ───────── */}
      <section id="top" className="page-hero">
        {HERO_IMAGES.map((src, i) => (
          <div
            key={src}
            className={`hero-slide${heroImg === i ? " hero-slide-active" : ""}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className="page-hero-inner">
          <span className="hero-eyebrow">{t.hero.eyebrow}</span>
          <h1 className="hero-title">Health by Jasmin</h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <a
            href="#om-mig"
            className="hero-scroll-arrow"
            aria-label={t.hero.scrollLabel}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </a>
        </div>
      </section>

      {/* ───────── OM MIG ───────── */}
      <section id="om-mig" className="content-section about-bg">
        <div className="section-inner">
          <div className="about-split fade-up">
            <div className="about-split-head">
              <span className="section-label">{t.about.label}</span>
              <h2>
                Jasmin
                <br />
                Hedlund
              </h2>
            </div>
            <div className="about-split-body">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <p>{t.about.p3}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── BEHANDLINGAR ───────── */}
      <section id="behandlingar" className="content-section">
        <div className="section-inner">
          <span className="section-label">{t.home.treatLabel}</span>
          <h2>{t.home.treatTitle}</h2>
          <div className="treat-grid fade-up">
            {t.treatments.map((tr) => (
              <a key={tr.id} href="#boka" className="treat-card">
                <div className="treat-card-top">
                  <h3>{tr.name}</h3>
                  <span className="treat-card-price">{tr.price}</span>
                </div>
                <p>{tr.description}</p>
                <span className="treat-card-link">{t.home.treatLink}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── AYURVEDA + YOGA (schackrutor: bild | text, text | bild) ───────── */}
      <section className="checkerboard-section" id="ayurveda">
        {/* Rad 1 vänster: bild */}
        <div className="cb-cell cb-img">
          <img
            src="/assets/ayurveda.jpg"
            alt="Ayurvediska örter och oljor"
            className="cb-img-fill"
          />
        </div>

        {/* Rad 1 höger: Ayurveda-text + Boka-knapp */}
        <div className="cb-cell cb-text fade-up">
          <span className="section-label">{t.ayurveda.label}</span>
          <h2>Ayurveda</h2>
          <p>{t.ayurveda.p1}</p>
          <p>{t.ayurveda.p2}</p>
          <h3>{t.ayurveda.massageTitle}</h3>
          <p>{t.ayurveda.massageP1}</p>
          <p>{t.ayurveda.massageP2}</p>
          <h3>{t.ayurveda.radgivningTitle}</h3>
          <p>{t.ayurveda.radgivningP1}</p>
          <a href="#boka" className="section-book-btn">
            {t.buttons.book}
          </a>
        </div>

        {/* Rad 2 vänster: Yoga & Ayurveda-kursen + knapp */}
        <div className="cb-cell cb-text cb-text-alt fade-up" id="yoga">
          <span className="section-label">{t.yoga.label}</span>
          <h2>Yoga &amp; Ayurveda</h2>
          <p className="yoga-intro">{t.yoga.intro}</p>
          <p>{t.yoga.p1}</p>
          <p className="course-title">{t.yoga.p2Title}</p>
          <p className="course-list">{t.yoga.p2}</p>
          <p className="course-title">{t.yoga.p3Title}</p>
          <p className="course-list">{t.yoga.p3}</p>
          <span className="yoga-schedule-row">
            <span className="yoga-col-schedule">{t.yoga.sub}</span>
          </span>
          <a href="#boka" className="section-book-btn">
            {t.buttons.interest}
          </a>
        </div>

        {/* Rad 2 höger: bild */}
        <div className="cb-cell cb-img">
          <img src="/assets/ashtanga.jpeg" alt="Yoga" className="cb-img-fill" />
        </div>
      </section>

      {/* ───────── SÅ GÅR DET TILL ───────── */}
      <section className="content-section about-bg">
        <div className="section-inner">
          <span className="section-label">{t.home.stepsLabel}</span>
          <h2>{t.home.stepsTitle}</h2>
          <div className="steps-grid fade-up">
            {t.home.steps.map((st, i) => (
              <div key={st.title} className="step-card">
                <span className="step-num">{i + 1}</span>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CITAT ───────── */}
      <section className="quote-section">
        <p>{t.quote}</p>
      </section>

      {/* ───────── RECENSIONER ───────── */}
      <section className="testimonials-section">
        <div className="section-inner">
          <span className="section-label">{t.reviews.label}</span>
          <h2>{t.reviews.title}</h2>

          <div className="testimonials-shelf-wrap">
            <button
              className="shelf-arrow shelf-arrow-prev"
              onClick={() => scrollShelf(-1)}
              aria-label="Föregående"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="18"
                height="18"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="testimonials-shelf fade-up" ref={shelfRef}>
              {t.reviews.items.map((r) => (
                <div key={r.author} className="testimonial-card">
                  <div className="testimonial-stars">★★★★★</div>
                  <p className="testimonial-text">{r.text}</p>
                  <span className="testimonial-author">{r.author}</span>
                </div>
              ))}
            </div>

            <button
              className="shelf-arrow shelf-arrow-next"
              onClick={() => scrollShelf(1)}
              aria-label="Nästa"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="18"
                height="18"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================================================
   7. BOKA-SIDAN (egen sida, nås via #boka)
   ============================================================================ */

function BookingPage({ t }) {
  // Vilken rad som är öppen: "massage", "radgivning", "kurs" eller null
  const [open, setOpen] = useState(null);
  const p = t.bookPage;

  return (
    <section className="week-schedule-section booking-page">
      <div className="section-inner">
        <span className="section-label">{p.label}</span>
        <h2 className="week-schedule-title">{p.title}</h2>

        {/* De tre valen */}
        <div className="wsr-columns wsr-columns-single">
          <div className="wsr-col">
            <p className="wsr-col-label">{p.colLabel}</p>
            <div className="week-schedule-rows">
              {p.rows.map((row) => {
                const isOpen = open === row.id;
                return (
                  <button
                    key={row.id}
                    className={`week-schedule-row${isOpen ? " wsr-active" : ""}`}
                    onClick={() => setOpen(isOpen ? null : row.id)}
                  >
                    <span className="wsr-info" style={{ flex: 1 }}>
                      <span className="wsr-type">{row.type}</span>
                      {row.loc && (
                        <span className="wsr-type-loc">{row.loc}</span>
                      )}
                      <span className="wsr-time-inline">{row.time}</span>
                    </span>
                    {row.price && (
                      <span className="wsr-price">{row.price}</span>
                    )}
                    <span className="wsr-btn">
                      {isOpen ? p.closeLabel : p.openLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Massage */}
        {open === "massage" && (
          <div className="week-schedule-booking">
            <Booking
              t={t}
              entries={TORSDAG_ENTRIES}
              address="Birkagatan 23, Stockholm (ej dusch)"
              slotPrefix="birka-massage"
              treatmentIds={["abhyanga", "vishesh", "marma"]}
              onDone={() => setOpen(null)}
            />
          </div>
        )}

        {/* Rådgivning */}
        {open === "radgivning" && (
          <div className="week-schedule-booking">
            <Booking
              t={t}
              entries={TORSDAG_ENTRIES}
              address="Birkagatan 23, Stockholm"
              slotPrefix="birka-radgivning"
              treatmentIds={["halsradgivning"]}
              onDone={() => setOpen(null)}
            />
          </div>
        )}

        {/* Kurs (bokning öppnar snart) */}
        {open === "kurs" && (
          <div className="week-schedule-booking booking-course-box">
            <p>{p.courseText}</p>
            <a
              className="section-book-btn"
              href={`mailto:healthbyjasmin@gmail.com?subject=${encodeURIComponent(p.courseMailSubject)}`}
            >
              {p.courseMailLabel}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   8. SIDFOT
   ============================================================================ */

function Footer({ t }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img
            src="/assets/lightlogo.png"
            alt="Health by Jasmin"
            className="footer-logo"
          />
          <p className="footer-tagline">{t.footer.tagline}</p>
        </div>

        <div className="footer-links">
          <a href="#om-mig">{t.footer.linkAboutMe}</a>
          <a href="#ayurveda">{t.footer.linkAyurveda}</a>
          <a href="#yoga">{t.footer.linkYoga}</a>
          <a href="#boka">{t.footer.linkBook}</a>
        </div>

        <div className="footer-contact">
          <span className="footer-loc">{t.footer.location}</span>
          <a href="mailto:healthbyjasmin@gmail.com" className="footer-email">
            healthbyjasmin@gmail.com
          </a>
          <a
            href="https://www.instagram.com/healthbyjasmin/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-ig"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram" />
            <span>{t.footer.instagramHandle}</span>
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{t.footer.copyright}</span>
      </div>
    </footer>
  );
}

/* ============================================================================
   9. APP – väljer vilken sida som visas
      Adressen slutar på #boka  → Boka-sidan
      Allt annat                → Startsidan
   ============================================================================ */

export default function HealthByJasmin() {
  const [lang, setLang] = useState("sv");
  const [hash, setHash] = useState(window.location.hash);

  const t = TRANSLATIONS[lang];
  const page = hash === "#boka" ? "boka" : "home";

  // Lyssna på när adressen (#...) ändras
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Scrolla rätt när sidan eller adressen ändras
  useEffect(() => {
    if (page === "boka") {
      window.scrollTo(0, 0);
      return;
    }
    const id = hash.slice(1);
    if (!id) return;
    const scrollToSection = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    // Vänta tills sidan ritats, och försök igen när bilder laddats klart
    requestAnimationFrame(() => requestAnimationFrame(scrollToSection));
    window.addEventListener("load", scrollToSection);
    return () => window.removeEventListener("load", scrollToSection);
  }, [page, hash]);

  return (
    <>
      <header className="site-header">
        <Navbar t={t} lang={lang} setLang={setLang} />
      </header>

      <main className="main-sections">
        {page === "boka" ? (
          <BookingPage t={t} />
        ) : (
          <HomePage t={t} lang={lang} />
        )}
      </main>

      <Footer t={t} />
    </>
  );
}
