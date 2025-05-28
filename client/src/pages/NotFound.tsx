import { Link } from 'react-router-dom';
import '../styles/NotFound.css';

function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>Strona nie znaleziona</h2>
      <p>Przepraszamy, strona której szukasz nie istnieje.</p>
      <Link to="/" className="back-link">Wróć do strony głównej</Link>
    </div>
  );
}

export default NotFound;