"use client";

import { useEffect, useState } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  const [language, setLanguage] = useState("es");

  useEffect(() => {
    let savedLanguage = "es";
    try {
      const storedLanguage = window.localStorage.getItem("futsal-terrassa-language");
      if (storedLanguage === "ca" || storedLanguage === "es") savedLanguage = storedLanguage;
    } catch {}
    setLanguage(savedLanguage);
    document.documentElement.lang = savedLanguage;
    document.title = savedLanguage === "ca" ? "Accés privat | Fundació Terrassa FC 1906" : "Acceso privado | Fundació Terrassa FC 1906";
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "ca" ? "Accés privat | Fundació Terrassa FC 1906" : "Acceso privado | Fundació Terrassa FC 1906";
  }, [language]);

  function chooseLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    document.documentElement.lang = nextLanguage;
    document.title = nextLanguage === "ca" ? "Accés privat | Fundació Terrassa FC 1906" : "Acceso privado | Fundació Terrassa FC 1906";
    try {
      window.localStorage.setItem("futsal-terrassa-language", nextLanguage);
    } catch {}
  }

  return (
    <main className="login-page" lang={language}>
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-language" role="group" aria-label={language === "ca" ? "Idioma" : "Idioma"}>
          <button type="button" aria-pressed={language === "ca"} onClick={() => chooseLanguage("ca")}>CA</button>
          <button type="button" aria-pressed={language === "es"} onClick={() => chooseLanguage("es")}>ES</button>
        </div>
        <img className="club-mark" src="https://files.fcf.cat/escudos/clubes/escudos/00100_0000988633_TERRASSAFCnou.png" alt={language === "ca" ? "Escut de la Fundació Terrassa FC 1906" : "Escudo de la Fundació Terrassa FC 1906"} />
        <p className="eyebrow">Fundació Terrassa FC 1906</p>
        <h1 id="login-title">{language === "ca" ? "Accés privat" : "Acceso privado"}</h1>
        <p className="login-description">{language === "ca" ? "Introdueix les teves credencials per continuar." : "Introduce tus credenciales para continuar."}</p>
        <LoginForm language={language} />
      </section>
      <footer className="login-footer">{language === "ca" ? "Futbol sala · Convocatòries de partit" : "Fútbol sala · Convocatorias de partido"}</footer>
    </main>
  );
}