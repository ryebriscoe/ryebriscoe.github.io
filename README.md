<div align="center">

# Ariya Briscoe — Portfolio & Individual Learning Plan

**[ryebriscoe.github.io](https://ryebriscoe.github.io)**

B.S. Computer Science, Software Engineering concentration
California State University, Monterey Bay · Graduating Fall 2026

</div>

---

A portfolio documenting every course in my Computer Science degree, the project
that came out of each one, and the work I build outside of class.

Built with Jekyll and hand-written CSS. No framework, no template.

## What's in it

| Section | What it covers |
|---|---|
| **[Home](https://ryebriscoe.github.io)** | Background, degree progress, and a transcript grid of all 18 courses |
| **[Coursework](https://ryebriscoe.github.io/coursework/)** | A page per course with the catalog description and my final project |
| **[Projects](https://ryebriscoe.github.io/projects/)** | Work outside of class, including a basketball computer vision system |
| **[Certifications](https://ryebriscoe.github.io/certifications/)** | AI engineering and project management certificates, with live progress |

## Selected work linked from the site

| Project | Course | Stack |
|---|---|---|
| [Course registration system](https://github.com/cst438-team03-org0/cst438-team-03-registrar) | CST 438 | Java · Spring Boot · JavaScript · AWS EC2 |
| [MMU simulator](https://github.com/ryebriscoe/mmu-simulator) | CST 334 | C · virtual memory · paging |
| [JavaFX login app](https://github.com/BriannaTomasek/CST-338-Project-2-JavaFX) | CST 338 | Java · JavaFX · JUnit |
| [Computer networks projects](https://github.com/ryebriscoe/computer-networks-projects) | CST 311 | Java · Python · DNS · sockets |
| [Tournament database](https://github.com/ryebriscoe/tournament-database) | CST 363 | PostgreSQL · schema design |
| [Video pipeline](https://github.com/ryebriscoe/video-pipeline) | Personal | Python · GitHub Actions · LLM APIs |

## How it's built

Course pages are a Jekyll collection, one Markdown file per course. Front matter
carries the structured data and the body carries the write-up:

```yaml
---
code: "338"
title: "Software Design"
status: completed          # completed | in_progress | planned
term: "Spring 2026, Term B"
project: "Login and Registration App (JavaFX)"
repo: "https://github.com/..."
tech: ["Java", "JavaFX", "JUnit", "Gradle"]
---
```

One layout renders all 18 pages. The home page transcript grid, the status
badges, and the progress counter are all derived from those files, so marking a
course finished is a one-word edit and nothing else has to change. Certificates
work the same way through `_data/certifications.yml`.

Styling is about 500 lines of CSS built on custom properties, with no framework
and no build step beyond Jekyll itself.

```
_config.yml            site settings
_courses/              one file per course (18)
_data/                 certifications
_layouts/              default, course
_includes/             nav, footer, course grid
assets/css/main.css    all styling
```

## Running locally

Requires Ruby.

```bash
bundle install
bundle exec jekyll serve
```

Serves at `localhost:4000`. GitHub Pages builds and deploys on push to `main`.

---

<div align="center">

[GitHub](https://github.com/ryebriscoe) ·
[LinkedIn](https://www.linkedin.com/in/ariya-briscoe-523b653aa/) ·
ariyabriscoe@gmail.com

</div>
