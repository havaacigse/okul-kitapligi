import React, { useEffect, useMemo, useState } from "react";

const KITAPLAR = [
  { id: 1, baslik: "Suç ve Ceza", yazar: "Dostoyevski", kategori: "Klasik" },
  { id: 2, baslik: "Yüzyıllık Yalnızlık", yazar: "Gabriel Garcia Marquez", kategori: "Edebiyat" },
  { id: 3, baslik: "Sefiller", yazar: "Victor Hugo", kategori: "Klasik" },
  { id: 4, baslik: "JavaScript: The Good Parts", yazar: "Douglas Crockford", kategori: "Programlama" },
  { id: 5, baslik: "Clean Code", yazar: "Robert C. Martin", kategori: "Programlama" },
  { id: 6, baslik: "Küçük Prens", yazar: "Antoine de Saint-Exupéry", kategori: "Çocuk" }
];

function getUniqueCategories(list) {
  return ["Tümü", ...Array.from(new Set(list.map((k) => k.kategori)))];
}

export default function App() {
  const ARAMA_KEY = "okul-kitapligi-arama";
  const KATEGORI_KEY = "okul-kitapligi-kategori";
  const FAVORI_KEY = "okul-kitapligi-favoriler";


  const [aramaMetni, setAramaMetni] = useState(() => {
    return localStorage.getItem(ARAMA_KEY) || "";
  });
  const [kategori, setKategori] = useState(() => {
    return localStorage.getItem(KATEGORI_KEY) || "Tümü";
  });
  const [favoriler, setFavoriler] = useState(() => {
    try {
      const savedFavoriler = localStorage.getItem(FAVORI_KEY);

      return savedFavoriler ? JSON.parse(savedFavoriler) : [];
    } catch (e) {
      console.warn("localStorage'dan favoriler okunamadı", e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(ARAMA_KEY, aramaMetni);
    } catch (e) {
      console.warn("localStorage'a aramaMetni yazılamadı", e);
    }
  }, [aramaMetni]);

  useEffect(() => {
    try {
      localStorage.setItem(KATEGORI_KEY, kategori);
    } catch (e) {
      console.warn("localStorage'a kategori yazılamadı", e);
    }
  }, [kategori]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORI_KEY, JSON.stringify(favoriler));
    } catch (e) {
      console.warn("localStorage'a favoriler yazılamadı", e);
    }
  }, [favoriler]);


  const filtrelenmis = useMemo(() => {
    const metin = aramaMetni.trim().toLowerCase();
    return KITAPLAR.filter(
      (k) =>
        (kategori === "Tümü" || k.kategori === kategori) &&
        k.baslik.toLowerCase().includes(metin)
    );
  }, [aramaMetni, kategori]);

  function toggleFavori(kitapObjesi) {
    setFavoriler((prev) =>
      prev.some(fav => fav.id === kitapObjesi.id)
        ? prev.filter((fav) => fav.id !== kitapObjesi.id)
        : [...prev, kitapObjesi]
    );
  }

  const kategoriler = useMemo(() => getUniqueCategories(KITAPLAR), []);

  return (
    <div style={styles.page}>
      <div style={styles.app}>
        <header style={styles.header}>
          <h1>📚 Okul Kulübü Kitaplığı</h1>
          <p style={{ marginTop: 4, color: "#f3f4f6" }}>Arama ve favoriler tarayıcıya kaydedilir.</p>
        </header>

        <div style={styles.controls}>
          <AramaCubugu value={aramaMetni} onChange={setAramaMetni} />
          <KategoriFiltre kategoriler={kategoriler} value={kategori} onChange={setKategori} />
          <FavoriPaneli favoriler={favoriler} onClear={() => setFavoriler([])} />
        </div>

        <main style={styles.main}>
          <KitapListe
            kitaplar={filtrelenmis}
            favoriler={favoriler}
            onToggleFavori={toggleFavori}
          />
        </main>

        <footer style={styles.footer}>
          <small>
            Arama: "{aramaMetni || ' '}" — Kategori: {kategori} — Toplam favori: {favoriler.length}
          </small>
        </footer>
      </div>
    </div>
  );
}


function AramaCubugu({ value, onChange }) {
  return (
    <div style={styles.searchBox}>
      <label style={{ marginRight: 8 }}>Ara:</label>
      <input
        style={styles.input}
        placeholder="Kitap başlığına göre ara..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function KategoriFiltre({ kategoriler, value, onChange }) {
  return (
    <div style={styles.categoryBox}>
      <label style={{ marginRight: 8 }}>Kategori:</label>
      <select style={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
        {kategoriler.map((k) => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>
    </div>
  );
}


function KitapListe({ kitaplar, favoriler, onToggleFavori }) {
  if (!kitaplar.length) return <div style={{ padding: 16 }}>Eşleşen kitap yok.</div>;
  return (
    <div style={styles.list}>
      {kitaplar.map((k) => (
        <KitapKarti
          key={k.id}
          {...k}
          favorideMi={favoriler.some(fav => fav.id === k.id)}
          onToggle={() => onToggleFavori(k)}
        />
      ))}
    </div>
  );
}

function KitapKarti({ baslik, yazar, kategori, id, favorideMi, onToggle }) {
  return (
    <div style={{ ...styles.card, boxShadow: favorideMi ? "0 6px 18px rgba(255,99,132,0.12)" : styles.card.boxShadow }}>
      <div>
        <h3>{baslik}</h3>
        <p style={{ margin: 4 }}>
          <em>{yazar}</em> — <strong>{kategori}</strong>
        </p>
      </div>
      <button style={{ ...styles.favButton, transform: favorideMi ? "scale(1.03)" : "scale(1)" }} onClick={onToggle}>
        {favorideMi ? "Çıkar" : "💖 Favori"}
      </button>
    </div>
  );
}


function FavoriPaneli({ favoriler, onClear }) {
  return (
    <div style={styles.favPanel}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <strong>Favoriler</strong>
        <button style={styles.clearBtn} onClick={onClear}>Temizle</button>
      </div>
      <div style={{ maxHeight: 120, overflowY: "auto" }}>
        {favoriler.length === 0 ? (
          <div style={{ color: "#e6edf3" }}>Henüz favori yok.</div>
        ) : (
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {favoriler.map((k) => (
              <li key={k.id}>{k.baslik} — {k.yazar}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "linear-gradient(180deg,#0f172a 0%, #0b1220 100%)",
    minHeight: "100vh",
    padding: 24,
    color: "#e6eef8",
  },
  app: {
    maxWidth: 1000,
    margin: "0 auto",
    background: "linear-gradient(180deg,#0b1220, #071226)",
    borderRadius: 12,
    padding: 18,
    boxShadow: "0 10px 40px rgba(2,6,23,0.7)",
  },
  header: {
    textAlign: "center",
    marginBottom: 16,
  },
  controls: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
  },
  input: {
    padding: "8px 10px",
    minWidth: 260,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
  },
  categoryBox: {
    display: "flex",
    alignItems: "center",
  },
  select: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
  },
  favPanel: {
    border: "1px solid rgba(255,255,255,0.04)",
    padding: 10,
    borderRadius: 10,
    minWidth: 220,
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
  },
  main: {
    borderTop: "1px solid rgba(255,255,255,0.03)",
    paddingTop: 12,
  },
  list: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  card: {
    border: "1px solid rgba(255,255,255,0.04)",
    padding: 14,
    borderRadius: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    boxShadow: "0 4px 12px rgba(2,6,23,0.5)",
  },
  favButton: {
    padding: "8px 12px",
    cursor: "pointer",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "transparent",
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "transform 140ms ease, background 160ms ease",
  },
  clearBtn: {
    padding: "6px 8px",
    fontSize: 12,
    cursor: "pointer",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "transparent",
    color: "#fff",
  },
  footer: {
    marginTop: 18,
    textAlign: "center",
    color: "#94a3b8",
  },
};