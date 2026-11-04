(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");

  // Barra de progresso de leitura e sombra do cabeçalho
  let bar = null;
  if (!reduce) {
    bar = document.createElement("div");
    bar.className = "fx-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
  }
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY || 0;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();

  // Revelação suave ao rolar (melhoria progressiva: sem JS/observer, tudo continua visível)
  if (reduce || !("IntersectionObserver" in window)) return;
  const targets = document.querySelectorAll("main section:not(.hero) .wrap > *");
  if (!targets.length) return;
  document.documentElement.classList.add("fx-ready");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("fx-in"); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
  targets.forEach((el, i) => { el.classList.add("fx-reveal"); el.style.setProperty("--fx-delay", (i % 3) * 0.08 + "s"); io.observe(el); });
  // Segurança: nada fica escondido se algo falhar
  setTimeout(() => targets.forEach((el) => el.classList.add("fx-in")), 6000);
})();
