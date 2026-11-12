"""Validate the chatbot content export (chatbot-content.json).

Usage: python scripts/validate_chatbot_content.py <path-or-url>
Exits 0 when the file is valid, 1 (printing each problem) otherwise.
"""

import json
import sys
import urllib.request

REQUIRED = ("id", "type", "title", "url", "text")
TYPES = {"course", "page", "certification"}
LEAKS = ("TODO", "{%", "{{", "<p>", "@@")


def validate(data, expected_courses=18, expected_certs=4):
    errors = []
    docs = data.get("documents") if isinstance(data, dict) else None
    if not isinstance(docs, list):
        return ["documents must be a list"]

    seen = set()
    counts = {t: 0 for t in TYPES}
    for i, doc in enumerate(docs):
        label = doc.get("id", f"#{i}") if isinstance(doc, dict) else f"#{i}"
        if not isinstance(doc, dict):
            errors.append(f"{label}: not an object")
            continue
        for field in REQUIRED:
            if field not in doc:
                errors.append(f"{label}: missing {field}")
        if doc.get("type") not in TYPES:
            errors.append(f"{label}: unknown type {doc.get('type')!r}")
        else:
            counts[doc["type"]] += 1
        if label in seen:
            errors.append(f"{label}: duplicate id")
        seen.add(label)
        if not str(doc.get("text", "")).strip() and not str(doc.get("catalog", "")).strip():
            errors.append(f"{label}: no content (text and catalog both empty)")
        for key, value in doc.items():
            values = value if isinstance(value, list) else [value]
            for v in values:
                if isinstance(v, str):
                    for leak in LEAKS:
                        if leak in v:
                            errors.append(f"{label}: template leak {leak!r} in {key}")

    if counts["course"] != expected_courses:
        errors.append(f"expected {expected_courses} course documents, found {counts['course']}")
    if counts["certification"] != expected_certs:
        errors.append(f"expected {expected_certs} certification documents, found {counts['certification']}")
    if counts["page"] < 3:
        errors.append(f"expected at least 3 page documents, found {counts['page']}")
    return errors


def load(source):
    if source.startswith(("http://", "https://")):
        with urllib.request.urlopen(source, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    with open(source, encoding="utf-8") as f:
        return json.load(f)


def main(source):
    try:
        data = load(source)
    except (OSError, ValueError) as exc:
        print(f"could not load {source}: {exc}")
        return 1
    errors = validate(data)
    for e in errors:
        print(e)
    if not errors:
        print(f"OK: {len(data['documents'])} documents")
    return 1 if errors else 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
