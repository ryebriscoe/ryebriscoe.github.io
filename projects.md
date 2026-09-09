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

<h2>B.A.D. — basketball action detection</h2>
<p class="lede">
  <span class="badge is-in_progress">in progress</span> &nbsp; private repository
</p>

<p>
  A zero-shot system that watches a basketball clip and names the offensive play
  being run: pick and roll, Spain pick-and-roll, horns, floppy, pistol, or
  transition. The model is never shown the answer; a held-out label set is used
  only to score how often it is right.
</p>

<p>
  A Roboflow computer vision model detects players, the ball, and the rim in each
  frame. A tracking layer follows each player across frames, separates the two
  teams by jersey color, projects positions onto a court diagram, and flags shot
  attempts. That structure is rendered back onto the clip as boxes, player IDs,
  and team tags. A vision-language model (Qwen3-VL) then watches the annotated
  video and returns, in strict JSON, the play it believes is being run and its
  reasoning. Unlabeled clips can be run blind through the same path.
</p>

<p>
  The notebook is generated from a single build script rather than edited
  directly, so the Colab artifact and the source stay in sync.
</p>

<ul class="chips">
  <li>Python</li>
  <li>Roboflow</li>
  <li>Qwen3-VL</li>
  <li>Computer vision</li>
  <li>Object tracking</li>
  <li>Google Colab</li>
</ul>

<h2>Automated video content pipeline</h2>
<p class="lede">
  <a href="https://github.com/ryebriscoe/video-pipeline">github.com/ryebriscoe/video-pipeline</a>
</p>

<p>
  An end-to-end content system that takes a scheduled trigger and produces a
  published video with no human in the loop. Five stages run in sequence: Reddit ingest, script generation, speech
  synthesis, video render, and upload. Each one is isolated in its own module
  behind a defined interface.
</p>

<p>
  The ingest stage pulls and scores trending story candidates, maintaining a
  replenishing database so the pipeline never runs dry. Script generation selects
  the next story and drafts narration and hooks through the Claude API. Narration
  is synthesized with ElevenLabs, then composited into a vertical render with
  background footage, timed captions, logo, and music. Distribution publishes via
  the YouTube Data API using an OAuth refresh-token flow, with a parallel export
  path to Instagram and Facebook, and an analytics stage that pulls view and
  engagement metrics after publish.
</p>

<p>
  Seven GitHub Actions workflows run it unattended: daily generation and upload,
  weekly bulk generation, story replenishment, analytics collection, plus health
  check and reset workflows for failure recovery. Assets live in Cloudflare R2
  and secrets are injected through Actions rather than committed. A pytest suite
  covers the pipeline stages, config management, story management, and the API
  layer, and a local Flask dashboard provides run monitoring during development.
</p>

<ul class="chips">
  <li>Python</li>
  <li>Claude API</li>
  <li>ElevenLabs</li>
  <li>YouTube Data API</li>
  <li>Cloudflare R2</li>
  <li>GitHub Actions</li>
  <li>pytest</li>
  <li>Flask</li>
</ul>

<h2>SwipeMail</h2>
<p class="lede">
  <a href="https://github.com/ryebriscoe/swipemail">github.com/ryebriscoe/swipemail</a>
</p>

<p>
  A gamified email triage client. Messages are presented as a card deck you swipe
  through rather than a list you scroll, with XP and daily goals to make clearing
  an inbox a bounded task with an end state instead of an open-ended one.
</p>

<ul class="chips">
  <li>React</li>
  <li>Vite</li>
  <li>Framer Motion</li>
  <li>JavaScript</li>
</ul>

{% comment %}
TODO: add a screenshot or short clip for each project.
Drop images in assets/img/ and reference them here.
For B.A.D., an annotated frame with detection boxes.
{% endcomment %}
