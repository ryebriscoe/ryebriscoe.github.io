---
layout: default
title: Certifications
permalink: /certifications/
---

{% assign certs = site.data.certifications %}

<h1>Certifications</h1>
<p class="lede">
  Professional certificates I am working through alongside the degree, chosen to
  put production tooling behind the coursework.
</p>

<ul class="cards">
  {% for c in certs %}
    <li>
      <a class="card" href="{{ c.url }}">
        <h3>{{ c.name }}</h3>
        <p class="meta">
          <span class="badge is-{{ c.status }}">
            {%- case c.status -%}
              {%- when "completed" -%}completed
              {%- when "in_progress" -%}in progress
              {%- else -%}planned
            {%- endcase -%}
          </span>
          {{ c.issuer }}
        </p>

        <p>{{ c.blurb }}</p>

        {% if c.progress %}
          <div class="cert-progress">
            <div
              class="track"
              role="progressbar"
              aria-valuenow="{{ c.progress }}"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="{{ c.name }} progress"
            >
              <span
                class="fill{% if c.progress >= 100 %} is-full{% endif %}"
                style="width: {{ c.progress }}%"
              ></span>
            </div>
            <span class="pct">{{ c.progress }}% complete</span>
          </div>
        {% endif %}

        {% if c.tech %}
          <ul class="chips">
            {% for t in c.tech %}<li>{{ t }}</li>{% endfor %}
          </ul>
        {% endif %}
      </a>
    </li>
  {% endfor %}
</ul>

{% comment %}
TODO: add the percentage for Generative AI with Large Language Models in
_data/certifications.yml, and a progress value for Google Advanced Data
Analytics once you start it. Swap status to completed and add a credential
link as each one finishes.
{% endcomment %}
