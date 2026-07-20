/* ============================================================
   Diagram player + scroll reveal
   ------------------------------------------------------------
   Each .diagram-card contains:
     - an inline SVG whose elements carry data-s="1,3,4"
       (the step numbers in which the element is ACTIVE)
     - a <script type="application/json" class="steps"> block
       with [{label, text}, ...] captions
     - a .player container (controls injected here)
   Elements with class "dimmable" fade out when not active.
   Elements with data-pulse="stepN" only render during that step.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- diagram player ---------- */
  class DiagramPlayer {
    constructor(card) {
      this.card = card;
      this.svg = card.querySelector("svg");
      const stepsEl = card.querySelector("script.steps");
      this.steps = stepsEl ? JSON.parse(stepsEl.textContent) : [];
      this.playerEl = card.querySelector(".player");
      this.current = 0; // 0 = overview (everything visible)
      this.timer = null;
      this.playing = false;
      this.autoDelay = 4200;

      if (!this.svg || !this.playerEl || this.steps.length === 0) return;

      this.buildControls();
      this.show(0);

      // auto-play once when scrolled into view
      const vio = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting && !this.everPlayed) {
              this.everPlayed = true;
              setTimeout(() => this.play(), 900);
              vio.unobserve(this.card);
            }
          }
        },
        { threshold: 0.45 }
      );
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        vio.observe(this.card);
      }
    }

    buildControls() {
      const cap = document.createElement("div");
      cap.className = "caption";
      const controls = document.createElement("div");
      controls.className = "controls";

      this.btnPlay = this.mkBtn("▶ Play", () => this.toggle());
      this.btnPrev = this.mkBtn("←", () => {
        this.pause();
        this.show(this.current <= 0 ? this.total() : this.current - 1);
      });
      this.btnNext = this.mkBtn("→", () => {
        this.pause();
        this.show((this.current + 1) % (this.total() + 1));
      });

      const dots = document.createElement("div");
      dots.className = "dots";
      this.dots = [];
      for (let i = 0; i <= this.total(); i++) {
        const d = document.createElement("button");
        d.setAttribute("aria-label", i === 0 ? "Overview" : "Step " + i);
        d.addEventListener("click", () => {
          this.pause();
          this.show(i);
        });
        dots.appendChild(d);
        this.dots.push(d);
      }

      controls.append(this.btnPlay, this.btnPrev, this.btnNext, dots);
      this.captionEl = cap;
      this.playerEl.append(cap, controls);
    }

    mkBtn(label, fn) {
      const b = document.createElement("button");
      b.textContent = label;
      b.addEventListener("click", fn);
      return b;
    }

    total() {
      return this.steps.length - 1; // steps[0] is the overview caption
    }

    show(i) {
      this.current = i;
      const step = this.steps[i];

      // caption
      const label =
        i === 0
          ? "OVERVIEW"
          : "STEP " + i + " / " + this.total();
      this.captionEl.innerHTML =
        '<span class="step-label">' + label + "</span>" + step.text;

      // dim logic: at overview (0) everything is visible
      this.svg.querySelectorAll(".dimmable").forEach((el) => {
        if (i === 0) {
          el.classList.remove("dim");
          return;
        }
        const s = (el.getAttribute("data-s") || "")
          .split(",")
          .map((x) => parseInt(x.trim(), 10));
        el.classList.toggle("dim", !s.includes(i));
      });

      // step-scoped pulses/anim groups
      this.svg.querySelectorAll("[data-pulse]").forEach((el) => {
        const v = el.getAttribute("data-pulse");
        el.style.display = v === "always" || v === "step" + i ? "" : "none";
      });

      // dots
      this.dots.forEach((d, k) => d.classList.toggle("on", k === i));
    }

    play() {
      if (this.playing) return;
      this.playing = true;
      this.btnPlay.textContent = "❚❚ Pause";
      const tick = () => {
        const next = this.current + 1;
        if (next > this.total()) {
          this.show(0);
          this.pause();
          return;
        }
        this.show(next);
        this.timer = setTimeout(tick, this.autoDelay);
      };
      this.timer = setTimeout(tick, this.current === 0 ? 1400 : this.autoDelay);
    }

    pause() {
      this.playing = false;
      this.btnPlay.textContent = "▶ Play";
      clearTimeout(this.timer);
    }

    toggle() {
      this.playing ? this.pause() : this.play();
    }
  }

  document
    .querySelectorAll(".diagram-card")
    .forEach((card) => new DiagramPlayer(card));
})();
