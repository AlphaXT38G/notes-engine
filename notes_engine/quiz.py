"""The quizzes: each subject's quiz/ folder, built by quiz-engine into dist/quiz/.

    <subject>/quiz/*.json   the questions (written in the notes repository, see quiz-engine)
    dist/quiz/quiz.js, quiz.css, <subject>/data.json, <subject>/img/...

How quizzes work (the question types, the selection, the run, the score) is quiz-engine's
business; the engine only builds them and shows them (the Quiz button of page.py, the view of
site/js/quizview.js). quiz-engine is read like the engine itself: on a computer, the checkout
next to the engine (../quiz-engine); on GitHub, the publish workflow fetches it beside the
engine and installs it (.github/workflows/pages.yml, its main by default).
A quiz with a mistake is reported and left out; the rest of the site is built as usual.
"""

import importlib
import shutil
import sys
from pathlib import Path

from . import config
from .log import err, info, ok

SIBLING = Path(__file__).resolve().parents[2] / "quiz-engine"


def engine():
    """The quiz_engine module, or None when it is neither next to the engine nor installed."""
    if (SIBLING / "quiz_engine" / "__init__.py").is_file() and str(SIBLING) not in sys.path:
        sys.path.insert(0, str(SIBLING))
    try:
        return importlib.import_module("quiz_engine")
    except ImportError:
        return None


def build_quizzes():
    """Build every subject's quiz into dist/quiz/; returns {subject id: number of questions}."""
    found = [s["id"] for s in config.P.subjects if (config.P.root / s["id"] / "quiz").is_dir()]
    out = config.P.dist / "quiz"
    if out.is_dir():  # a quiz removed from the notes must not stay online
        for old in out.iterdir():
            if old.is_dir() and old.name not in found:
                shutil.rmtree(old)
    if not found:
        return {}
    qe = engine()
    if qe is None:
        err(f"quizzes of {', '.join(found)} left out: quiz-engine is not installed (nor in {SIBLING})")
        return {}
    warnings = qe.write_runtime(out)
    for w in warnings[:10]:
        err(f"quiz runtime too new for some phone browsers: {w}")
    built = {}
    for sid in found:
        try:
            built[sid] = qe.build_subject(config.P.root / sid / "quiz", out / sid)
        except qe.QuizError as e:
            err(f"quiz of {sid} left out: {e}")
    if built:
        ok(f"quizzes: {', '.join(f'{sid} ({n})' for sid, n in built.items())} (quiz-engine {qe.__version__})")
    else:
        info("no quiz built")
    return built
