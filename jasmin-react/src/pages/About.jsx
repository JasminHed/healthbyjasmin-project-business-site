import "../styles/app.css";

export default function About() {
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
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/yoga">Yoga</a>
            </li>
            <li>
              <a href="/ayurveda">Ayurveda</a>
            </li>
            <li>
              <a href="mailto:healthbyjasmin@gmail.com">Contact</a>
            </li>
          </ul>
        </nav>
      </header>

      <section>
        <h1>About</h1>
        <p className="about-text">
          I am Jasmin – the person behind Health by Jasmin, a one-woman business
          based in Stockholm, Sweden. I've been practicing primarly Ashtanga
          yoga but also Yoga in general and Ayurveda for nearly 17 years. What
          first pulled me in was the structure, the rhythm, and the way both
          practices bring things into focus – sometimes gently, sometimes
          boldly.
        </p>
        <p className="about-text">
          I fell in love with their holistic approach and how they challenge you
          to look at yourself and your habits from a completely different angle.
          In 2015/2016, I started Health by Jasmin to create a space where I
          could share what has deeply resonated with me over the years.
        </p>
        <p className="about-text">
          I do this in small doses – through yoga classes, short courses, the
          occasional retreat, and of course, the magical Ayurvedic massages. I
          also offer talks and introductions to Ayurveda, to help people get a
          better understanding of its beautiful foundation.
        </p>
      </section>

      <section className="image-section about-image"></section>

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
