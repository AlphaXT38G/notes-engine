"""Smoke tests: the engine builds the example notes repository (needs latexmk) and reads its settings."""

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HERE))

from notes_engine import config  # noqa: E402

MUSICS = HERE.parent / "notes-musics"  # the music repository, when it sits next to the engine


class SettingsTest(unittest.TestCase):
    def test_site_json_overrides_defaults(self):
        p = config.load(HERE / "example")
        self.assertEqual(p.settings["title"], "Demo notes")
        self.assertEqual(p.settings["new_days"], config.DEFAULTS["new_days"])  # not overridden

    def test_unknown_setting_is_refused(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / "subjects.json").write_text("[]")
            (Path(d) / "site.json").write_text(json.dumps({"titel": "typo"}))
            with self.assertRaises(SystemExit):
                config.load(d)

    def test_music_defaults_to_notes_musics(self):
        p = config.load(HERE / "example")
        self.assertEqual(p.music, "https://alphaxt38g.github.io/notes-musics/")

    def test_notes_music_overrides_the_setting(self):
        old = os.environ.get("NOTES_MUSIC")
        os.environ["NOTES_MUSIC"] = "http://localhost:8766"  # no trailing slash: one is added
        try:
            self.assertEqual(config.load(HERE / "example").music, "http://localhost:8766/")
        finally:
            if old is None:
                del os.environ["NOTES_MUSIC"]
            else:
                os.environ["NOTES_MUSIC"] = old

    def test_missing_subjects_is_refused(self):
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(SystemExit):
                config.load(d)


class MusicTest(unittest.TestCase):
    """The music is named by its path in notes-musics ("jazz/just-one-more-drink.mp3")."""

    # a quoted "<folder>/<file>.<audio>": a track of notes-musics; the sound effects of the engine
    # ("audio/wolf.mp3") and the live streams (https://...) are not
    TRACK = re.compile(r"""["'`]((?!audio/)[a-z0-9-]+/[a-z0-9-]+\.(?:mp3|m4a|ogg|opus|webm))["'`]""")

    def tracks(self):
        found = {}
        for js in sorted((HERE / "notes_engine" / "site" / "js").glob("*.js")):
            for m in self.TRACK.finditer(js.read_text(encoding="utf-8")):
                found.setdefault(m[1], js.name)
        return found

    def test_engine_audio_is_sound_effects_only(self):
        # the engine's audio/ holds short sound effects (the howl: 0.2 MB); music goes to notes-musics
        audio = HERE / "notes_engine" / "site" / "audio"
        big = [p.name for p in audio.iterdir() if p.stat().st_size > 1024 * 1024]
        self.assertEqual(big, [], "music belongs in notes-musics")

    def test_players_name_tracks(self):
        self.assertIn("jazz/just-one-more-drink.mp3", self.tracks())

    @unittest.skipUnless((MUSICS / ".git").exists(), "notes-musics is not cloned next to the engine")
    def test_every_track_is_committed_in_notes_musics(self):
        # its committed files, what GitHub Pages serves (CI clones it without the files' contents)
        committed = set(subprocess.run(["git", "-C", str(MUSICS), "ls-tree", "-r", "--name-only", "HEAD"],
                                       capture_output=True, text=True, check=True).stdout.split())
        missing = [f"{path} (in {js})" for path, js in self.tracks().items() if path not in committed]
        self.assertEqual(missing, [], "not committed in notes-musics")


@unittest.skipUnless(shutil.which("latexmk"), "latexmk is not installed")
class BuildTest(unittest.TestCase):
    def test_example_builds(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d) / "notes"
            shutil.copytree(HERE / "example", root)
            proc = subprocess.run([sys.executable, "-m", "notes_engine", "--root", str(root)],
                                  cwd=HERE, capture_output=True, text=True, encoding="utf-8",
                                  env={**__import__("os").environ, "PYTHONIOENCODING": "utf-8"})
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
            page = (root / "dist" / "index.html").read_text(encoding="utf-8")
            self.assertIn("<title>Demo notes</title>", page)
            self.assertIn('data-short="DEMO"', page)
            self.assertIn('data-music="https://alphaxt38g.github.io/notes-musics/"', page)
            self.assertIn("demo/course.pdf", page)
            self.assertTrue((root / "dist" / "demo" / "course.pdf").is_file())


if __name__ == "__main__":
    unittest.main()
