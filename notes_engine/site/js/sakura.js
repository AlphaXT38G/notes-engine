const isSkDate = (d = new Date()) => d.getMonth() === 2 && d.getDate() >= 15 || d.getMonth() === 3 && d.getDate() <= 10;
// the day screen until 18:30, the end of the golden hour; then the night (lanterns, fireflies, the pink moon)
const isSkDaytime = () => { const t = clockSeconds(); return t >= 7 * 3600 && t < 18.5 * 3600; };
const skSubtitle = () => {
  const d = new Date(), m = d.getMonth(), day = d.getDate();
  if (!isSkDate(d)) return "Hanami, whatever the season. Revise under the blossoms.";
  if (m === 2 && day < 25) return "The first blossoms open. So do the notes.";
  if (m === 3 && day > 4) return "The petals fall. Revise before the last one does.";
  return "Full bloom. Hanami season: revise under the blossoms.";
};
SCREENS.sakura = { className: "sakura", subtitle: skSubtitle, transition: "sakura" };
SCREENS["sakura-night"] = { className: "sakura", subtitle: () => "Yozakura: the blossoms by lantern light. " + skSubtitle(), transition: "sakura" };

// Sakura replaces the day, the calm night and the jazz bar, as Christmas and Halloween do (the three
// periods never meet). This file is loaded after halloween.js and before armstrong.js and calm.js,
// so the yeti and boo codes typed after kojiro win (they clear skEgg), and the armstrong and peace
// codes too, and the shows of the clock.
let skEgg = false, skEggYeti = 0;
OVERRIDES.push(phase => {
  if (skEgg && yetiTyped !== skEggYeti) skEgg = false;
  const cls = screenClass(phase);
  const replaced = isNormal(phase) || cls === "night" || skEgg && (cls === "christmas" || cls === "halloween");
  if (!replaced || !(skEgg || (!forced || forcedDismissed) && isSkDate())) return phase;
  return isSkDaytime() ? "sakura" : "sakura-night";
});