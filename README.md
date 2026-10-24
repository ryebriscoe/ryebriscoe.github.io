# Ariya Briscoe | Portfolio and ILP

Live site: **[ryebriscoe.github.io](https://ryebriscoe.github.io)**

This is my portfolio and Individual Learning Plan for my CS degree at CSU Monterey Bay (B.S. Computer Science, Software Engineering concentration). I graduate in Fall 2026.

Every course in my degree has its own page with the catalog description and the main project or work I did for it. There's also a projects page for stuff I've built outside of class, and a certifications page that tracks the certificates I'm doing for my capstone.

## What's on the site

- **Home:** a little about me, my goals, and links to all 18 courses
- **Coursework:** one page per course with the description and my work
- **Projects:** B.A.D. (my basketball computer vision project), my automated video pipeline, and my freelance web work
- **Certifications:** IBM AI Engineering, Generative AI with LLMs, and Google Project Management, with progress bars
- **Resume:** a PDF of my current resume

## Some of the work linked on the site

| Project | Course | What I used |
|---|---|---|
| [Course registration system](https://github.com/cst438-team03-org0/cst438-team-03-registrar) | CST 438 | Java, Spring Boot, JavaScript, AWS |
| [MMU simulator](https://github.com/ryebriscoe/mmu-simulator) | CST 334 | C |
| [JavaFX login app](https://github.com/BriannaTomasek/CST-338-Project-2-JavaFX) | CST 338 | Java, JavaFX, JUnit |
| [Computer networks projects](https://github.com/ryebriscoe/computer-networks-projects) | CST 311 | Java, Python |
| [Tournament database](https://github.com/ryebriscoe/tournament-database) | CST 363 | PostgreSQL |

## How I built it

It's a Jekyll site hosted on GitHub Pages. I wrote the CSS myself instead of using a theme.

Each course is its own Markdown file in `_courses/`. The info at the top of each file (course code, title, status, project, repo link) is what fills in the page. So when I finish a class, I just change its status to `completed` and the homepage count and badges update on their own. Certifications work the same way from `_data/certifications.yml`.

```
_courses/              one file per course
_data/                 certification progress
_layouts/              page templates
_includes/             nav, footer, course grid
assets/css/main.css    all the styling
assets/docs/           PDFs (papers, proposal, resume)
```

## Running it locally

You need Ruby installed.

```bash
bundle install
bundle exec jekyll serve
```

Then open `localhost:4000`. Anything pushed to `main` gets deployed by GitHub Pages.

## Contact

[GitHub](https://github.com/ryebriscoe) | [LinkedIn](https://www.linkedin.com/in/ariya-briscoe-523b653aa/) | ariyabriscoe@gmail.com
