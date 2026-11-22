---
layout: default
title: Certifications
permalink: /certifications/
---

{% assign certs = site.data.certifications %}

<h1>Certifications</h1>
<p class="lede">
  Professional certificates I have earned or am finishing alongside the degree,
  chosen to put production tooling behind the coursework.
</p>
<p>
  <strong><a href="{{ '/assets/docs/capstone-certificate-track-proposal.pdf' | relative_url }}">Certificate Track Proposal</a></strong>
</p>

<ul class="cards">
  {% for c in certs %}
    <li>
      <div class="card cert-card">
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

        {% if c.status == "completed" %}
          <div class="cert-progress">
            <div class="track" aria-hidden="true"><span class="fill is-full" style="width: 100%"></span></div>
            <span class="pct">Completed {{ c.completed }}</span>
          </div>
        {% elsif c.courses_total %}
          {% assign pct = c.courses_done | times: 100 | divided_by: c.courses_total %}
          <div class="cert-progress">
            <div
              class="track"
              role="progressbar"
              aria-valuenow="{{ pct }}"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="{{ c.name }} progress"
            >
              <span class="fill" style="width: {{ pct }}%"></span>
            </div>
            <span class="pct">{{ c.courses_done }} of {{ c.courses_total }} courses complete</span>
          </div>
        {% endif %}

        {% if c.tech %}
          <ul class="chips">
            {% for t in c.tech %}<li>{{ t }}</li>{% endfor %}
          </ul>
        {% endif %}

        <div class="cert-actions">
          {% if c.credential %}
            <a class="btn btn-primary" href="{{ c.credential | relative_url }}" target="_blank" rel="noopener">View certificate</a>
          {% endif %}
          {% if c.verify %}
            <a class="btn" href="{{ c.verify }}" target="_blank" rel="noopener">Verify</a>
          {% endif %}
          {% unless c.credential %}
            <a class="btn" href="{{ c.url }}" target="_blank" rel="noopener">Course details</a>
          {% endunless %}
        </div>
      </div>
    </li>
  {% endfor %}
</ul>
