"use client";

import { useMemo, useState } from "react";

type Gender = "Fille" | "Garçon";
type Player = { name: string; gender: Gender };
type Kind = "Action" | "Vérité";

const packs = {
  "Entre amis": {
    Action: [
      "Fais une imitation de quelqu’un du groupe jusqu’à ce qu’on devine.",
      "Laisse le groupe choisir une chanson : danse dessus pendant 20 secondes.",
      "Fais le compliment le plus original à la personne à ta droite.",
      "Parle avec un accent choisi par le groupe pour les deux prochains tours.",
    ],
    Vérité: [
      "Quel est ton plus grand talent inutile ?",
      "Quelle est la chose la plus drôle qui te soit arrivée cette année ?",
      "Si tu pouvais échanger ta vie avec quelqu’un ici pendant une journée, qui choisirais-tu ?",
      "Quel est le dernier petit mensonge que tu as dit ?",
    ],
  },
  Flirt: {
    Action: [
      "Fais un compliment sincère à une personne de ton choix.",
      "Regarde une personne dans les yeux pendant dix secondes sans rire.",
      "Choisis une personne et invente votre nom de duo.",
      "Décris ton rendez-vous parfait en trois mots.",
    ],
    Vérité: [
      "Quelle qualité te fait craquer chez quelqu’un ?",
      "Quel est le plus beau compliment que tu aies reçu ?",
      "Quel serait ton rendez-vous parfait ?",
      "Qu’est-ce qui te met immédiatement de bonne humeur ?",
    ],
  },
  Couple: {
    Action: [
      "Dis trois choses que tu apprécies chez l’autre.",
      "Choisissez une chanson qui vous représente et chantez le refrain.",
      "Rejouez ensemble votre premier rendez-vous en trente secondes.",
      "Fais un massage des épaules de trente secondes à ton partenaire.",
    ],
    Vérité: [
      "Quel souvenir de nous te fait le plus sourire ?",
      "Qu’aimerais-tu refaire ensemble bientôt ?",
      "Quelle petite habitude de l’autre te fait fondre ?",
      "Quel voyage rêverais-tu de faire à deux ?",
    ],
  },
};

export default function Game() {
  const [players, setPlayers] = useState<Player[]>([
    { name: "Lina", gender: "Fille" },
    { name: "Alex", gender: "Garçon" },
    { name: "Maya", gender: "Fille" },
    { name: "Sam", gender: "Garçon" },
  ]);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("Fille");
  const [pack, setPack] = useState<keyof typeof packs>("Entre amis");
  const [player, setPlayer] = useState<Player>(players[0]);
  const [kind, setKind] = useState<Kind>("Action");
  const [index, setIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const question = useMemo(
    () => packs[pack][kind][index % packs[pack][kind].length],
    [pack, kind, index],
  );

  function nextCard(nextKind = kind) {
    setKind(nextKind);
    setIndex((current) => current + 1);
  }

  function spin() {
    if (spinning || players.length === 0) return;
    setSpinning(true);
    window.setTimeout(() => {
      setPlayer(players[Math.floor(Math.random() * players.length)]);
      setKind(Math.random() > 0.5 ? "Action" : "Vérité");
      setIndex((current) => current + 1);
      setSpinning(false);
    }, 700);
  }

  function addPlayer(event: React.FormEvent) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || players.some((item) => item.name.toLowerCase() === cleanName.toLowerCase())) return;
    const newPlayer = { name: cleanName, gender };
    setPlayers((items) => [...items, newPlayer]);
    setPlayer(newPlayer);
    setName("");
  }

  function removePlayer(removed: Player) {
    const rest = players.filter((item) => item.name !== removed.name);
    setPlayers(rest);
    if (player.name === removed.name && rest[0]) setPlayer(rest[0]);
  }

  return (
    <main className="app">
      <section className="game-shell">
        <header className="topbar">
          <div className="brand">Action <em>ou</em> Vérité</div>
          <nav className="pack-tabs" aria-label="Ambiance du jeu">
            {(Object.keys(packs) as Array<keyof typeof packs>).map((item) => (
              <button key={item} className={pack === item ? "selected" : ""} onClick={() => { setPack(item); setIndex(0); }}>
                {item}
              </button>
            ))}
          </nav>
          <div className="session"><span /> {players.length} joueurs</div>
        </header>

        <section className="game-area">
          <div className="turn-line"><span>Tour de</span><strong>{spinning ? "La bouteille tourne…" : player.name}</strong></div>
          <h1>Action ou Vérité ?</h1>

          <article className={`challenge-card ${kind === "Action" ? "action-card" : "truth-card"}`}>
            <div className="card-topline"><span>{kind === "Action" ? "⚡" : "💬"}</span> {kind}</div>
            <p>{question}</p>
            <div className="card-foot">
              <div><small>NIVEAU</small><b>{pack === "Flirt" ? "Flirt ✨" : pack === "Couple" ? "Doux 💞" : "Entre amis 🎉"}</b></div>
              <small>CARTE {String((index % 40) + 1).padStart(2, "0")} / 40</small>
            </div>
          </article>

          <p className="choice-title">Choisis ton camp</p>
          <div className="choice-buttons">
            <button className={kind === "Vérité" ? "is-active truth-choice" : "truth-choice"} onClick={() => nextCard("Vérité")}><span>💬</span> Vérité</button>
            <button className={kind === "Action" ? "is-active action-choice" : "action-choice"} onClick={() => nextCard("Action")}><span>⚡</span> Action</button>
          </div>
          <button className="skip-button" onClick={spin}>{spinning ? "La bouteille tourne…" : "Passer cette carte  →"}</button>
        </section>

        <aside className="players-panel">
          <div className="players-heading"><div><span>PARTIE EN COURS</span><h2>Les joueurs</h2></div><b>{players.length}</b></div>
          <div className="player-list">
            {players.map((item) => (
              <div className={player.name === item.name ? "player active" : "player"} key={item.name}>
                <i className={item.gender === "Fille" ? "girl" : "boy"}>{item.name[0]}</i><span>{item.name}</span><small>{item.gender}</small>
                <button onClick={() => removePlayer(item)} aria-label={`Retirer ${item.name}`}>×</button>
              </div>
            ))}
          </div>
          <form onSubmit={addPlayer} className="add-player">
            <label htmlFor="player-name">Ajouter un joueur</label>
            <div><input id="player-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Son prénom" /><button type="submit">+</button></div>
            <div className="gender-choice"><button type="button" className={gender === "Fille" ? "chosen" : ""} onClick={() => setGender("Fille")}>Fille</button><button type="button" className={gender === "Garçon" ? "chosen" : ""} onClick={() => setGender("Garçon")}>Garçon</button></div>
          </form>
          <p className="privacy-note">Le genre aide seulement à adapter certaines cartes.</p>
        </aside>
      </section>
    </main>
  );
}
