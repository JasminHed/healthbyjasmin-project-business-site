import "../styles/app.css";

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

        {/* Bokningsformulär */}
        <section className="booking-section">
          <h2>Book a Session</h2>

          <div className="booking-options">
            {/* Yoga-bokning */}
            <div className="booking-card">
              <h3>Yoga Classes</h3>
              <p>Book a spot in one of our yoga classes at the studio.</p>
              <a href="/yoga" className="booking-btn">
                Book Yoga &#10132;
              </a>
            </div>

            {/* Massage-bokning */}
            <div className="booking-card">
              <h3>Ayurvedic Massage</h3>
              <p>
                Book a personal Ayurvedic massage session. Each treatment is 1
                hour.
              </p>
              <form
                name="massage-booking"
                method="POST"
                data-netlify="true"
                className="massage-form"
              >
                <input type="hidden" name="form-name" value="massage-booking" />
                <input
                  type="hidden"
                  name="treatment"
                  value="Ayurvedic massage"
                />
                <label>
                  Name
                  <input type="text" name="name" required />
                </label>
                <label>
                  Email
                  <input type="email" name="email" required />
                </label>
                <label>
                  Phone
                  <input type="tel" name="phone" required />
                </label>
                <label>
                  Preferred time
                  <select name="preferred_time" required>
                    <option value="">-- Choose a time --</option>
                    <option>Saturday 10 May – 9:00</option>
                    <option>Saturday 10 May – 10:15</option>
                    <option>Saturday 10 May – 11:30</option>
                    <option>Thursday 14 May – 18:00</option>
                    <option>Thursday 14 May – 19:15</option>
                  </select>
                </label>
                <label>
                  Message
                  <textarea
                    name="message"
                    rows="3"
                    placeholder="Any wishes or questions?"
                  ></textarea>
                </label>
                <button type="submit">Send Booking</button>
              </form>
            </div>

            {/* Kursbokning */}
            <div className="booking-card">
              <h3>Courses</h3>
              <p>
                Interested in one of our courses? Fill in the form and we'll get
                back to you with details.
              </p>
              <form
                name="course-booking"
                method="POST"
                data-netlify="true"
                className="massage-form"
              >
                <input type="hidden" name="form-name" value="course-booking" />
                <label>
                  Name
                  <input type="text" name="name" required />
                </label>
                <label>
                  Email
                  <input type="email" name="email" required />
                </label>
                <label>
                  Course
                  <select name="course" required>
                    <option value="">-- Choose a course --</option>
                    <option>Introduction to Ayurveda</option>
                    <option>Ashtanga Yoga Basics</option>
                    <option>Yin Yoga</option>
                  </select>
                </label>
                <label>
                  Message
                  <textarea
                    name="message"
                    rows="3"
                    placeholder="Questions or comments?"
                  ></textarea>
                </label>
                <button type="submit">Send Booking</button>
              </form>
            </div>
          </div>
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
