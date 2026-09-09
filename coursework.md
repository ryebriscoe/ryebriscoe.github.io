---
layout: default
title: Coursework
permalink: /coursework/
---

{% assign ordered = site.courses | sort: "code" %}
{% assign online = ordered | where_exp: "c", "c.institution contains 'CS Online'" %}
{% assign campus = ordered | where_exp: "c", "c.institution == 'CSUMB'" %}
{% assign transfer = ordered | where_exp: "c", "c.institution == 'West Valley College'" %}

<h1>Coursework</h1>
<p class="lede">
  Every course on my degree plan, {{ ordered | size }} in total. Each page carries
  the CSUMB catalog description and the final project for that course.
</p>
<p class="lede">
  I am currently going back through my coursework to find the projects and
  assignments worth adding, so the project sections are still filling in.
</p>

<div class="legend">
  <span><i class="swatch done"></i> completed</span>
  <span><i class="swatch active"></i> in progress</span>
  <span><i class="swatch planned"></i> planned</span>
</div>

<h2>CS Online — CSUMB</h2>
{% include grid.html courses=online %}

<h2>On campus — CSUMB</h2>
{% include grid.html courses=campus %}

<h2>Transfer — West Valley College</h2>
<p>
  Lower-division prerequisites that the CS Online program requires be completed
  outside CSUMB. Each is listed under its CSUMB equivalent.
</p>
{% include grid.html courses=transfer %}
