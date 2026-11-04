"""Smoke tests: the engine builds the example notes repository (needs latexmk) and reads its settings."""

import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HERE))

from notes_engine import config  # noqa: E402


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

    def test_missing_subjects_is_refused(self):
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(SystemExit):
                config.load(d)


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
            self.assertIn("demo/course.pdf", page)
            self.assertTrue((root / "dist" / "demo" / "course.pdf").is_file())


if __name__ == "__main__":
    unittest.main()
