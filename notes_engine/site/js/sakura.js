const isSkDate = (d = new Date()) => d.getMonth() === 2 && d.getDate() >= 15 || d.getMonth() === 3 && d.getDate() <= 10;
// the day screen until 18:30, the end of the golden hour; then the night (lanterns, fireflies, the pink moon)
const isSkDaytime = () => { const t = clockSeconds(); return t >= 7 * 3600 && t < 18.5 * 3600; };
const skSubtitle = () => {
  const d = new Date(), m = d.getMonth(), day = d.getDate();
  if (!isSkDate(d)) return "Hanami, whatever the season. Revise under the blossoms.";
  return "Full bloom. Hanami season: revise under the blossoms.";
};
SCREENS.sakura = { className: "sakura", subtitle: skSubtitle, transition: "sakura" };
SCREENS["sakura-night"] = { className: "sakura", subtitle: () => "Yozakura: the blossoms by lantern light. " + skSubtitle(), transition: "sakura" };
