"""Serve a folder over HTTP with byte ranges, so that the browser can seek in an audio file.

`python -m http.server` ignores the Range header: wound or restarted, a track of notes-musics
served by it plays again from its start. GitHub Pages answers ranges, and so does this server,
for a local preview of the music (see "Build and preview locally" in AGENTS.md):

    python tools/serve.py 8766 ../notes-musics
"""
import os
import re
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

RANGE = re.compile(r"bytes=(\d*)-(\d*)$")


class RangeHandler(SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler, answering a single byte range with 206 Partial Content."""

    left = None  # bytes still to send for a range, None for a whole file

    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        match = RANGE.match(self.headers.get("Range") or "")
        if not match or not os.path.isfile(path) or not (match[1] or match[2]):
            return super().send_head()
        size = os.path.getsize(path)
        if match[1]:  # bytes=start- or bytes=start-end
            start, end = int(match[1]), min(int(match[2] or size - 1), size - 1)
        else:  # bytes=-n: the last n bytes
            start, end = max(0, size - int(match[2])), size - 1
        if start >= size or start > end:
            self.send_error(416, "Range Not Satisfiable")
            return None
        source = open(path, "rb")
        source.seek(start)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        self.left = end - start + 1
        return source

    def copyfile(self, source, outputfile):
        try:
            if self.left is None:
                super().copyfile(source, outputfile)
                return
            while self.left > 0:
                chunk = source.read(min(1 << 16, self.left))
                if not chunk:
                    break
                outputfile.write(chunk)
                self.left -= len(chunk)
        except ConnectionError:
            pass  # the browser often drops a range it no longer needs (a seek elsewhere)
        finally:
            self.left = None


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8766
    folder = sys.argv[2] if len(sys.argv) > 2 else "."
    server = ThreadingHTTPServer(("", port), partial(RangeHandler, directory=folder))
    print(f"Serving {os.path.abspath(folder)} at http://localhost:{port}/ (byte ranges)")
    server.serve_forever()


if __name__ == "__main__":
    main()
