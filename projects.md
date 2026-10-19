---
layout: default
title: Projects
permalink: /projects/
---

<h1>Projects</h1>
<p class="lede">
  Work outside of coursework. Course projects live on their
  <a href="{{ '/coursework/' | relative_url }}">individual course pages</a>.
</p>

<h2>B.A.D. (Basketball Action Detector)</h2>
<p class="lede">
  <span class="badge is-in_progress">in progress</span> &nbsp; independent research &middot; private repository
</p>

<p>
  A computer vision system that watches NBA broadcast footage and names the
  offensive play being run: pick and roll, Spain pick and roll, horns, floppy,
  pistol, or transition. The model is never shown the answer. A held-out label
  set is only used to score how often it gets it right.
</p>

<p>
  It runs as a multi-stage pipeline. RF-DETR detects players, the ball, and the
  rim in each frame. ByteTrack follows each player across frames, and players are
  split into teams by jersey color. EasyOCR reads the scoreboard, and a homography
  maps player positions onto a court diagram. All of that is drawn back onto the
  clip, and Qwen3-VL, the vision-language model at the core, watches the annotated
  video and returns the play it thinks is being run and why, in strict JSON.
</p>

<p>
  The Colab notebook is generated from a single builder script instead of being
  edited by hand, so the notebook and the source never drift apart.
</p>

<ul class="chips">
  <li>Python</li>
  <li>Qwen3-VL</li>
  <li>RF-DETR</li>
  <li>ByteTrack</li>
  <li>EasyOCR</li>
  <li>Homography</li>
  <li>Google Colab</li>
</ul>

<h2>Automated short-form video pipeline</h2>
<p class="lede">2025</p>

<p>
  A fully hands-off pipeline that writes, narrates, assembles, and publishes
  kids' educational short-form videos to YouTube, Instagram, and TikTok. It has
  produced 200+ videos and 600K+ total views.
</p>

<p>
  The Claude API writes each script, gTTS turns it into narration,
  Pollinations.AI generates the visuals, and FFmpeg puts it all together into a
  finished vertical video. n8n orchestrates the whole workflow on Railway.app, so
  videos go out on a schedule across all three platforms without me touching
  anything.
</p>

<ul class="chips">
  <li>Claude API</li>
  <li>gTTS</li>
  <li>Pollinations.AI</li>
  <li>FFmpeg</li>
  <li>n8n</li>
  <li>Railway</li>
</ul>

<h2>Freelance web development</h2>
<p class="lede">Self-employed &middot; Feb 2026 to present</p>

<p>
  I design, build, and launch responsive multi-page websites for small
  businesses. So far that is three clients: a wellness practice, a card-reading
  service, and a staffing firm.
</p>

<p>
  Every project starts with a requirements call and a client questionnaire, so I
  know how their booking and payment process already works before I build
  anything. For the booking flow I integrated the Cal.com scheduling API, with
  appointments that need the owner's approval. Sites deploy on Cloudflare Pages
  with custom domains, and each release is versioned on GitHub.
</p>

<ul class="chips">
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
  <li>Cal.com API</li>
  <li>Cloudflare Pages</li>
  <li>GitHub</li>
</ul>

{% comment %}
TODO: add a screenshot or short clip for each project.
Drop images in assets/img/ and reference them here.
For B.A.D., an annotated frame with detection boxes.
{% endcomment %}
