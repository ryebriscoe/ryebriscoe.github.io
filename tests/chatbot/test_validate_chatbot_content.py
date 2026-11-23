import copy
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))

from validate_chatbot_content import validate  # noqa: E402


def make_valid():
    docs = []
    for i in range(18):
        docs.append({
            "id": f"cst-{100 + i}",
            "type": "course",
            "title": f"CST {100 + i} Course",
            "url": f"/courses/cst-{100 + i}/",
            "status": "completed",
            "text": "Built a thing.\n\nLearned a lot.",
        })
    for slug in ("bad", "video-pipeline", "swipemail"):
        docs.append({
            "id": f"project-{slug}",
            "type": "page",
            "title": slug,
            "url": "/projects/",
            "text": "A project paragraph.",
        })
    for slug in ("a", "b", "c", "d"):
        docs.append({
            "id": f"cert-{slug}",
            "type": "certification",
            "title": slug,
            "url": "/certifications/",
            "text": "Issuer. Blurb.",
        })
    return {"generated": "2026-11-12T00:00:00Z", "documents": docs}


def test_valid_file_passes():
    assert validate(make_valid()) == []


def test_wrong_course_count_fails():
    data = make_valid()
    data["documents"].pop(0)
    errors = validate(data)
    assert any("expected 18 course documents" in e for e in errors)


def test_duplicate_id_fails():
    data = make_valid()
    data["documents"].append(copy.deepcopy(data["documents"][-1]))
    data["documents"][-1]["type"] = "page"
    assert any("duplicate id" in e for e in validate(data))


def test_missing_required_field_fails():
    data = make_valid()
    del data["documents"][0]["url"]
    assert any("missing url" in e for e in validate(data))


@pytest.mark.parametrize("leak", ["TODO", "{%", "{{", "<p>", "@@"])
def test_template_leak_fails(leak):
    data = make_valid()
    data["documents"][3]["text"] = f"Some text {leak} here."
    assert any("leak" in e for e in validate(data))


def test_empty_text_and_catalog_fails():
    data = make_valid()
    data["documents"][0]["text"] = ""
    errors = validate(data)
    assert any("no content" in e for e in errors)


def test_empty_text_with_catalog_passes():
    data = make_valid()
    data["documents"][0]["text"] = ""
    data["documents"][0]["catalog"] = "Catalog description."
    assert validate(data) == []


def test_expected_counts_come_from_the_site(tmp_path):
    from validate_chatbot_content import expected_counts

    (tmp_path / "_courses").mkdir()
    for code in ("100", "200"):
        (tmp_path / "_courses" / f"cst-{code}.md").write_text("---\ncode: x\n---\n", encoding="utf-8")
    (tmp_path / "_data").mkdir()
    (tmp_path / "_data" / "certifications.yml").write_text(
        "# comment\n- name: A\n  status: completed\n- name: B\n  status: planned\n- name: C\n", encoding="utf-8"
    )
    assert expected_counts(tmp_path) == (2, 3)


def test_real_site_counts_match_its_files():
    from validate_chatbot_content import expected_counts

    site = Path(__file__).resolve().parents[2]
    courses, certs = expected_counts(site)
    assert courses == len(list((site / "_courses").glob("*.md")))
    assert certs >= 1
