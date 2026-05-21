import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Lang = "en" | "id";

const dict: Record<string, { en: string; id: string }> = {
  // AppShell
  "Search sentiment data...": { en: "Search sentiment data...", id: "Cari data sentimen..." },
  "New Analysis": { en: "New Analysis", id: "Analisis Baru" },
  "Dashboard": { en: "Dashboard", id: "Dasbor" },
  "Analysis": { en: "Analysis", id: "Analisis" },
  "Dataset": { en: "Dataset", id: "Dataset" },
  "Reports": { en: "Reports", id: "Laporan" },
  "Tourism": { en: "Tourism", id: "Pariwisata" },
  "About": { en: "About", id: "Tentang" },
  "Datasets": { en: "Datasets", id: "Dataset" },
  "Notifications": { en: "Notifications", id: "Notifikasi" },
  "tweets labeled": { en: "tweets labeled", id: "tweet terlabel" },
  "In the last 24 hours": { en: "In the last 24 hours", id: "Dalam 24 jam terakhir" },
  "No new activity": { en: "No new activity", id: "Tidak ada aktivitas baru" },
  "Run new analysis": { en: "Run new analysis", id: "Jalankan analisis baru" },
  "Profile": { en: "Profile", id: "Profil" },
  "Sign out": { en: "Sign out", id: "Keluar" },
  "Account": { en: "Account", id: "Akun" },
  "Admin": { en: "Admin", id: "Admin" },
  "Researcher": { en: "Researcher", id: "Peneliti" },
  "Guest": { en: "Guest", id: "Tamu" },
  "Methodology": { en: "Methodology", id: "Metodologi" },
  "Privacy": { en: "Privacy", id: "Privasi" },
  "API Documentation": { en: "API Documentation", id: "Dokumentasi API" },
  "© 2026 NTT Tourism Sentiment Thesis": { en: "© 2026 NTT Tourism Sentiment Thesis", id: "© 2026 NTT Tourism Sentiment Thesis" },
  // Dashboard
  "Sentiment Overview": { en: "Sentiment Overview", id: "Ringkasan Sentimen" },
  "Analyzing tourism emotional trends across the Flores archipelago.": {
    en: "Analyzing tourism emotional trends across the Flores archipelago.",
    id: "Menganalisis tren emosi wisata di seluruh kepulauan Flores.",
  },
  "Total Tweets": { en: "Total Tweets", id: "Total Tweet" },
  "Positive Sentiment": { en: "Positive Sentiment", id: "Sentimen Positif" },
  "Negative Sentiment": { en: "Negative Sentiment", id: "Sentimen Negatif" },
  "Neutral Sentiment": { en: "Neutral Sentiment", id: "Sentimen Netral" },
  "unlabeled": { en: "unlabeled", id: "belum dilabeli" },
  "Sentiment Distribution": { en: "Sentiment Distribution", id: "Distribusi Sentimen" },
  "Live breakdown of labeled tweets in dataset": {
    en: "Live breakdown of labeled tweets in dataset",
    id: "Rincian langsung tweet berlabel pada dataset",
  },
  "Positive": { en: "Positive", id: "Positif" },
  "Neutral": { en: "Neutral", id: "Netral" },
  "Negative": { en: "Negative", id: "Negatif" },
  "Top Destinations": { en: "Top Destinations", id: "Destinasi Teratas" },
  "By positive sentiment ratio": { en: "By positive sentiment ratio", id: "Berdasarkan rasio sentimen positif" },
  "mentions": { en: "mentions", id: "penyebutan" },
  "Featured Narrative": { en: "Featured Narrative", id: "Narasi Unggulan" },
  "Strategic Insight": { en: "Strategic Insight", id: "Wawasan Strategis" },
  "Auto-generated from current dataset": { en: "Auto-generated from current dataset", id: "Dihasilkan otomatis dari dataset saat ini" },
  "Word Cloud": { en: "Word Cloud", id: "Awan Kata" },
  "Most frequent terms across the tweet dataset": {
    en: "Most frequent terms across the tweet dataset",
    id: "Istilah paling sering muncul pada dataset tweet",
  },
  // Model metrics
  "Model Performance": { en: "Model Performance", id: "Performa Model" },
  "Accuracy, classification report, and confusion matrix from the latest labeled data": {
    en: "Accuracy, classification report, and confusion matrix from the latest labeled data",
    id: "Akurasi, laporan klasifikasi, dan confusion matrix dari data berlabel terbaru",
  },
  "Accuracy": { en: "Accuracy", id: "Akurasi" },
  "Macro F1": { en: "Macro F1", id: "F1 Makro" },
  "Samples": { en: "Samples", id: "Sampel" },
  "Classification Report": { en: "Classification Report", id: "Laporan Klasifikasi" },
  "Class": { en: "Class", id: "Kelas" },
  "Precision": { en: "Precision", id: "Presisi" },
  "Recall": { en: "Recall", id: "Recall" },
  "F1-Score": { en: "F1-Score", id: "Skor F1" },
  "Support": { en: "Support", id: "Dukungan" },
  "Confusion Matrix": { en: "Confusion Matrix", id: "Confusion Matrix" },
  "Predicted": { en: "Predicted", id: "Prediksi" },
  "Actual": { en: "Actual", id: "Aktual" },
  "Language": { en: "Language", id: "Bahasa" },
  "English": { en: "English", id: "Inggris" },
  "Indonesian": { en: "Indonesian", id: "Indonesia" },
};

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }>({
  lang: "en", setLang: () => {}, t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("lang") as Lang) || "en");
  useEffect(() => { localStorage.setItem("lang", lang); }, [lang]);
  const t = (k: string) => dict[k]?.[lang] ?? k;
  return <Ctx.Provider value={{ lang, setLang: setLangState, t }}>{children}</Ctx.Provider>;
}

export const useT = () => useContext(Ctx);
