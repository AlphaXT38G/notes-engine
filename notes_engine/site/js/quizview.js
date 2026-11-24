// ── quizview.js: the quizzes, opened as a view of the page in place of the cards ──
// A subject with a quiz has a Quiz button on its card (page.py, quiz_link()): a plain link to
// #quiz/<id>. The hash says what is shown, so the browser's back button, a reload and a link
// sent to someone all work: #quiz/<id> hides the cards (body.quizzing, quiz.css) and opens the
// quiz in #quizview; no hash, the cards again, where they were left.
// The quiz itself is quiz-engine's (dist/quiz/quiz.js and quiz.css, built by quiz.py): loaded on
// the first open only, so a visit without a quiz costs nothing. It takes the colours of the
// screen on show (the same tokens), and the screen, its music and its scene go on around it.
// quiz-engine's API: QuizEngine.open(host, {url, title, onClose}), QuizEngine.close().

const qvHost = document.getElementById("quizview");
let qvLoading = null;  // the promise of quiz.css + quiz.js, made once
let qvPushed = false;  // opened by a click on this page: leaving it goes back in the history
let qvScroll = 0;      // where the cards were, to come back to them there

const qvAssets = () => {
  if (qvLoading) return qvLoading;
  const v = qvHost.getAttribute("data-v") || "";  // the build's date: a new build, new files
  const load = (el, attr, url) => new Promise((resolve, reject) => {
    el.onload = resolve;
    el.onerror = () => reject(new Error(url));
    el[attr] = url;
    (el.tagName === "LINK" ? document.head : document.body).appendChild(el);
  });
  const css = document.createElement("link");
  css.rel = "stylesheet";
  qvLoading = Promise.all([
    load(css, "href", `quiz/quiz.css?v=${v}`),
    load(document.createElement("script"), "src", `quiz/quiz.js?v=${v}`),
  ]).catch(e => { qvLoading = null; throw e; });  // offline: try again next time
  return qvLoading;
};

const qvShow = id => {
  const link = document.querySelector(`.quizlink[data-quiz="${id}"]`);
  if (!link) { qvHide(); return; }  // an old link to a quiz that no longer exists
  if (!document.body.classList.contains("quizzing")) qvScroll = window.pageYOffset;
  document.body.classList.add("quizzing");
  qvHost.hidden = false;
  qvHost.textContent = "Loading the quiz…";
  // the top of the quiz in view, the header above it still reachable
  window.scrollTo(0, Math.min(window.pageYOffset, Math.max(0, qvHost.getBoundingClientRect().top + window.pageYOffset - 16)));
  qvAssets().then(() => {
    if (location.hash !== `#quiz/${id}`) return;  // left while it was loading
    qvHost.textContent = "";
    QuizEngine.open(qvHost, { url: `quiz/${id}/data.json`, title: link.getAttribute("data-title"), onClose: qvLeave });
  }, () => {
    qvHost.textContent = "The quiz could not be loaded. Check the connection and try again.";
  });
};

const qvHide = () => {
  if (window.QuizEngine) QuizEngine.close();
  if (!document.body.classList.contains("quizzing")) return;
  document.body.classList.remove("quizzing");
  qvHost.hidden = true;
  qvHost.textContent = "";
  window.scrollTo(0, qvScroll);
};

// The quiz's back arrow, from its selection screen: back to the cards
const qvLeave = () => {
  if (qvPushed) { qvPushed = false; history.back(); return; }
  history.replaceState(null, "", location.pathname + location.search);  // opened from a link: no page to go back to
  qvRoute();
};

const qvRoute = () => {
  const m = location.hash.match(/^#quiz\/([\w-]+)$/);
  if (m) qvShow(m[1]); else qvHide();
};

document.addEventListener("click", e => {
  if (e.target.closest && e.target.closest(".quizlink") && !e.ctrlKey && !e.metaKey && !e.shiftKey) qvPushed = true;
});
window.addEventListener("hashchange", qvRoute);
// A search typed while a quiz is open is a search of the cards: show them
document.getElementById("search").addEventListener("input", () => {
  if (document.body.classList.contains("quizzing")) qvLeave();
});
qvRoute();  // the page opened on #quiz/<id>
