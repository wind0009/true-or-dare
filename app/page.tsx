"use client";

import { useMemo, useRef, useState } from "react";

type Gender = "Fille" | "Garçon";
type Player = { name: string; gender: Gender };
type Kind = "Action" | "Vérité";
type Phase = "setup" | "wheel" | "spinning" | "choice" | "card";
const wheelColors = ["#ef7e9f", "#8f77d8", "#f1c86d", "#66a9b3", "#dc8bc0", "#738fe0", "#f49d69", "#8dbf83"];

const packs = {
  "Entre amis": { Action: ["Fais une imitation de quelqu’un du groupe jusqu’à ce qu’on devine.", "Laisse le groupe choisir une chanson : danse dessus pendant 20 secondes.", "Fais le compliment le plus original à la personne à ta droite.", "Parle avec un accent choisi par le groupe pour les deux prochains tours."], Vérité: ["Quel est ton plus grand talent inutile ?", "Quelle est la chose la plus drôle qui te soit arrivée cette année ?", "Si tu pouvais échanger ta vie avec quelqu’un ici pendant une journée, qui choisirais-tu ?", "Quel est le dernier petit mensonge que tu as dit ?"] },
  Flirt: { Action: ["Fais un compliment sincère à une personne de ton choix.", "Regarde une personne dans les yeux pendant dix secondes sans rire.", "Choisis une personne et invente votre nom de duo.", "Décris ton rendez-vous parfait en trois mots."], Vérité: ["Quelle qualité te fait craquer chez quelqu’un ?", "Quel est le plus beau compliment que tu aies reçu ?", "Quel serait ton rendez-vous parfait ?", "Qu’est-ce qui te met immédiatement de bonne humeur ?"] },
  Couple: { Action: ["Dis trois choses que tu apprécies chez l’autre.", "Choisissez une chanson qui vous représente et chantez le refrain.", "Rejouez ensemble votre premier rendez-vous en trente secondes.", "Fais un massage des épaules de trente secondes à ton partenaire."], Vérité: ["Quel souvenir de nous te fait le plus sourire ?", "Qu’aimerais-tu refaire ensemble bientôt ?", "Quelle petite habitude de l’autre te fait fondre ?", "Quel voyage rêverais-tu de faire à deux ?"] },
};

export default function Game() {
  const [players, setPlayers] = useState<Player[]>([{ name: "Lina", gender: "Fille" }, { name: "Alex", gender: "Garçon" }, { name: "Maya", gender: "Fille" }, { name: "Sam", gender: "Garçon" }]);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("Fille");
  const [pack, setPack] = useState<keyof typeof packs>("Entre amis");
  const [player, setPlayer] = useState<Player | null>(null);
  const [kind, setKind] = useState<Kind>("Action");
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("setup");
  const [bottleRotation, setBottleRotation] = useState(0);
  const bottleRotationRef = useRef(0);

  const question = useMemo(() => packs[pack][kind][index % packs[pack][kind].length], [pack, kind, index]);
  const wheelGradient = useMemo(() => {
    const step = 360 / players.length;
    return `conic-gradient(${players.map((_, itemIndex) => `${wheelColors[itemIndex % wheelColors.length]} ${itemIndex * step}deg ${(itemIndex + 1) * step}deg`).join(", ")})`;
  }, [players]);

  function openWheel() {
    if (players.length < 2) return;
    setPhase("wheel");
  }

  function spinBottle() {
    if (players.length < 2) return;
    const randomValue = new Uint32Array(1);
    crypto.getRandomValues(randomValue);
    const selectedIndex = randomValue[0] % players.length;
    const landingAngle = 270 - selectedIndex * (360 / players.length);
    const startRotation = bottleRotationRef.current;
    const finalRotation = startRotation + 5760 + landingAngle;
    const duration = 6800;
    setPhase("spinning");
    const startedAt = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      // Exponential friction: quick at first, then naturally losing momentum.
      const friction = 5.2;
      const eased = (1 - Math.exp(-friction * progress)) / (1 - Math.exp(-friction));
      const nextRotation = startRotation + (finalRotation - startRotation) * eased;
      bottleRotationRef.current = nextRotation;
      setBottleRotation(nextRotation);
      if (progress < 1) window.requestAnimationFrame(animate);
      else window.setTimeout(() => { setPlayer(players[selectedIndex]); setPhase("choice"); }, 350);
    };
    window.requestAnimationFrame(animate);
  }

  function chooseKind(nextKind: Kind) { setKind(nextKind); setIndex((current) => current + 1); setPhase("card"); }
  function addPlayer(event: React.FormEvent) { event.preventDefault(); const cleanName = name.trim(); if (!cleanName || players.some((item) => item.name.toLowerCase() === cleanName.toLowerCase())) return; setPlayers((items) => [...items, { name: cleanName, gender }]); setName(""); }
  function removePlayer(removed: Player) { setPlayers((items) => items.filter((item) => item.name !== removed.name)); }
  const level = pack === "Flirt" ? "Flirt ✨" : pack === "Couple" ? "Doux 💞" : "Entre amis 🎉";

  return <main className="app"><section className="game-shell">
    <header className="topbar"><div className="brand">Action <em>ou</em> Vérité</div><nav className="pack-tabs" aria-label="Ambiance du jeu">{(Object.keys(packs) as Array<keyof typeof packs>).map((item) => <button key={item} className={pack === item ? "selected" : ""} onClick={() => { setPack(item); setIndex(0); }}>{item}</button>)}</nav><div className="session"><span /> {players.length} joueurs</div></header>
    <section className={`game-area phase-${phase}`}>
      {phase === "setup" && <div className="stage setup-stage"><div className="stage-mark">✦</div><p className="eyebrow">PRÊT POUR LA PARTIE ?</p><h1>Qui va tomber<br />sur la bouteille ?</h1><p className="stage-copy">Ajoute les joueurs, choisis l’ambiance et laisse le hasard décider du premier tour.</p><button className="primary-button" disabled={players.length < 2} onClick={openWheel}>{players.length < 2 ? "Ajoute au moins 2 joueurs" : "Voir la roue  →"}</button></div>}
      {(phase === "wheel" || phase === "spinning") && <div className="stage spin-stage"><p className="eyebrow">{phase === "wheel" ? "À TOI DE JOUER" : "LA BOUTEILLE TOURNE"}</p><div className="table-scene"><div className="pointer">▼</div><div className="wheel"><div className="wheel-disk" style={{ background: wheelGradient }}>{players.map((item, itemIndex) => <span key={item.name} className="wheel-name" style={{ transform: `rotate(${itemIndex * (360 / players.length)}deg) translateY(-52px) rotate(90deg)` }}>{item.name}</span>)}</div><div className="wheel-hub"><button className={phase === "spinning" ? "bottle-button is-spinning" : "bottle-button"} onClick={spinBottle} disabled={phase === "spinning"} aria-label="Faire tourner la bouteille" style={{ transform: `rotate(${bottleRotation}deg)` }}><img src="/assets/spin-bottle.png" alt="Bouteille de jeu" /></button></div></div></div><h1>{phase === "wheel" ? "Fais tourner la bouteille" : "La bouteille choisit…"}</h1><p className="stage-copy">{phase === "wheel" ? "Clique sur la bouteille : elle choisira le prochain joueur." : "Elle ralentit… qui sera désigné ?"}</p></div>}
      {phase === "choice" && <div className="stage choice-stage"><p className="eyebrow">C’EST TON TOUR</p><div className="chosen-avatar">{player?.name[0]}</div><h1>{player?.name},<br />tu choisis quoi ?</h1><p className="stage-copy">Action ou Vérité ? À toi de décider avant de découvrir la carte.</p><div className="choice-buttons"><button className="truth-choice" onClick={() => chooseKind("Vérité")}><span>💬</span> Vérité</button><button className="action-choice" onClick={() => chooseKind("Action")}><span>⚡</span> Action</button></div></div>}
      {phase === "card" && <div className="stage card-stage"><div className="turn-line"><span>Tour de</span><strong>{player?.name}</strong></div><h1>{kind} !</h1><article className={`challenge-card ${kind === "Action" ? "action-card" : "truth-card"}`}><div className="card-topline"><span>{kind === "Action" ? "⚡" : "💬"}</span> {kind}</div><p>{question}</p><div className="card-foot"><div><small>NIVEAU</small><b>{level}</b></div><small>CARTE {String((index % 40) + 1).padStart(2, "0")} / 40</small></div></article><button className="skip-button" onClick={openWheel}>Tour suivant  →</button></div>}
    </section>
    <aside className="players-panel"><div className="players-heading"><div><span>{phase === "setup" ? "PRÉPAREZ LA PARTIE" : "PARTIE EN COURS"}</span><h2>Les joueurs</h2></div><b>{players.length}</b></div><div className="player-list">{players.map((item) => <div className={player?.name === item.name ? "player active" : "player"} key={item.name}><i className={item.gender === "Fille" ? "girl" : "boy"}>{item.name[0]}</i><span>{item.name}</span><small>{item.gender}</small><button onClick={() => removePlayer(item)} aria-label={`Retirer ${item.name}`}>×</button></div>)}</div><form onSubmit={addPlayer} className="add-player"><label htmlFor="player-name">Ajouter un joueur</label><div><input id="player-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Son prénom" /><button type="submit">+</button></div><div className="gender-choice"><button type="button" className={gender === "Fille" ? "chosen" : ""} onClick={() => setGender("Fille")}>Fille</button><button type="button" className={gender === "Garçon" ? "chosen" : ""} onClick={() => setGender("Garçon")}>Garçon</button></div></form><p className="privacy-note">Le genre aide seulement à adapter certaines cartes.</p></aside>
  </section></main>;
}
