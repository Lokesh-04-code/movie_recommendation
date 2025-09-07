import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [movies, setMovies] = useState([]);
  const [selected, setSelected] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    axios
      .get(`${backendURL}/movies`)
      .then((res) => setMovies(res.data))
      .catch((err) => console.log(err));
  }, [backendURL]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSelected(value);

    if (value.length > 0) {
      const filtered = movies.filter((movie) =>
        movie.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleRecommend = () => {
    if (!selected) return alert("Please select a movie");

    setLoading(true);
    setRecommendations([]);
    setSuggestions([]);
    axios
      .get(`${backendURL}/recommend?movie=${selected}`)
      .then((res) => setRecommendations(res.data))
      .catch((err) => {
        console.log(err);
        alert("Error fetching recommendations");
      })
      .finally(() => setLoading(false));
  };

  const handleSuggestionClick = (movie) => {
    setSelected(movie);
    setSuggestions([]);
  };

  const spinner = (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <div
        style={{
          border: "5px solid #f3f3f3",
          borderTop: "5px solid #3498db",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          margin: "0 auto",
          animation: "spin 1s linear infinite",
        }}
      />
      <p>Loading...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "50px 20px",
        fontFamily: "'Arial', sans-serif",
        background: "linear-gradient(135deg, #667eea, #764ba2, #f64f59)",
        color: "#fff",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "30px",
          textAlign: "center",
          textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
        }}
      >
        🎬 Movie Recommender System
      </h1>

      <div style={{ marginBottom: "30px", width: "100%", maxWidth: "400px" }}>
        <input
          type="text"
          value={selected}
          onChange={handleInputChange}
          placeholder="Type a movie name..."
          style={{
            padding: "12px",
            fontSize: "16px",
            width: "100%",
            borderRadius: "8px",
            border: "none",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleRecommend}
          style={{
            padding: "12px",
            fontSize: "16px",
            backgroundColor: "#ffb347",
            backgroundImage: "linear-gradient(45deg, #ffb347, #ffcc33)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "10px",
            width: "100%",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          Recommend
        </button>

        {suggestions.length > 0 && (
          <ul
            style={{
              marginTop: "5px",
              width: "100%",
              background: "#fff",
              color: "#333",
              borderRadius: "8px",
              listStyle: "none",
              padding: "5px 0",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              animation: "slideDown 0.3s ease",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {suggestions.map((movie) => (
              <li
                key={movie}
                onClick={() => handleSuggestionClick(movie)}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#eee")}
                onMouseLeave={(e) => (e.target.style.background = "#fff")}
              >
                {movie}
              </li>
            ))}
            <style>{`
              @keyframes slideDown {
                0% { transform: translateY(-10px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
              }
            `}</style>
          </ul>
        )}
      </div>

      {loading && spinner}

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {recommendations.map((rec, index) => (
          <div
            key={rec.title}
            style={{
              textAlign: "center",
              backgroundColor: "rgba(255,255,255,0.1)",
              padding: "10px",
              borderRadius: "10px",
              width: "calc(50% - 15px)",
              maxWidth: "150px",
              transition: "transform 0.3s, box-shadow 0.3s, opacity 0.5s",
              opacity: 0,
              animation: `fadeIn 0.5s ease forwards`,
              animationDelay: `${index * 0.1}s`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <p style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
              {rec.title}
            </p>
            {rec.poster ? (
              <img
                src={rec.poster}
                alt={rec.title}
                width="100%"
                style={{ borderRadius: "8px", objectFit: "cover" }}
              />
            ) : (
              <p style={{ fontSize: "0.8rem" }}>No Poster</p>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          h1 { font-size: 2rem; }
          div[style*="max-width: 400px"] { width: 100%; }
          div[style*="calc(50% - 15px)"] { width: 100%; max-width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default App;
