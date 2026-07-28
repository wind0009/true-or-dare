"use client";
import { useMemo, useState } from "react";

type Kind = "Action" | "Vérité";
const cards = {
  Action: ["Fais une déclaration d’amour dramatique à la personne à ta droite.", "Laisse le groupe choisir une chanson et danse pendant vingt secondes.", "Imite une personne autour de toi jusqu’à ce que le groupe la reconnaisse.", "Fais le compliment le plus original à la personne de ton choix."],
  Vérité: ["Quelle est la chose la plus spontanée que tu aies faite ?", "Quelle est la qualité que tu préfères chez les autres ?", "Quel est ton souvenir le plus drôle avec des amis ?", "Quel serait ton rendez-vous parfait ?"],
};

export default function Game() {
  const [kind, setKind] = useState<Kind>("Action");
  const [card, setCard] = useState(0);
  const [turn, setTurn] = useState("Léa");
  const [count, setCount] = useState(6);
  const text = useMemo(() => cards[kind][card % cards[kind].length], [kind, card]);
  const nextCard = (nextKind = kind) => { setKind(nextKind); setCard((value) => value + 1); };
  const nextTurn = () => { const names = ["Léa", "Alex", "Maya", "Sam", "Lina", "Noah"]; setTurn(names[Math.floor(Math.random() * names.length)]); nextCard(Math.random() > 0.5 ? "Action" : "Vérité"); };

  return <main className="phone-page">
    <section className="phone-shell">
      <div className="status"><span>21:41</span><div><i /> <i /> <i className="half" /></div></div>
      <header className="game-header"><button aria-label="Retour" className="back">‹</button><button className="player-count" onClick={() => setCount((value) => value === 6 ? 5 : 6)}>♟ <b>{count}</b></button></header>
      <div className="heading"><p>TOUR DE {turn.toUpperCase()}</p><h1>Action ou Vérité ?</h1></div>
      <article className="challenge-card"><div className={`bubble ${kind.toLowerCase()}`} /><div className={`tag ${kind.toLowerCase()}`}>{kind === "Action" ? "⚡" : "💬"} {kind.toUpperCase()}</div><p>{text}</p><footer><div><small>NIVEAU</small><b>{kind === "Action" ? "Pimenté 🌶️" : "Curieux ✨"}</b></div><span>CARTE&nbsp; {12 + card} / 40</span></footer></article>
      <p className="choose">Choisis ton camp</p>
      <div className="choice-grid"><button className={kind === "Vérité" ? "selected truth" : "truth"} onClick={() => nextCard("Vérité")}><span>💬</span>VÉRITÉ</button><button className={kind === "Action" ? "selected action" : "action"} onClick={() => nextCard("Action")}><span>⚡</span>ACTION</button></div>
      <button className="skip" onClick={nextTurn}>Passer cette carte <b>→</b></button>
      <div className="home-line" />
    </section>
  </main>;
}
