import emailjs from "@emailjs/browser";
import { createClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import "../styles/app.css";

const supabase = createClient(
  "https://besnxjxiadkapxgmabdz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc254anhpYWRrYXB4Z21hYmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzY0OTIsImV4cCI6MjA5NDI1MjQ5Mn0.VEH6QtlFEieEYtQTuWvXPNPVwAB_Lw19wk-NGYz0oNY"
);

// ── Admin ──────────────────────────────────────────────────────────────────────
const ADMIN_HASH = "eadafb9d02781f44fe2b2664c65b8c934ace9e9dc3d59ea345d5b6c7dbebb0e7";

async function hashPassword(pwd) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pwd));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const CONTENT_KEY = "hbj_content_v2";
function loadLocalContent() {
  try { return JSON.parse(localStorage.getItem(CONTENT_KEY) || "null"); } catch { return null; }
}
function persistLocal(content) {
  try { localStorage.setItem(CONTENT_KEY, JSON.stringify(content)); } catch (e) { console.warn("localStorage save failed", e); }
}

function deepMerge(base, overrides) {
  if (!overrides || typeof overrides !== "object") return base;
  // Array base + object override with numeric string keys → merge into array slots
  if (Array.isArray(base) && !Array.isArray(overrides)) {
    const result = [...base];
    for (const key of Object.keys(overrides)) {
      const idx = Number(key);
      if (!isNaN(idx)) {
        result[idx] = (overrides[key] && typeof overrides[key] === "object" && result[idx] && typeof result[idx] === "object")
          ? deepMerge(result[idx], overrides[key])
          : overrides[key];
      }
    }
    return result;
  }
  const result = { ...base };
  for (const key of Object.keys(overrides)) {
    if (typeof overrides[key] === "object" && overrides[key] !== null && !Array.isArray(overrides[key]) && typeof base[key] === "object" && base[key] !== null && !Array.isArray(base[key])) {
      result[key] = deepMerge(base[key], overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}

function setNestedValue(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]] || typeof cur[keys[i]] !== "object") cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

const HEADING_FONTS = ["Cormorant Garamond", "Playfair Display", "Lora", "Libre Baskerville", "DM Serif Display", "Montserrat"];
const BODY_FONTS = ["Inter", "DM Sans", "Lato", "Nunito", "Raleway", "Source Sans 3"];

function loadGoogleFont(name) {
  if (!name) return;
  const id = "gf-" + name.replace(/\s+/g, "-").toLowerCase();
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id; link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap`;
  document.head.appendChild(link);
}

function applyFonts({ heading, body }) {
  let el = document.getElementById("admin-font-override");
  if (!el) { el = document.createElement("style"); el.id = "admin-font-override"; document.head.appendChild(el); }
  const rules = [];
  if (heading) { loadGoogleFont(heading); rules.push(`h1,h2,h3,h4{font-family:'${heading}',serif!important}`); }
  if (body)    { loadGoogleFont(body);    rules.push(`body,p,li,span,button,input,select,textarea{font-family:'${body}',sans-serif!important}`); }
  el.textContent = rules.join("\n");
}

const AdminCtx = createContext({ isAdmin: false, onEdit: () => {}, onImageUpload: () => {} });

function EditableText({ path, value, tag: Tag = "span", className }) {
  const { isAdmin, onEdit } = useContext(AdminCtx);
  if (!isAdmin) return className ? <Tag className={className}>{value}</Tag> : <Tag>{value}</Tag>;
  return (
    <Tag
      className={(className ? className + " " : "") + "admin-editable"}
      contentEditable suppressContentEditableWarning spellCheck={false}
      onBlur={e => { const v = e.currentTarget.innerText.trim(); if (v !== value) onEdit(path, v); }}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}

function EditableImage({ imgKey, src, alt, className, wrapStyle }) {
  const { isAdmin, onImageUpload } = useContext(AdminCtx);
  const inputRef = useRef(null);
  if (!isAdmin) return <img src={src} alt={alt} className={className} />;
  return (
    <div className="admin-img-wrap" style={wrapStyle} onClick={() => inputRef.current?.click()} title="Klicka för att byta bild">
      <img src={src} alt={alt} className={className} />
      <div className="admin-img-overlay"><span>Byt bild</span></div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { if (e.target.files[0]) onImageUpload(imgKey, e.target.files[0]); }} />
    </div>
  );
}

const EMAILJS_SERVICE_ID = "service_mjw4cpb";
const EMAILJS_TEMPLATE_JASMIN = "template_m9afbud";
const EMAILJS_TEMPLATE_CUSTOMER = "template_8rmxsm9";
const EMAILJS_PUBLIC_KEY = "y7Yu8QbgFj3NM0VeM";

// ── Booking dates & slots (language-neutral) ───────────────────────────────────


// Torsdagar — Birkagatan 23. Varje kväll två tider: 18:30 och 21:15.
const TORSDAG_ENTRIES = [
  { date: new Date(2026, 7, 20),  slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 7, 20),  slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 7, 27),  slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 7, 27),  slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 8, 3),   slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 8, 3),   slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 8, 10),  slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 8, 10),  slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 8, 17),  slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 8, 17),  slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 8, 24),  slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 8, 24),  slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 9, 1),   slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 9, 1),   slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 9, 8),   slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 9, 8),   slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 9, 15),  slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 9, 15),  slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 9, 22),  slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 9, 22),  slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 9, 29),  slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 9, 29),  slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 10, 5),  slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 10, 5),  slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 10, 12), slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 10, 12), slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 10, 19), slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 10, 19), slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 10, 26), slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 10, 26), slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 11, 3),  slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 11, 3),  slots: [{ t: "21:15", e: "22:10" }] },
  { date: new Date(2026, 11, 10), slots: [{ t: "18:30", e: "19:25" }] },
  { date: new Date(2026, 11, 10), slots: [{ t: "21:15", e: "22:10" }] },
];


// Swedish months always used in emails to Jasmin
const SV_MONTHS = ["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];

// ── Translations ───────────────────────────────────────────────────────────────

const TRANSLATIONS = {
  sv: {
    nav: { aboutMe: "Om mig", yoga: "Yoga", ayurveda: "Ayurveda", book: "Boka" },
    hero: {
      eyebrow: "Yoga & Ayurveda · Stockholm · 2015",
      sub: "Välkommen. Genom yoga och ayurveda erbjuder jag verktyg för att stärka, återhämta och hitta balans i vardagen.",
      scrollLabel: "Scrolla ned",
    },
    about: {
      label: "Om mig",
      p1: "Jag är Jasmin, personen bakom Health by Jasmin, ett enmannaföretag baserat i Stockholm, Sverige. Jag har praktiserat Ashtanga yoga och Ayurveda i nästan 17 år. Yin yoga byggdes på längs vägen. Det som först drog mig till både yoga och ayurveda var strukturen, rytmen och sättet som båda praktikerna sätter saker i fokus, ibland mjukt, ibland med kraft.",
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
      yinP1: "Yin yoga är en långsam, stilla praktik där positioner hålls i flera minuter. Det arbetar djupt in i bindväv, ligament och leder snarare än musklerna, vilket ökar rörligheten och ger bättre ledfunktion. Praktiken har en lugnande effekt på nervsystemet och fungerar som ett bra komplement till mer aktiva träningsformer.",
      yinSchedule: "60 min · Söndagar · 12:15–13:15",
      yogaAyurvedaTitle: "Yoga & Ayurveda",
      yogaAyurvedaSub: "60 min · Torsdagar · 20:00–21:00",
      yogaAyurvedaP1: "En klass i två delar. Vi börjar med ayurveda, ett tema, ett ämne eller ett tips från traditionen. Det kan handla om doshor, sömn, mat, dygnsrytm eller något annat ur ayurvedans värld.",
      yogaAyurvedaP2: "Andra delen är yoga med positioner som gynnar alla doshor. Klassen rör sig genom flöde, stående och sittande positioner och avslutas med vila eller meditation.",
    },
    ayurveda: {
      label: "Hälsa & välmående",
      p1: "Ayurveda ger oss kunskap och verktyg för att stärka och läka oss själva, både fysiskt och mentalt. Det är ett holistiskt förhållningssätt till hälsa med rötter i Indien och över 6000 år av tradition.",
      p2: "Ayurveda ser hela människan, kropp, sinne och allt däremellan. Har du huvudvärk beror det sällan bara på huvudet, det finns troligtvis något annat i kroppen eller livet som hänger samman.",
      massageTitle: "Ayurvedisk massage",
      massageP1: "En av de finaste delarna av Ayurveda är behandlingarna, framförallt massagerna. De är ofta värmande och djupt lugnande, med varm sesamolja. Den är gynnsam för alla doshor: vata, pitta och kapha.",
      massageP2: "Ayurvediska massager utförs med varm sesamolja och vid specifika behandlingar används varmvattenpåsar. Vi masserar huvud, ansikte, fram- och baksida av kroppen inklusive fötter.",
      radgivningTitle: "Ayurvedisk rådgivning",
      radgivningP1: "En individuell konsultation där vi läser pulsen och undersöker egenskaper som tillhör vata, pitta och kapha. Utifrån det samtalar vi om ditt välmående, din kropp och din livssituation. Du får sedan egna råd och tips som stödjer eventuella obalanser och som är anpassade efter just dig. Det kan handla om rutiner, sömn, dygnsrytm, mat och mycket mer.",
    },
    booking: {
      title: "Boka",
      plats: "Plats", dag: "Dag", sondagar: "Söndagar", torsdagar: "Torsdagar kväll", kvallstider: "Ons & fre kväll",
      pausad: "Tillfälligt pausad", ingenDusch: "Dusch ej tillgänglig på denna plats", duschFinns: "Dusch finns tillgänglig",
      valjBehandling: "Välj behandling", valjDatum: "Välj datum",
      andra: "Ändra", tillbaka: "Tillbaka",
      bekrafta: "Bekräfta bokning", skickar: "Skickar...", gorNyBokning: "Gör en ny bokning",
      firstName: "Förnamn", firstNamePh: "Ditt förnamn",
      lastName: "Efternamn", lastNamePh: "Ditt efternamn",
      email: "E-post", emailPh: "din@email.se",
      phone: "Telefon", phonePh: "07X XXX XX XX",
      betalning: "Betalning", betalningTitle: "Swish eller faktura", betalningDesc: "Betalning sker via Swish eller faktura. Faktura finns för dig som vill använda friskvårdsbidrag.",
      fullbooked: "Bokad", duration: "55 min",
      confirmTitle: "Bokning bekräftad",
      confirmSub: (name) => `Tack ${name}! Din bokning är registrerad.`,
      confirmEmailNote: "Du har fått ett bekräftelsemejl till den e-postadress du angav i bokningen.",
      errorMsg: "Något gick fel. Kontakta healthbyjasmin@gmail.com",
      behandlingHint: "Välj en behandling ovan för att gå vidare.",
    },
    treatments: [
      { id: "abhyanga",       name: "Abhyanga",                      price: "750 kr", description: "Helkroppsmassage med varm sesamolja i långa, svepande rörelser. Ger värme, grundning och närvaro. Ett sätt för kropp och sinne att sakta ned och landa." },
      { id: "vishesh",        name: "Vishesh",                       price: "750 kr", description: "Helkroppsmassage med varm sesamolja i långa drag med mer tryck. Mjukar upp muskler, frigör spänningar och ger kroppen lätthet. Du lämnar lättare och klarare i kropp och sinne." },
      { id: "halsradgivning", name: "Ayurvedisk hälsorådgivning",    price: "695 kr", description: "Individuell rådgivning baserad på din ayurvediska konstitution. Vi tittar på hur du mår, dina vanor och din vardag – och sätter ihop konkreta råd för kost, rutiner och livsstil anpassade för dig." },
    ],
    months: ["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"],
    days: ["Sön","Mån","Tis","Ons","Tor","Fre","Lör"],
    quote: '"Rörelse är medicin för kroppen, stillhet är medicin för sinnet."',
    reviews: {
      label: "Recensioner", title: "Vad våra kunder säger",
      items: [
        { text: '"Den ayurvediska massagen var precis vad jag behövde. Djup avslappning och en verkligt professionell behandling. Jag lämnade med en känsla av fullständig återhämtning."', author: "Frida" },
        { text: '"Yin yogaklassen med Jasmin är en av veckorutinens höjdpunkter. Lugn, inkluderande och meningsfull. Jag märker skillnaden i kroppen direkt efteråt."', author: "Anna" },
        { text: '"Jasmin har ett unikt sätt att förmedla både yoga och ayurveda."', author: "Juan" },
        { text: '"Har fått en underbar varm skön ayurveda massage av Jasmin. I en lugn trygg och mysig lokal. Jag kommer verkligen unna mig att komma tillbaka igen."', author: "Maria" },
      ],
      instagram: "Följ @healthbyjasmin",
    },
    faq: {
      label: "Vanliga frågor", title: "FAQ",
      items: [
        { q: "Var hålls klasser och behandlingar?", a: "Alla yogaklasser hålls i Vasastan på Birkagatan 23. Ayurvediska behandlingar hålls torsdagskvällar på Birkagatan 23 i Vasastan. Se bokningssektionen ovan för aktuella tider." },
        { q: "Hur bokar jag yoga?", a: "Yoga bokas via länken i yogasektionen ovan." },
        { q: "Hur bokar jag ayurvedisk behandling?", a: "Behandlingar bokas direkt via formuläret ovan. Välj plats, datum och tid direkt på sidan." },
        { q: "Vad gäller vid avbokning?", a: "Avbokning av behandling görs senast 24 timmar innan. Mejla healthbyjasmin@gmail.com. För yogaklasser gäller studiots avbokningsregler." },
        { q: "Hur betalas behandlingen?", a: "Betalning sker via Swish eller faktura. Faktura finns för dig som vill använda friskvårdsbidrag." },
        { q: "Blir man oljig av massagen?", a: "Ja, oljan är en viktig del av behandlingen. Det finns dusch på plats med handduk, schampo och duschcreme." },
        { q: "Vilken massage ska jag välja?", a: "Abhyanga ges i långa, svepande rörelser med varm sesamolja. Den ger värme, grundning och närvaro. Kropp och sinne bjuds in att sakta ned. Känslan efteråt är samlad och landad. Vishesh ges med mer tryck i långa, djupgående drag. Den mjukar upp muskler, frigör spänningar och ger kroppen lätthet. Du lämnar lättare och klarare i kropp och sinne. Vid Vishesh inkluderas även säte och vader." },
        { q: "Vad ska jag ha med mig till massagen?", a: "Ta med eller kom i oömma kläder och ombyte. Underkläder behövs under behandlingen." },
        { q: "Vad ingår i massagebehandlingen?", a: "Massagen utförs med varm sesamolja och inkluderar huvud, ansikte, kropp fram och baksida samt fötter. Du torkas av med handduk efter behandlingen, men vi rekommenderar att du duschar ordentligt hemma efteråt, både hår och kropp." },
        { q: "Passar yoga för alla nivåer?", a: "Ja, yoga anpassas utifrån varje persons förmåga. Meddela gärna läraren om skador eller annat att ta hänsyn till när du kommer till klass. Annars utförs alla positioner utifrån din egen kropps förmåga och på dina villkor." },
      ],
    },
    weekSchedule: {
      behandlingarItems: [
        { day: "Torsdag", time: "18:30 & 21:15", type: "Ayurvedisk massage",        loc: "Birkagatan 23", id: "massage" },
        { day: "Torsdag", time: "18:30 & 21:15", type: "Ayurvedisk hälsorådgivning", loc: "Birkagatan 23", id: "radgivning" },
      ],
      klasserItems: [
        { day: "Torsdag", time: "20:00–21:00", type: "Yoga & Ayurveda klass", loc: "Birkagatan 23", href: "https://www.getmana.app/s/home-in-yoga/schedule" },
        { day: "Söndag",  time: "12:15–13:15", type: "Yin Yoga klass",        loc: "Birkagatan 23", href: "https://www.getmana.app/s/home-in-yoga/schedule" },
      ],
      bookLabel: "Boka",
      bookViaLabel: "Boka via studio",
      closeLabel: "Stäng",
      label: "Schema & bokning",
      title: "Veckans behandlingar och klasser",
      colBehandlingar: "Behandlingar",
      colKlasser: "Klasser",
      classTip: "Tips: Torsdagar finns också Yoga & Ayurveda klass kl 20:00–21:00. Passar bra att kombinera med en massage samma kväll.",
    },
    courses: {
      title: "Stadsretreat",
      soon: "Kommer snart",
      intro: "En helg i Stockholm där yoga och ayurveda varvas med teori, praktik och tid för reflektion. Lördag: dynamisk yoga, lättare brunch, föreläsning om ayurvedans grunder och doshorna samt en kort workshop. Dagen avslutas med mjuk yoga och journaling. Söndag: dynamisk yoga, brunch, föreläsning om dygnsrytm, mat och rutiner samt en kort workshop. Helgen avslutas med mjuk yoga och tid för integration. Allt på samma ställe, utan att lämna Stockholm.",
    },
    footer: { location: "Vasastan, Stockholm" },
  },

  en: {
    nav: { aboutMe: "About me", yoga: "Yoga", ayurveda: "Ayurveda", book: "Book" },
    hero: {
      eyebrow: "Yoga & Ayurveda · Stockholm · 2015",
      sub: "Welcome. Through yoga and ayurveda I offer tools to strengthen, recover and find balance in everyday life.",
      scrollLabel: "Scroll down",
    },
    about: {
      label: "About me",
      p1: "I am Jasmin, the person behind Health by Jasmin, a sole proprietorship based in Stockholm, Sweden. I have practised Ashtanga yoga and Ayurveda for almost 17 years. Yin yoga was added along the way. What first drew me to both yoga and ayurveda was the structure, the rhythm and the way both practices bring things into focus, sometimes gently, sometimes with force.",
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
      yinP1: "Yin yoga is a slow, still practice where poses are held for several minutes. It works deep into the connective tissue, ligaments and joints rather than the muscles, increasing flexibility and improving joint function. The practice has a calming effect on the nervous system and works well as a complement to more active forms of exercise.",
      yinSchedule: "60 min · Sundays · 12:15–13:15",
      yogaAyurvedaTitle: "Yoga & Ayurveda",
      yogaAyurvedaSub: "60 min · Thursdays · 20:00–21:00",
      yogaAyurvedaP1: "A class in two parts. We begin with ayurveda, a theme, a topic or a tip from the tradition. It might be about doshas, sleep, food, the body's daily rhythm or something else from the world of ayurveda.",
      yogaAyurvedaP2: "The second part is yoga with poses that benefit all doshas. The class moves through flow, standing and seated positions and ends with rest or meditation.",
    },
    ayurveda: {
      label: "Health & wellbeing",
      p1: "Ayurveda gives us knowledge and tools to strengthen and heal ourselves, both physically and mentally. It is a holistic approach to health with roots in India and over 6,000 years of tradition.",
      p2: "Ayurveda sees the whole person: body, mind and everything in between. If you have a headache, it is rarely just about your head; there is likely something else in the body or in life that is connected.",
      massageTitle: "Ayurvedic massage",
      massageP1: "One of the most beautiful parts of Ayurveda is the treatments, especially the massages. They are often warming and deeply soothing, using warm sesame oil. It is beneficial for all doshas: vata, pitta and kapha.",
      massageP2: "Ayurvedic massages are performed with warm sesame oil and for specific treatments warm water bags are used. We massage the head, face, front and back of the body including the feet.",
      radgivningTitle: "Ayurvedic consultation",
      radgivningP1: "An individual consultation where we read the pulse and look for qualities belonging to vata, pitta and kapha. Based on that, we talk about your wellbeing, your body and your life situation. You then receive personal advice and tips tailored to support any imbalances and adapted to you specifically. This may include routines, sleep, daily rhythm, food and much more.",
    },
    booking: {
      title: "Book",
      plats: "Location", dag: "Day", sondagar: "Sundays", torsdagar: "Thursday evenings", kvallstider: "Wed & Fri evenings",
      pausad: "Temporarily paused", ingenDusch: "Shower not available at this location", duschFinns: "Shower available",
      valjBehandling: "Choose treatment", valjDatum: "Choose date",
      andra: "Change", tillbaka: "Back",
      bekrafta: "Confirm booking", skickar: "Sending...", gorNyBokning: "Make a new booking",
      firstName: "First name", firstNamePh: "Your first name",
      lastName: "Last name", lastNamePh: "Your last name",
      email: "Email", emailPh: "your@email.com",
      phone: "Phone", phonePh: "07X XXX XX XX",
      betalning: "Payment", betalningTitle: "Swish or invoice", betalningDesc: "Payment via Swish or invoice. Invoice is available for those who want to use their wellness benefit (friskvårdsbidrag).",
      fullbooked: "Booked", duration: "55 min",
      confirmTitle: "Booking confirmed",
      confirmSub: (name) => `Thank you ${name}! Your booking is registered.`,
      confirmEmailNote: "A confirmation email has been sent to the email address you provided.",
      errorMsg: "Something went wrong. Contact healthbyjasmin@gmail.com",
      behandlingHint: "Choose a treatment above to continue.",
    },
    treatments: [
      { id: "abhyanga",       name: "Abhyanga",                      price: "750 kr", description: "Full-body massage with warm sesame oil using long, sweeping strokes. Brings warmth, grounding and presence. A way for body and mind to slow down and settle." },
      { id: "vishesh",        name: "Vishesh",                       price: "750 kr", description: "Full-body massage with warm sesame oil using long strokes with more pressure. Softens muscles, releases tension and brings lightness to the body. You leave lighter and clearer in body and mind." },
      { id: "halsradgivning", name: "Ayurvedic health consultation", price: "695 kr", description: "Individual consultation based on your ayurvedic constitution. We look at how you feel, your habits and daily life – and put together concrete advice on diet, routines and lifestyle tailored to you." },
    ],
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    days: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    quote: '"Movement is medicine for the body, stillness is medicine for the mind."',
    reviews: {
      label: "Reviews", title: "What our clients say",
      items: [
        { text: '"The ayurvedic massage was exactly what I needed. Deep relaxation and a truly professional treatment. I left with a feeling of complete recovery."', author: "Frida" },
        { text: '"The yin yoga class with Jasmin is one of the highlights of my weekly routine. Calm, inclusive and meaningful. I notice the difference in my body right after."', author: "Anna" },
        { text: '"Jasmin has a unique way of conveying both yoga and ayurveda."', author: "Juan" },
        { text: '"I had a wonderful, warm and soothing ayurvedic massage with Jasmin. In a calm, safe and cosy space. I will definitely treat myself to coming back again."', author: "Maria" },
      ],
      instagram: "Follow @healthbyjasmin",
    },
    faq: {
      label: "Frequently asked questions", title: "FAQ",
      items: [
        { q: "Where are classes and treatments held?", a: "All yoga classes are held in Vasastan at Birkagatan 23. Ayurvedic treatments are held Thursday evenings at Birkagatan 23 in Vasastan. See the booking section above for current times." },
        { q: "How do I book yoga?", a: "Yoga is booked via the link in the yoga section above." },
        { q: "How do I book an ayurvedic treatment?", a: "Treatments are booked via the form above. Choose your location, date and time directly on the page." },
        { q: "What is the cancellation policy?", a: "Treatments must be cancelled no later than 24 hours in advance. Email healthbyjasmin@gmail.com. For yoga classes, the studio's cancellation policy applies." },
        { q: "How is payment handled?", a: "Payment via Swish or invoice. Invoice is available for those who want to use their wellness benefit (friskvårdsbidrag)." },
        { q: "Will I be oily after the massage?", a: "Yes, the oil is an important part of the treatment. There is a shower on site with towel, shampoo and shower gel." },
        { q: "Which massage should I choose?", a: "Abhyanga uses long, sweeping strokes with warm sesame oil. It brings warmth, grounding and presence, an invitation for body and mind to slow down and settle. The feeling afterwards is gathered and calm. Vishesh uses more pressure in long, deeper strokes. It softens muscles, releases tension and brings lightness and ease to the body. You leave feeling free and mobile. Vishesh also includes the glutes and calves." },
        { q: "What should I bring to the massage?", a: "Bring or wear comfortable clothes and a change of clothes. Underwear is needed during the treatment." },
        { q: "What does the massage include?", a: "The massage is performed with warm sesame oil and includes the head, face, front and back of the body and feet. You are towelled off after the treatment, but we recommend showering thoroughly at home afterwards, both hair and body." },
        { q: "Is yoga suitable for all levels?", a: "Yes, yoga is adapted to each person's ability. Please let the teacher know about any injuries or other considerations when you arrive for class. All positions are otherwise performed based on your own body's capacity and on your own terms." },
      ],
    },
    weekSchedule: {
      behandlingarItems: [
        { day: "Thursday", time: "18:30 & 21:15", type: "Ayurvedic massage",            loc: "Birkagatan 23", id: "massage" },
        { day: "Thursday", time: "18:30 & 21:15", type: "Ayurvedic health consultation", loc: "Birkagatan 23", id: "radgivning" },
      ],
      klasserItems: [
        { day: "Thursday", time: "20:00–21:00", type: "Yoga & Ayurveda class", loc: "Birkagatan 23", href: "https://www.getmana.app/s/home-in-yoga/schedule" },
        { day: "Sunday",   time: "12:15–13:15", type: "Yin Yoga class",        loc: "Birkagatan 23", href: "https://www.getmana.app/s/home-in-yoga/schedule" },
      ],
      bookLabel: "Book",
      bookViaLabel: "Book via studio",
      closeLabel: "Close",
      label: "Schedule & booking",
      title: "This week's treatments and classes",
      colBehandlingar: "Treatments",
      colKlasser: "Classes",
      classTip: "Tip: There is also a Yoga & Ayurveda class on Thursdays at 20:00–21:00. A great way to combine with a massage the same evening.",
    },
    courses: {
      title: "City retreat",
      soon: "Coming soon",
      intro: "A weekend in Stockholm where yoga and ayurveda blend with theory, practice and time for reflection. Saturday: dynamic yoga, a light brunch, a talk on the foundations of ayurveda and the doshas, and a short workshop. The day ends with gentle yoga and journaling. Sunday: dynamic yoga, brunch, a talk on daily rhythm, food and routines, and a short workshop. The weekend closes with gentle yoga and time for integration. All in one place, without leaving Stockholm.",
    },
    footer: { location: "Vasastan, Stockholm" },
  },
};

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
        <li><a href="#om-mig" onClick={close}><EditableText path="nav.aboutMe" value={t.nav.aboutMe} /></a></li>
        <li><a href="#ayurveda" onClick={close}><EditableText path="nav.ayurveda" value={t.nav.ayurveda} /></a></li>
        <li><a href="#yoga" onClick={close}><EditableText path="nav.yoga" value={t.nav.yoga} /></a></li>
        <li><a href="#faq" onClick={close}>FAQ</a></li>
      </ul>
      <a href="#boka" className="nav-book-btn" onClick={close}>
        <EditableText path="nav.book" value={t.nav.book} />
      </a>
      <button className="lang-toggle" onClick={toggleLang} aria-label="Switch language">
        {lang === "sv" ? "EN" : "SV"}
      </button>
    </nav>
  );
}

// ── Booking ───────────────────────────────────────────────────────────────────

function Booking({ t, entries, address, slotPrefix, treatmentIds }) {
  const treatments = treatmentIds ? t.treatments.filter(tr => treatmentIds.includes(tr.id)) : t.treatments;
  const [dateIdx, setDateIdx] = useState(null);
  const [slot, setSlot] = useState(null);
  const [treatment, setTreatment] = useState(() => treatments.length === 1 ? treatments[0].id : null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [step, setStep] = useState("select");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [showAllDates, setShowAllDates] = useState(false);
  const formRef = useRef(null);
  const datesRef = useRef(null);
  const prevStep = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (step === "form" && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (step === "select" && prevStep.current === "form" && datesRef.current) {
      datesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    prevStep.current = step;
  }, [step]);

  useEffect(() => {
    supabase.from("bookings").select("slot_key").then(({ data }) => {
      if (data) setBookedSlots(data.map((r) => r.slot_key));
    });
  }, []);

  // Compute next 4 available slots for the "Nästa lediga" section
  const nextAvailable = (() => {
    const now = Date.now();
    const result = [];
    for (let i = 0; i < entries.length && result.length < 4; i++) {
      const { date, slots } = entries[i];
      if (date < today) continue;
      const slotTime = slots[0].t;
      const key = `${slotPrefix}-${i}-${slotTime}`;
      if (bookedSlots.includes(key)) continue;
      const slotDt = new Date(date);
      const [h, m] = slotTime.split(":").map(Number);
      slotDt.setHours(h, m, 0, 0);
      if (slotDt - now < 24 * 60 * 60 * 1000) continue;
      result.push({ i, date, slotTime });
    }
    return result;
  })();

  const currentStep = step === "form" ? 3 : treatment === null ? 1 : 2;

  const formValid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.includes("@") &&
    form.phone.trim().length >= 8 &&
    treatment !== null;

  function handleDate(i) {
    const s = entries[i].slots[0];
    const key = `${slotPrefix}-${i}-${s.t}`;
    const available = !bookedSlots.includes(key);
    setDateIdx(i);
    setSlot(available ? s : null);
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

  async function submit() {
    setSending(true);
    setSendError(false);
    const key = `${slotPrefix}-${dateIdx}-${slot.t}`;
    const d = entries[dateIdx].date;
    const dateStr = `${d.getDate()} ${SV_MONTHS[d.getMonth()]} 2026`;
    const timeStr = `${slot.t}–${slot.e}`;
    const fullName = `${form.firstName} ${form.lastName}`;
    const treatmentName = treatments.find((tr) => tr.id === treatment).name;

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
    setDateIdx(null); setSlot(null);
    setTreatment(treatments.length === 1 ? treatments[0].id : null);
    setForm({ firstName: "", lastName: "", email: "", phone: "" });
    setStep("select");
    setShowAllDates(false);
  }

  const selectedDate = dateIdx !== null ? entries[dateIdx].date : null;
  const b = t.booking;

  return (
    <div className="booking-wrap">

      {step !== "done" && (
        <>
          {/* ── Stegindikator ── */}
          <div className="booking-stepper">
            <div className={`bks-step${currentStep >= 1 ? " bks-active" : ""}${currentStep > 1 ? " bks-done" : ""}`}>
              <span className="bks-num">{currentStep > 1 ? "✓" : "1"}</span>
              <span className="bks-label">Behandling</span>
            </div>
            <div className="bks-line" />
            <div className={`bks-step${currentStep >= 2 ? " bks-active" : ""}${currentStep > 2 ? " bks-done" : ""}`}>
              <span className="bks-num">{currentStep > 2 ? "✓" : "2"}</span>
              <span className="bks-label">Välj tid</span>
            </div>
            <div className="bks-line" />
            <div className={`bks-step${currentStep >= 3 ? " bks-active" : ""}`}>
              <span className="bks-num">3</span>
              <span className="bks-label">Uppgifter</span>
            </div>
          </div>

          {/* ── Behandlingsval (bara om >1 behandling) ── */}
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
                    <span className="treatment-pick-desc">{tr.description}</span>
                  </button>
                ))}
              </div>
              {!treatment && <p className="booking-treatment-hint">{b.behandlingHint}</p>}
            </div>
          )}

          {/* ── Nästa lediga tider ── */}
          {step !== "form" && (
            <div className="booking-next-slots" ref={datesRef}>
              <p className="booking-row-label">Nästa lediga tider</p>
              {nextAvailable.length === 0
                ? <p className="booking-no-slots">Inga lediga tider just nu – hör av dig på Instagram eller mail.</p>
                : (
                  <div className="next-slot-row">
                    {nextAvailable.map(({ i, date, slotTime }) => (
                      <button
                        key={i}
                        className={`next-slot-btn${dateIdx === i ? " selected" : ""}${!treatment ? " no-treatment" : ""}`}
                        disabled={!treatment}
                        onClick={() => handleDate(i)}
                      >
                        <span className="nsb-day">{t.days[date.getDay()]}</span>
                        <span className="nsb-date">{date.getDate()} {t.months[date.getMonth()]}</span>
                        <span className="nsb-time">{slotTime}</span>
                      </button>
                    ))}
                  </div>
                )
              }
              <button className="booking-show-all" onClick={() => setShowAllDates(p => !p)}>
                {showAllDates ? "Dölj alla datum ↑" : "Visa alla datum ↓"}
              </button>
              {showAllDates && (
                <div className="dates-grid" style={{ marginTop: "1rem" }}>
                  {Array.from({ length: Math.ceil(entries.length / 2) }, (_, rowIdx) => {
                    const pair = entries.slice(rowIdx * 2, rowIdx * 2 + 2);
                    const date = pair[0].date;
                    const isPast = date < today;
                    return (
                      <div key={rowIdx} className="dates-grid-row">
                        <div className="dates-grid-label">
                          <span className="dgr-wd">{t.days[date.getDay()]}</span>
                          <span className="dgr-dd">{date.getDate()}</span>
                          <span className="dgr-mo">{t.months[date.getMonth()]}</span>
                        </div>
                        {pair.map(({ slots }, flatIdx) => {
                          const i = rowIdx * 2 + flatIdx;
                          const slotKey = `${slotPrefix}-${i}-${slots[0].t}`;
                          const isBooked = bookedSlots.includes(slotKey);
                          const slotDt = new Date(date);
                          const [h, m] = slots[0].t.split(":").map(Number);
                          slotDt.setHours(h, m, 0, 0);
                          const isTooSoon = slotDt - Date.now() < 24 * 60 * 60 * 1000;
                          const unavailable = isPast || isBooked || isTooSoon || !treatment;
                          return (
                            <button
                              key={i}
                              className={`dgr-slot${unavailable ? " disabled" : ""}${dateIdx === i ? " selected" : ""}`}
                              disabled={unavailable}
                              onClick={() => handleDate(i)}
                            >
                              <span className="dgr-time">{isBooked || isTooSoon ? b.fullbooked : slots[0].t}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Bokningsformulär ── */}
          {step === "form" && selectedDate && slot && (
            <div className="booking-form-wrap" ref={formRef}>
              <div className="booking-form-summary">
                <div>
                  <span className="booking-form-summary-label">
                    {treatments.find((tr) => tr.id === treatment)?.name} &middot; 55 min
                  </span>
                  <span className="booking-form-summary-value">
                    {selectedDate.getDate()} {t.months[selectedDate.getMonth()]} &middot; {slot.t}
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

      {/* ── Bekräftelse ── */}
      {step === "done" && selectedDate && slot && (
        <div className="booking-confirm">
          <div className="booking-confirm-icon">✓</div>
          <p className="booking-confirm-title">{b.confirmTitle}</p>
          <p className="booking-confirm-sub">{b.confirmSub(form.firstName)}</p>
          <p className="booking-confirm-email-note">{b.confirmEmailNote}</p>
          <button className="booking-btn-next" onClick={reset}>{b.gorNyBokning}</button>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HealthByJasmin() {
  const [lang, setLang] = useState("sv");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [radgivningOpen, setRadgivningOpen] = useState(false);

  // ── Admin state ──────────────────────────────────────────────────────────────
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("hbj_admin") === "1");
  const [textOverrides, setTextOverrides] = useState({ sv: {}, en: {} });
  const [imageOverrides, setImageOverrides] = useState({});
  const [fontOverrides, setFontOverrides] = useState({ heading: "", body: "" });
  const [slotsOverride, setSlotsOverride] = useState(null); // null = use TORSDAG_ENTRIES default
  const [slotsModalOpen, setSlotsModalOpen] = useState(false);
  const [editSlots, setEditSlots] = useState([]); // working copy inside modal
  const [scheduleOverride, setScheduleOverride] = useState(null); // {behandlingar:[...], klasser:[...]}
  const [treatmentsOverride, setTreatmentsOverride] = useState(null); // [...] or null
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editBehandlingar, setEditBehandlingar] = useState([]);
  const [editKlasser, setEditKlasser] = useState([]);
  const [editTreatments, setEditTreatments] = useState([]);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [adminError, setAdminError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const t = deepMerge(TRANSLATIONS[lang], textOverrides[lang] || {});

  const [heroImg, setHeroImg] = useState(0);
  const HERO_IMAGES = ["/assets/header.jpeg", "/assets/ayurveda.jpg", "/assets/ashtanga.jpeg"];

  const shelfRef = useRef(null);
  const bookingRef = useRef(null);
  const radgivningRef = useRef(null);
  const scheduleSectionRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (scheduleSectionRef.current && !scheduleSectionRef.current.contains(e.target)) {
        setBookingOpen(false);
        setRadgivningOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (bookingOpen && bookingRef.current) {
      bookingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [bookingOpen]);

  useEffect(() => {
    if (radgivningOpen && radgivningRef.current) {
      radgivningRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [radgivningOpen]);

  function scrollShelf(dir) {
    const el = shelfRef.current;
    if (!el) return;
    const card = el.querySelector(".testimonial-card");
    const cardW = card ? card.offsetWidth + 20 : 300;
    el.scrollBy({ left: dir * cardW, behavior: "smooth" });
  }

  useEffect(() => {
    const els = document.querySelectorAll(".fade-up");
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lang]);

  // ── Admin: apply a content snapshot to all state ────────────────────────────
  function applyContent(c) {
    if (!c) return;
    if (c.textOverrides) setTextOverrides(c.textOverrides);
    if (c.imageOverrides) setImageOverrides(c.imageOverrides);
    if (c.fontOverrides) { setFontOverrides(c.fontOverrides); applyFonts(c.fontOverrides); }
    if (c.slotsOverride) setSlotsOverride(c.slotsOverride);
    if (c.scheduleOverride) setScheduleOverride(c.scheduleOverride);
    if (c.treatmentsOverride) setTreatmentsOverride(c.treatmentsOverride);
  }

  // ── Admin: build content snapshot from current state ─────────────────────────
  function buildSnapshot(overrides = {}) {
    return {
      textOverrides:     overrides.textOverrides     ?? textOverrides,
      imageOverrides:    overrides.imageOverrides    ?? imageOverrides,
      fontOverrides:     overrides.fontOverrides     ?? fontOverrides,
      slotsOverride:     overrides.slotsOverride     !== undefined ? overrides.slotsOverride     : slotsOverride,
      scheduleOverride:  overrides.scheduleOverride  !== undefined ? overrides.scheduleOverride  : scheduleOverride,
      treatmentsOverride:overrides.treatmentsOverride!== undefined ? overrides.treatmentsOverride: treatmentsOverride,
    };
  }

  // ── Admin: save to Supabase ───────────────────────────────────────────────────
  async function saveToSupabase(snap) {
    const { error } = await supabase.from("site_content").upsert({
      id: "main",
      sv_text:             snap.textOverrides?.sv || {},
      en_text:             snap.textOverrides?.en || {},
      images:              snap.imageOverrides || {},
      fonts:               snap.fontOverrides || {},
      slots:               snap.slotsOverride || [],
      schedule:            snap.scheduleOverride || {},
      treatments_override: snap.treatmentsOverride || [],
    });
    return error;
  }

  // ── Admin: load – localStorage first (instant), then Supabase (authoritative)
  useEffect(() => {
    const local = loadLocalContent();
    if (local) applyContent(local);

    supabase.from("site_content").select("*").eq("id", "main").single().then(({ data }) => {
      if (!data) return;
      const fromDb = {
        textOverrides:      { sv: data.sv_text || {}, en: data.en_text || {} },
        imageOverrides:     data.images || {},
        fontOverrides:      data.fonts  || { heading: "", body: "" },
        slotsOverride:      data.slots?.length > 0 ? data.slots : null,
        scheduleOverride:   data.schedule && Object.keys(data.schedule).length > 0 ? data.schedule : null,
        treatmentsOverride: data.treatments_override?.length > 0 ? data.treatments_override : null,
      };
      applyContent(fromDb);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Admin: auto-save to localStorage on every change ─────────────────────────
  useEffect(() => {
    persistLocal(buildSnapshot());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textOverrides, imageOverrides, fontOverrides, slotsOverride, scheduleOverride, treatmentsOverride]);

  // ── Hero slideshow ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (imageOverrides.header) return; // don't cycle if admin set a custom image
    const id = setInterval(() => setHeroImg(i => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(id);
  }, [imageOverrides.header]);

  // ── Admin: warn before leaving with unsaved Supabase changes ─────────────────
  useEffect(() => {
    if (!hasUnsaved) return;
    const handler = e => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsaved]);

  // Convert flat slot rows [{dateStr,time}] → Booking entries [{date,slots}]
  function slotsToEntries(rows) {
    return rows.map(r => {
      const [y, m, d] = r.dateStr.split("-").map(Number);
      return { date: new Date(y, m - 1, d), slots: [{ t: r.time, e: "" }] };
    }).sort((a, b) => a.date - b.date || a.slots[0].t.localeCompare(b.slots[0].t));
  }

  const activeEntries = slotsOverride ? slotsToEntries(slotsOverride) : TORSDAG_ENTRIES;

  function imgSrc(key, fallback) { return imageOverrides[key] || fallback; }

  function handleEdit(path, value) {
    setTextOverrides(prev => {
      const lo = JSON.parse(JSON.stringify(prev[lang] || {}));
      setNestedValue(lo, path, value);
      return { ...prev, [lang]: lo };
    });
    setHasUnsaved(true);
  }

  async function handleImageUpload(imgKey, file) {
    const ext = file.name.split(".").pop();
    const path = `${imgKey}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
    if (upErr) { console.error(upErr); return; }
    const { data: urlData } = supabase.storage.from("site-images").getPublicUrl(path);
    const newImages = { ...imageOverrides, [imgKey]: urlData.publicUrl };
    setImageOverrides(newImages);
    // Immediately persist the new image URL to Supabase
    saveToSupabase(buildSnapshot({ imageOverrides: newImages }));
    setHasUnsaved(false);
  }

  function handleFontChange(type, name) {
    const updated = { ...fontOverrides, [type]: name };
    setFontOverrides(updated);
    applyFonts(updated);
    setHasUnsaved(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    const err = await saveToSupabase(buildSnapshot());
    setSaving(false);
    if (err) {
      setSaveError(true);
      console.error("Supabase save error:", err);
    } else {
      setHasUnsaved(false);
      setSaveError(false);
    }
  }

  function openSlotsModal() {
    const rows = slotsOverride
      ? [...slotsOverride]
      : TORSDAG_ENTRIES.map(e => ({
          dateStr: `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}-${String(e.date.getDate()).padStart(2, "0")}`,
          time: e.slots[0].t,
        }));
    setEditSlots(rows);
    setSlotsModalOpen(true);
  }

  function saveSlots() {
    const sorted = [...editSlots].sort((a, b) => a.dateStr.localeCompare(b.dateStr) || a.time.localeCompare(b.time));
    setSlotsOverride(sorted);
    setSlotsModalOpen(false);
    setHasUnsaved(false);
    saveToSupabase(buildSnapshot({ slotsOverride: sorted }));
  }

  function openScheduleModal() {
    setEditBehandlingar(scheduleOverride?.behandlingar
      ? [...scheduleOverride.behandlingar]
      : t.weekSchedule.behandlingarItems.map(r => ({ ...r })));
    setEditKlasser(scheduleOverride?.klasser
      ? [...scheduleOverride.klasser]
      : t.weekSchedule.klasserItems.map(r => ({ ...r })));
    setEditTreatments(treatmentsOverride
      ? [...treatmentsOverride]
      : (t.treatments || []).map(r => ({ ...r })));
    setScheduleModalOpen(true);
  }

  function saveSchedule() {
    const newSchedule = { behandlingar: editBehandlingar, klasser: editKlasser };
    setScheduleOverride(newSchedule);
    setTreatmentsOverride(editTreatments);
    setScheduleModalOpen(false);
    setHasUnsaved(false);
    saveToSupabase(buildSnapshot({ scheduleOverride: newSchedule, treatmentsOverride: editTreatments }));
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    const hash = await hashPassword(adminPwd);
    if (hash === ADMIN_HASH) {
      setIsAdmin(true); localStorage.setItem("hbj_admin", "1");
      setAdminLoginOpen(false); setAdminPwd(""); setAdminError(false);
    } else { setAdminError(true); }
  }

  function handleAdminLogout() {
    setIsAdmin(false); localStorage.removeItem("hbj_admin"); setHasUnsaved(false);
  }

  const adminCtxValue = { isAdmin, onEdit: handleEdit, onImageUpload: handleImageUpload };

  return (
    <AdminCtx.Provider value={adminCtxValue}>
      <header className="site-header">
        <Navbar t={t} lang={lang} setLang={setLang} />
      </header>

      <main>
        {/* Hero */}
        <section id="top" className="page-hero">
          {/* Slideshow layers */}
          {imageOverrides.header
            ? <div className="hero-slide hero-slide-active" style={{ backgroundImage: `url(${imageOverrides.header})` }} />
            : HERO_IMAGES.map((src, i) => (
                <div key={src} className={`hero-slide${heroImg === i ? " hero-slide-active" : ""}`} style={{ backgroundImage: `url(${src})` }} />
              ))
          }
          {isAdmin && (
            <label className="admin-hero-img-btn" title="Byt bakgrundsbild">
              Byt bakgrundsbild
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) handleImageUpload("header", e.target.files[0]); }} />
            </label>
          )}
          <div className="page-hero-inner">
            <EditableText path="hero.eyebrow" value={t.hero.eyebrow} tag="span" className="hero-eyebrow" />
            <h1 className="hero-title">Health by Jasmin</h1>
            <EditableText path="hero.sub" value={t.hero.sub} tag="p" className="hero-sub" />
            <a href="#om-mig" className="hero-scroll-arrow" aria-label={t.hero.scrollLabel}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </a>
          </div>
        </section>

        {/* Servicekort */}
        {/* Om mig */}
        <section id="om-mig" className="content-section about-bg">
          <div className="section-inner">
            <div className="about-split fade-up">
              <div className="about-split-head">
                <span className="section-label">{t.about.label}</span>
                <h2>Jasmin<br />Hedlund</h2>
              </div>
              <div className="about-split-body">
                <EditableText path="about.p1" value={t.about.p1} tag="p" />
                <EditableText path="about.p2" value={t.about.p2} tag="p" />
                <EditableText path="about.p3" value={t.about.p3} tag="p" />
              </div>
            </div>
          </div>
        </section>

        {/* Ayurveda */}
        <section className="checkerboard-section" id="ayurveda">
          {/* Rad 1: Ayurveda bild | Ayurveda text */}
          <div className="cb-cell cb-img">
            <EditableImage imgKey="ayurveda" src={imgSrc("ayurveda", "/assets/ayurveda.jpg")} alt="Ayurvediska örter och oljor" className="cb-img-fill" wrapStyle={{ height: "100%", display: "block" }} />
          </div>
          <div className="cb-cell cb-text fade-up">
            <EditableText path="ayurveda.label" value={t.ayurveda.label} tag="span" className="section-label" />
            <h2>Ayurveda</h2>
            <EditableText path="ayurveda.p1" value={t.ayurveda.p1} tag="p" />
            <EditableText path="ayurveda.p2" value={t.ayurveda.p2} tag="p" />
            <EditableText path="ayurveda.massageTitle" value={t.ayurveda.massageTitle} tag="h3" />
            <EditableText path="ayurveda.massageP1" value={t.ayurveda.massageP1} tag="p" />
            <EditableText path="ayurveda.massageP2" value={t.ayurveda.massageP2} tag="p" />
            <EditableText path="ayurveda.radgivningTitle" value={t.ayurveda.radgivningTitle} tag="h3" />
            <EditableText path="ayurveda.radgivningP1" value={t.ayurveda.radgivningP1} tag="p" />
          </div>

          {/* Rad 2: Yoga text | Yoga bild */}
          <div className="cb-cell cb-text cb-text-alt fade-up" id="yoga">
            <EditableText path="yoga.label" value={t.yoga.label} tag="span" className="section-label" />
            <h2>Yoga</h2>
            <EditableText path="yoga.intro" value={t.yoga.intro} tag="p" className="yoga-intro" />
            <EditableText path="yoga.yinTitle" value={t.yoga.yinTitle} tag="h3" />
            <EditableText path="yoga.yinP1" value={t.yoga.yinP1} tag="p" />
            <EditableText path="yoga.yinSchedule" value={t.yoga.yinSchedule} tag="span" className="yoga-col-schedule" />
            <EditableText path="yoga.yogaAyurvedaTitle" value={t.yoga.yogaAyurvedaTitle} tag="h3" />
            <EditableText path="yoga.yogaAyurvedaP1" value={t.yoga.yogaAyurvedaP1} tag="p" />
            <EditableText path="yoga.yogaAyurvedaP2" value={t.yoga.yogaAyurvedaP2} tag="p" />
            <EditableText path="yoga.yogaAyurvedaSub" value={t.yoga.yogaAyurvedaSub} tag="span" className="yoga-col-schedule" />
            <EditableText path="yoga.ashtangaTitle" value={t.yoga.ashtangaTitle} tag="h3" />
            <EditableText path="yoga.ashtangaP1" value={t.yoga.ashtangaP1} tag="p" />
            <EditableText path="yoga.ashtangaP2" value={t.yoga.ashtangaP2} tag="p" />
            <EditableText path="yoga.ashtangaSoon" value={t.yoga.ashtangaSoon} tag="span" className="yoga-coming-soon" />
          </div>
          <div className="cb-cell cb-img">
            <EditableImage imgKey="ashtanga" src={imgSrc("ashtanga", "/assets/ashtanga.jpeg")} alt="Yoga" className="cb-img-fill" wrapStyle={{ height: "100%", display: "block" }} />
          </div>
        </section>

        {/* Veckoschema + bokning */}
        <section className="week-schedule-section" id="boka" ref={scheduleSectionRef}>
          <div className="section-inner">
            <EditableText path="weekSchedule.label" value={t.weekSchedule.label} tag="span" className="section-label" />
            <EditableText path="weekSchedule.title" value={t.weekSchedule.title} tag="h2" className="week-schedule-title" />
            <div className="wsr-columns">
              <div className="wsr-col">
                <EditableText path="weekSchedule.colBehandlingar" value={t.weekSchedule.colBehandlingar} tag="p" className="wsr-col-label" />
                <div className="week-schedule-rows">
                  {(scheduleOverride?.behandlingar || t.weekSchedule.behandlingarItems).map((row) => {
                    const isOpen = row.id === "massage" ? bookingOpen : radgivningOpen;
                    const toggle = row.id === "massage"
                      ? () => { setBookingOpen(o => !o); setRadgivningOpen(false); }
                      : () => { setRadgivningOpen(o => !o); setBookingOpen(false); };
                    const price = row.id === "massage" ? "750 kr" : row.id === "radgivning" ? "695 kr" : "";
                    return (
                      <button
                        key={row.id}
                        className={`week-schedule-row${isOpen ? " wsr-active" : ""}`}
                        onClick={toggle}
                      >
                        <span className="wsr-day">{row.day}</span>
                        <span className="wsr-time">{row.time}</span>
                        <span className="wsr-info">
                          <span className="wsr-type">{row.type}</span>
                          <span className="wsr-loc">{row.loc}</span>
                        </span>
                        {price && <span className="wsr-price">{price}</span>}
                        <span className="wsr-btn">
                          {isOpen ? t.weekSchedule.closeLabel : t.weekSchedule.bookLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="wsr-col">
                <EditableText path="weekSchedule.colKlasser" value={t.weekSchedule.colKlasser} tag="p" className="wsr-col-label" />
                <div className="week-schedule-rows">
                  {(scheduleOverride?.klasser || t.weekSchedule.klasserItems).map((row, i) => (
                    <a
                      key={i}
                      href={row.href}
                      className="week-schedule-row"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="wsr-day">{row.day}</span>
                      <span className="wsr-time">{row.time}</span>
                      <span className="wsr-info">
                        <span className="wsr-type">{row.type}</span>
                        <span className="wsr-loc">{row.loc}</span>
                      </span>
                      <span className="wsr-btn">{t.weekSchedule.bookViaLabel}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <EditableText path="weekSchedule.classTip" value={t.weekSchedule.classTip} tag="p" className="wsr-class-tip" />
            {bookingOpen && (
              <div className="week-schedule-booking" ref={bookingRef}>
                <Booking
                  t={treatmentsOverride ? { ...t, treatments: treatmentsOverride } : t}
                  entries={activeEntries}
                  address={(scheduleOverride?.behandlingar?.[0]?.loc || "Birkagatan 23") + ", Stockholm"}
                  slotPrefix="birka-massage"
                  treatmentIds={["abhyanga", "vishesh"]}
                />
              </div>
            )}
            {radgivningOpen && (
              <div className="week-schedule-booking" ref={radgivningRef}>
                <Booking
                  t={treatmentsOverride ? { ...t, treatments: treatmentsOverride } : t}
                  entries={activeEntries}
                  address={(scheduleOverride?.behandlingar?.[0]?.loc || "Birkagatan 23") + ", Stockholm"}
                  slotPrefix="birka-massage"
                  treatmentIds={["halsradgivning"]}
                />
              </div>
            )}
          </div>
        </section>


        {/* Kurser */}
        <section className="retreat-section">
          <article className="retreat">
            <EditableImage imgKey="retreat" src={imgSrc("retreat", "/assets/retreat.jpg")} alt="Stadsretreat" />
            <h2>{t.courses.title}</h2>
            <EditableText path="courses.intro" value={t.courses.intro} tag="p" className="retreat-intro" />
            <span>{t.courses.soon}</span>
          </article>
        </section>

        {/* Quote */}
        <section className="quote-section">
          <EditableText path="quote" value={t.quote} tag="p" />
        </section>

        {/* Recensioner */}
        <section className="testimonials-section">
          <div className="section-inner">
            <span className="section-label">{t.reviews.label}</span>
            <h2>{t.reviews.title}</h2>
            <div className="testimonials-shelf-wrap">
              <button className="shelf-arrow shelf-arrow-prev" onClick={() => scrollShelf(-1)} aria-label="Föregående">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polyline points="15 18 9 12 15 6" /></svg>
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
              <button className="shelf-arrow shelf-arrow-next" onClick={() => scrollShelf(1)} aria-label="Nästa">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
            <div className="instagram-cta">
              <a href="https://www.instagram.com/healthbyjasmin/" target="_blank" rel="noopener noreferrer" className="instagram-qr-wrap" aria-label="Instagram @healthbyjasmin">
                <QRCodeSVG value="https://www.instagram.com/healthbyjasmin/" size={96} fgColor="#4a6b7c" bgColor="transparent" />
                <span className="instagram-qr-label">Instagram</span>
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="content-section faq-section">
          <div className="section-inner">
            <span className="section-label">{t.faq.label}</span>
            <h2>{t.faq.title}</h2>
            <div className="faq-grid fade-up">
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
        <EditableText path="footer.location" value={t.footer.location} tag="p" />
        <p><a href="mailto:healthbyjasmin@gmail.com">healthbyjasmin@gmail.com</a></p>
        <button className="admin-lock-btn" onClick={() => isAdmin ? handleAdminLogout() : setAdminLoginOpen(true)} title={isAdmin ? "Logga ut admin" : "Admin"}>
          {isAdmin ? "🔓" : "🔒"}
        </button>
      </footer>

      {/* Admin: inloggningsmodal */}
      {adminLoginOpen && (
        <div className="admin-login-modal" onClick={e => { if (e.target === e.currentTarget) setAdminLoginOpen(false); }}>
          <form className="admin-login-box" onSubmit={handleAdminLogin}>
            <h3>Admin</h3>
            <input className="admin-login-input" type="password" placeholder="Lösenord" value={adminPwd} onChange={e => setAdminPwd(e.target.value)} autoFocus />
            {adminError && <p className="admin-login-error">Fel lösenord.</p>}
            <button className="admin-login-btn" type="submit">Logga in</button>
          </form>
        </div>
      )}

      {/* Admin: verktygsfält */}
      {isAdmin && (
        <div className="admin-bar">
          <div className="admin-font-row">
            <span className="admin-font-label">Rubrikfont</span>
            <select className="admin-font-select" value={fontOverrides.heading} onChange={e => handleFontChange("heading", e.target.value)}>
              <option value="">Standard</option>
              {HEADING_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <span className="admin-font-label">Brödtextfont</span>
            <select className="admin-font-select" value={fontOverrides.body} onChange={e => handleFontChange("body", e.target.value)}>
              <option value="">Standard</option>
              {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <span className="admin-font-label" style={{ marginLeft: 8 }}>Klicka på text för att redigera · Klicka på bild för att byta</span>
          </div>
          <div className="admin-bar-right">
            <button className="admin-slots-btn" onClick={openSlotsModal}>Redigera tider</button>
            <button className="admin-slots-btn" onClick={openScheduleModal}>Schema &amp; Behandlingar</button>
            <button className="admin-save-btn" onClick={handleSave} disabled={saving} style={saveError ? { background: "#c00" } : {}}>
              {saving ? "Sparar…" : saveError ? "Fel – försök igen" : hasUnsaved ? "Spara ändringar ●" : "Sparat ✓"}
            </button>
            <button className="admin-logout-btn" onClick={handleAdminLogout}>Logga ut</button>
          </div>
        </div>
      )}
      {/* Admin: schema & behandlingar modal */}
      {scheduleModalOpen && (
        <div className="admin-login-modal" onClick={e => { if (e.target === e.currentTarget) setScheduleModalOpen(false); }}>
          <div className="admin-slots-box" style={{ width: "min(680px,96vw)" }}>
            <h3>Schema &amp; Behandlingar</h3>

            <p className="admin-slots-hint" style={{ fontWeight: 600, color: "#333", marginBottom: 0 }}>Behandlingsrader (massage &amp; rådgivning)</p>
            <div className="admin-slots-list">
              <div className="admin-slots-header" style={{ gridTemplateColumns: "80px 110px 1fr 1fr 32px" }}>
                <span>Dag</span><span>Tid</span><span>Typ</span><span>Lokal</span><span></span>
              </div>
              {editBehandlingar.map((row, i) => (
                <div key={i} className="admin-slots-row" style={{ gridTemplateColumns: "80px 110px 1fr 1fr 32px" }}>
                  <input className="admin-slots-input" value={row.day} onChange={e => setEditBehandlingar(p => p.map((r,j)=>j===i?{...r,day:e.target.value}:r))} placeholder="Dag" />
                  <input className="admin-slots-input" value={row.time} onChange={e => setEditBehandlingar(p => p.map((r,j)=>j===i?{...r,time:e.target.value}:r))} placeholder="Tid" />
                  <input className="admin-slots-input" value={row.type} onChange={e => setEditBehandlingar(p => p.map((r,j)=>j===i?{...r,type:e.target.value}:r))} placeholder="Typ" />
                  <input className="admin-slots-input" value={row.loc} onChange={e => setEditBehandlingar(p => p.map((r,j)=>j===i?{...r,loc:e.target.value}:r))} placeholder="Lokal" />
                  <button className="admin-slots-del" onClick={() => setEditBehandlingar(p => p.filter((_,j)=>j!==i))}>×</button>
                </div>
              ))}
              <button className="admin-slots-add" onClick={() => setEditBehandlingar(p => [...p, { day: "Torsdag", time: "18:30", type: "", loc: "", id: `behandling-${Date.now()}` }])}>+ Lägg till behandlingsrad</button>
            </div>

            <p className="admin-slots-hint" style={{ fontWeight: 600, color: "#333", marginBottom: 0, marginTop: 8 }}>Yogaklasser</p>
            <div className="admin-slots-list">
              <div className="admin-slots-header" style={{ gridTemplateColumns: "80px 110px 1fr 1fr 1fr 32px" }}>
                <span>Dag</span><span>Tid</span><span>Typ</span><span>Studio</span><span>Länk</span><span></span>
              </div>
              {editKlasser.map((row, i) => (
                <div key={i} className="admin-slots-row" style={{ gridTemplateColumns: "80px 110px 1fr 1fr 1fr 32px" }}>
                  <input className="admin-slots-input" value={row.day} onChange={e => setEditKlasser(p => p.map((r,j)=>j===i?{...r,day:e.target.value}:r))} placeholder="Dag" />
                  <input className="admin-slots-input" value={row.time} onChange={e => setEditKlasser(p => p.map((r,j)=>j===i?{...r,time:e.target.value}:r))} placeholder="Tid" />
                  <input className="admin-slots-input" value={row.type} onChange={e => setEditKlasser(p => p.map((r,j)=>j===i?{...r,type:e.target.value}:r))} placeholder="Typ" />
                  <input className="admin-slots-input" value={row.loc} onChange={e => setEditKlasser(p => p.map((r,j)=>j===i?{...r,loc:e.target.value}:r))} placeholder="Studio" />
                  <input className="admin-slots-input" value={row.href} onChange={e => setEditKlasser(p => p.map((r,j)=>j===i?{...r,href:e.target.value}:r))} placeholder="https://..." />
                  <button className="admin-slots-del" onClick={() => setEditKlasser(p => p.filter((_,j)=>j!==i))}>×</button>
                </div>
              ))}
              <button className="admin-slots-add" onClick={() => setEditKlasser(p => [...p, { day: "", time: "", type: "", loc: "", href: "" }])}>+ Lägg till klass</button>
            </div>

            <p className="admin-slots-hint" style={{ fontWeight: 600, color: "#333", marginBottom: 0, marginTop: 8 }}>Behandlingar (priser &amp; beskrivningar)</p>
            <div className="admin-slots-list">
              {editTreatments.map((tr, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px 32px", gap: 6, marginBottom: 4 }}>
                  <input className="admin-slots-input" value={tr.name} onChange={e => setEditTreatments(p => p.map((r,j)=>j===i?{...r,name:e.target.value}:r))} placeholder="Namn" />
                  <input className="admin-slots-input" value={tr.price} onChange={e => setEditTreatments(p => p.map((r,j)=>j===i?{...r,price:e.target.value}:r))} placeholder="Pris" />
                  <button className="admin-slots-del" onClick={() => setEditTreatments(p => p.filter((_,j)=>j!==i))}>×</button>
                  <textarea className="admin-slots-input" style={{ gridColumn: "1/3", resize: "vertical", minHeight: 48 }} value={tr.description} onChange={e => setEditTreatments(p => p.map((r,j)=>j===i?{...r,description:e.target.value}:r))} placeholder="Beskrivning" />
                </div>
              ))}
              <button className="admin-slots-add" onClick={() => setEditTreatments(p => [...p, { id: `t-${Date.now()}`, name: "", price: "", description: "" }])}>+ Lägg till behandling</button>
            </div>

            <div className="admin-slots-actions">
              <button className="admin-logout-btn" onClick={() => setScheduleModalOpen(false)}>Avbryt</button>
              <button className="admin-save-btn" onClick={saveSchedule}>Spara schema</button>
            </div>
          </div>
        </div>
      )}

      {/* Admin: tider/datum modal */}
      {slotsModalOpen && (
        <div className="admin-login-modal" onClick={e => { if (e.target === e.currentTarget) setSlotsModalOpen(false); }}>
          <div className="admin-slots-box">
            <h3>Redigera tider &amp; datum</h3>
            <p className="admin-slots-hint">Lägg till eller ta bort datum och tider för ayurvedisk massage och hälsorådgivning.</p>
            <div className="admin-slots-list">
              <div className="admin-slots-header">
                <span>Datum (ÅÅÅÅ-MM-DD)</span>
                <span>Tid (TT:MM)</span>
                <span></span>
              </div>
              {editSlots.map((row, i) => (
                <div key={i} className="admin-slots-row">
                  <input
                    className="admin-slots-input"
                    type="date"
                    value={row.dateStr}
                    onChange={e => setEditSlots(prev => prev.map((r, j) => j === i ? { ...r, dateStr: e.target.value } : r))}
                  />
                  <input
                    className="admin-slots-input admin-slots-time"
                    type="time"
                    value={row.time}
                    onChange={e => setEditSlots(prev => prev.map((r, j) => j === i ? { ...r, time: e.target.value } : r))}
                  />
                  <button className="admin-slots-del" onClick={() => setEditSlots(prev => prev.filter((_, j) => j !== i))} title="Ta bort">×</button>
                </div>
              ))}
            </div>
            <button className="admin-slots-add" onClick={() => setEditSlots(prev => [...prev, { dateStr: "", time: "18:30" }])}>+ Lägg till tid</button>
            <div className="admin-slots-actions">
              <button className="admin-logout-btn" onClick={() => setSlotsModalOpen(false)}>Avbryt</button>
              <button className="admin-save-btn" onClick={saveSlots}>Spara tider</button>
            </div>
          </div>
        </div>
      )}
    </AdminCtx.Provider>
  );
}
