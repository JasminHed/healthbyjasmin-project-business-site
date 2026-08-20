import emailjs from "@emailjs/browser";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

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
      fullbooked: "Bokad", duration: "55 min", pris: "750 kr", rowPris: "Pris",
      confirmTitle: "Bokning bekräftad",
      confirmSub: (name) => `Tack ${name}! Din bokning är registrerad.`,
      confirmEmailNote: "Du har fått ett bekräftelsemejl till den e-postadress du angav i bokningen.",
      errorMsg: "Något gick fel. Kontakta healthbyjasmin@gmail.com",
      behandlingHint: "Välj en behandling ovan för att gå vidare.",
    },
    treatments: [
      { id: "abhyanga", name: "Abhyanga", description: "Helkroppsmassage med varm sesamolja i långa, svepande rörelser. Ger värme, grundning och närvaro. Ett sätt för kropp och sinne att sakta ned och landa." },
      { id: "vishesh",  name: "Vishesh",  description: "Helkroppsmassage med varm sesamolja i långa drag med mer tryck. Mjukar upp muskler, frigör spänningar och ger kroppen lätthet. Du lämnar lättare och klarare i kropp och sinne." },
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
      items: [
        { day: "Torsdag", time: "18:30–19:25", type: "Ayurvedisk massage",       loc: "Birkagatan 23", booking: true },
        { day: "Torsdag", time: "21:15–22:10", type: "Ayurvedisk massage",       loc: "Birkagatan 23", booking: true },
        { day: "Torsdag", time: "20:00–21:00", type: "Yoga & Ayurveda klass",   loc: "Birkagatan 23", href: "https://www.getmana.app/s/home-in-yoga/schedule" },
        { day: "Söndag",  time: "12:15–13:15", type: "Yin Yoga klass",           loc: "Birkagatan 23", href: "https://www.getmana.app/s/home-in-yoga/schedule" },
      ],
      bookLabel: "Boka",
      bookViaLabel: "Boka via studio",
      closeLabel: "Stäng",
      label: "Schema & bokning",
      title: "Veckans behandlingar och klasser",
      colMassage: "Behandlingar",
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
      fullbooked: "Booked", duration: "55 min", pris: "750 kr", rowPris: "Price",
      confirmTitle: "Booking confirmed",
      confirmSub: (name) => `Thank you ${name}! Your booking is registered.`,
      confirmEmailNote: "A confirmation email has been sent to the email address you provided.",
      errorMsg: "Something went wrong. Contact healthbyjasmin@gmail.com",
      behandlingHint: "Choose a treatment above to continue.",
    },
    treatments: [
      { id: "abhyanga", name: "Abhyanga", description: "Full-body massage with warm sesame oil using long, sweeping strokes. Brings warmth, grounding and presence. A way for body and mind to slow down and settle." },
      { id: "vishesh",  name: "Vishesh",  description: "Full-body massage with warm sesame oil using long strokes with more pressure. Softens muscles, releases tension and brings lightness to the body. You leave lighter and clearer in body and mind." },
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
      items: [
        { day: "Thursday", time: "18:30–19:25", type: "Ayurvedic massage",       loc: "Birkagatan 23", booking: true },
        { day: "Thursday", time: "21:15–22:10", type: "Ayurvedic massage",       loc: "Birkagatan 23", booking: true },
        { day: "Thursday", time: "20:00–21:00", type: "Yoga & Ayurveda class",  loc: "Birkagatan 23", href: "https://www.getmana.app/s/home-in-yoga/schedule" },
        { day: "Sunday",   time: "12:15–13:15", type: "Yin Yoga class",          loc: "Birkagatan 23", href: "https://www.getmana.app/s/home-in-yoga/schedule" },
      ],
      bookLabel: "Book",
      bookViaLabel: "Book via studio",
      closeLabel: "Close",
      label: "Schedule & booking",
      title: "This week's treatments and classes",
      colMassage: "Treatments",
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
        <li><a href="#om-mig" onClick={close}>{t.nav.aboutMe}</a></li>
        <li><a href="#ayurveda" onClick={close}>{t.nav.ayurveda}</a></li>
        <li><a href="#yoga" onClick={close}>{t.nav.yoga}</a></li>
        <li><a href="#boka" onClick={close}>{t.nav.book}</a></li>
      </ul>
      <button className="lang-toggle" onClick={toggleLang} aria-label="Switch language">
        {lang === "sv" ? "EN" : "SV"}
      </button>
    </nav>
  );
}

// ── Booking ───────────────────────────────────────────────────────────────────

function Booking({ t, entries, address, slotPrefix }) {
  const [dateIdx, setDateIdx] = useState(null);
  const [slot, setSlot] = useState(null);
  const [treatment, setTreatment] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [step, setStep] = useState("select");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
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
    const s = entries[i].slots[0];
    const key = `${slotPrefix}-${i}-${s.t}`;
    const available = !bookedSlots.includes(key);
    setDateIdx(i);
    setSlot(available ? s : null);
    if (available && treatment !== null) setStep("form");
    else if (step === "form") setStep("select");
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

  const selectedDate = dateIdx !== null ? entries[dateIdx].date : null;
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
                  onClick={() => {
                    setTreatment(tr.id);
                    if (dateIdx !== null && slot !== null) setStep("form");
                  }}
                >
                  <span className="treatment-pick-name">{tr.name}</span>
                  <span className="treatment-pick-desc">{tr.description}</span>
                  <span className="treatment-pick-price">{b.pris}</span>
                </button>
              ))}
            </div>
            {dateIdx !== null && step === "select" && !treatment && (
              <p className="booking-treatment-hint">{b.behandlingHint}</p>
            )}
          </div>

          {/* Datumväljare */}
          <div className="booking-dates" ref={datesRef}>
            <p className="booking-row-label">{b.valjDatum}</p>
            <div className="dates-grid">
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
                      const unavailable = isPast || isBooked || isTooSoon;
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
          </div>

          {/* Bokningsformulär */}
          {step === "form" && selectedDate && slot && (
            <div className="booking-form-wrap" ref={formRef}>
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
  const t = TRANSLATIONS[lang];
  const shelfRef = useRef(null);
  const bookingRef = useRef(null);

  useEffect(() => {
    if (bookingOpen && bookingRef.current) {
      bookingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [bookingOpen]);

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

  return (
    <>
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
        {/* Om mig */}
        <section id="om-mig" className="content-section about-bg">
          <div className="section-inner">
            <div className="about-split fade-up">
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

        {/* Ayurveda */}
        <section className="checkerboard-section" id="ayurveda">
          {/* Rad 1: Ayurveda bild | Ayurveda text */}
          <div className="cb-cell cb-img">
            <img src="/assets/ayurveda.jpg" alt="Ayurvediska örter och oljor" className="cb-img-fill" />
          </div>
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
          </div>

          {/* Rad 2: Yoga text | Yoga bild */}
          <div className="cb-cell cb-text cb-text-alt fade-up" id="yoga">
            <span className="section-label">{t.yoga.label}</span>
            <h2>Yoga</h2>
            <p className="yoga-intro">{t.yoga.intro}</p>
            <h3>{t.yoga.yinTitle}</h3>
            <p>{t.yoga.yinP1}</p>
            <span className="yoga-col-schedule">{t.yoga.yinSchedule}</span>
            <h3>{t.yoga.yogaAyurvedaTitle}</h3>
            <p>{t.yoga.yogaAyurvedaP1}</p>
            <p>{t.yoga.yogaAyurvedaP2}</p>
            <span className="yoga-col-schedule">{t.yoga.yogaAyurvedaSub}</span>
            <h3>{t.yoga.ashtangaTitle}</h3>
            <p>{t.yoga.ashtangaP1}</p>
            <p>{t.yoga.ashtangaP2}</p>
            <span className="yoga-coming-soon">{t.yoga.ashtangaSoon}</span>
          </div>
          <div className="cb-cell cb-img">
            <img src="/assets/ashtanga.jpeg" alt="Yoga" className="cb-img-fill" />
          </div>
        </section>

        {/* Veckoschema + bokning */}
        <section className="week-schedule-section" id="boka">
          <div className="section-inner">
            <span className="section-label">{t.weekSchedule.label}</span>
            <h2 className="week-schedule-title">{t.weekSchedule.title}</h2>
            <div className="wsr-columns">
              <div className="wsr-col">
                <p className="wsr-col-label">{t.weekSchedule.colMassage}</p>
                <div className="week-schedule-rows">
                  {t.weekSchedule.items.filter(r => r.booking).map((row, i) => (
                    <button
                      key={i}
                      className={`week-schedule-row${bookingOpen ? " wsr-active" : ""}`}
                      onClick={() => setBookingOpen((o) => !o)}
                    >
                      <span className="wsr-day">{row.day}</span>
                      <span className="wsr-time">{row.time}</span>
                      <span className="wsr-info">
                        <span className="wsr-type">{row.type}</span>
                        <span className="wsr-loc">{row.loc}</span>
                      </span>
                      <span className="wsr-btn">
                        {bookingOpen ? t.weekSchedule.closeLabel : t.weekSchedule.bookLabel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="wsr-col">
                <p className="wsr-col-label">{t.weekSchedule.colKlasser}</p>
                <div className="week-schedule-rows">
                  {t.weekSchedule.items.filter(r => r.href).map((row, i) => (
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
            <p className="wsr-class-tip">{t.weekSchedule.classTip}</p>
            {bookingOpen && (
              <div className="week-schedule-booking" ref={bookingRef}>
                <Booking
                  t={t}
                  entries={TORSDAG_ENTRIES}
                  address="Birkagatan 23, Stockholm"
                  slotPrefix="birka-massage"
                />
              </div>
            )}
          </div>
        </section>


        {/* Kurser */}
        <section className="retreat-section">
          <article className="retreat">
            <img src="/assets/retreat.jpg" alt="Stadsretreat" />
            <h2>{t.courses.title}</h2>
            <p className="retreat-intro">{t.courses.intro}</p>
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
            <div className="testimonials-shelf-wrap">
              <button className="shelf-arrow shelf-arrow-prev" onClick={() => scrollShelf(-1)} aria-label="Föregående">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <div className="testimonials-shelf fade-up" ref={shelfRef}>
                {t.reviews.items.map((r) => (
                  <div key={r.author} className="testimonial-card">
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
        <p>{t.footer.location}</p>
        <p><a href="mailto:healthbyjasmin@gmail.com">healthbyjasmin@gmail.com</a></p>
      </footer>
    </>
  );
}
