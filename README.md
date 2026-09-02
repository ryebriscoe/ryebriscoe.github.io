# ryebriscoe.github.io

Individual Learning Plan and portfolio — B.S. Computer Science, CSU Monterey Bay.

Live at <https://ryebriscoe.github.io>

## Structure

```
_config.yml            site settings, links, program info
_courses/              one Markdown file per course (18)
_layouts/              default, course, page
_includes/             nav, footer, grid
assets/css/main.css    all styling, no framework
index.html             home page
coursework.md          grouped course index
projects.md            B.A.D., video pipeline, SwipeMail
certifications.md      certificates in progress
```

## Adding a course

Create `_courses/cst-XXX.md`:

```yaml
---
code: "XXX"
title: "Course Title"
short: "Short Name"          # shown on grid tiles
institution: "CSUMB, CS Online"
term: "Fall 2026, Term B"
status: completed             # completed | in_progress | planned
units: 4
offered: "Fall, Spring"
prereq: "CST 238 with a C- or better"
catalog: >-
  Catalog description, copied from catalog.csumb.edu
project: "Project Name"
repo: "https://github.com/ryebriscoe/repo"
tech: ["Java", "JUnit"]
---

Project write-up in Markdown.

## What I took from it

Reflection.
```

The home page grid, the coursework page, and the progress counter all read
from these files. Nothing else needs editing.

## Updating a course as you finish it

Change `status` in the front matter and add the project fields. The badge,
tile styling, and counts update automatically.

## Adding the photo

Save the image as `assets/img/ariya.jpg`, then in `_config.yml` set:

```yaml
photo: /assets/img/ariya.jpg
```

## Running locally

Requires Ruby. Install from [rubyinstaller.org](https://rubyinstaller.org/)
(pick the version with Devkit), then:

```
gem install bundler
bundle install
bundle exec jekyll serve
```

Site serves at <http://localhost:4000>.

Not required to publish — GitHub Pages builds on push to `main`.
