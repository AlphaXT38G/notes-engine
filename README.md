# notes-engine

The engine behind a notes site: it compiles the LaTeX subjects of a **notes repository** to PDF
and writes `dist/index.html`, a single-page index of all the PDFs, with first-page previews, a
search into the documents' text, "New" badges, a dark mode, and a lot of personality (screens that
follow the clock, Christmas, Halloween, easter eggs...).

It knows nothing about any particular notes: everything specific lives in the notes repository.

## A notes repository

```
subjects.json     [{"id": "algo", "name": "Algorithms", "exam": ""}, ...]
site.json         optional: title, subtitle, short, repo, kinds, ... (defaults: notes_engine/config.py)
algo/course.tex   \usepackage{course}  (the engine's style, no path needed)
```

```bash
pip install git+https://github.com/AlphaXT38G/notes-engine@v0.1.0   # pin a tag
notes-engine                    # compile every subject, then dist/index.html
notes-engine algo               # one subject
notes-engine --index-only       # only the page
notes-engine --root ../notes    # build another directory
```

Needs `latexmk`; `pdftoppm` / `pdftotext` (poppler) and `node` are optional (previews, search, a
syntax check of the page). A reusable GitHub Pages workflow is in `.github/workflows/pages.yml` (its header shows the
10 lines a notes repository needs). A runnable minimal notes repository is in `example/`.

## Starting a new semester (notes_ba6, ...)

1. Create the repository and copy `subjects.json`, `site.json`, `requirements.txt`, `.gitignore`
   and `.github/workflows/pages.yml` from the previous semester (or from `example/`).
2. In `site.json`, change `title`, `short`, `subtitle` and `repo` (`owner/name`, the link in the
   PDFs' footer). Empty the subjects of `subjects.json` and add yours.
3. Put each subject in a folder (`course.tex` with `\usepackage{course}`, `cheatsheet.tex`, `week/`).
4. Enable GitHub Pages (Settings, Pages, source: GitHub Actions), then push to `main`.

`site.json` settings and their defaults are listed in `notes_engine/config.py` (`DEFAULTS`); an
unknown name is an error, so a typo does not go unnoticed.

## Versions

A notes repository pins a tag of the engine, in `requirements.txt` and in its `pages.yml` (the
`uses:` line and `engine-ref`). To upgrade, change the tag in all three places. A change to what
the engine reads from a notes repository (a setting, a file name) always comes with a new tag.

## Contributing

Read [`AGENTS.md`](AGENTS.md): the layout, the screens engine, how to add a screen, the rules for
code that must also run on older phones.

## History

The engine was written inside [notes_ba5](https://github.com/AlphaXT38G/notes_ba5), where its full
history and authorship are kept (`builder/`, `site/`, `_shared/`, `tools/` before the extraction).
This repository starts at the extraction.
