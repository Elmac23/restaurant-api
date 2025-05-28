import Navbar from '../components/Navbar';
import MenuSection from '../components/MenuSection';
import '../styles/Home.css';

function Home() {
  return (
    <div className="restaurant-page">
      <header className="header">
        <Navbar />
        <div className="hero-banner">
          <div className="content">
            <h1>Smaczne dania w naszej restauracji</h1>
            <p>Zamów online lub przyjdź do lokalu</p>
          </div>
        </div>
      </header>

      <MenuSection />

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">RestaurantSystem</div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Informacje</h4>
              <a href="#">O nas</a>
              <a href="#">Kontakt</a>
            </div>
            <div className="footer-column">
              <h4>Godziny otwarcia</h4>
              <p>Poniedziałek - Piątek: 10:00 - 22:00</p>
              <p>Sobota - Niedziela: 12:00 - 23:00</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2023 RestaurantSystem. Wszystkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;