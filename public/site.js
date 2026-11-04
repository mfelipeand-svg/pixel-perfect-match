(() => {
  document.documentElement.classList.add("js");

  const menu = document.querySelector(".menu");
  const nav = document.querySelector(".nav");

  if (menu && nav) {
    const setMenu = (open) => {
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Fechar navegação" : "Abrir navegação");
      menu.textContent = open ? "×" : "☰";
      nav.classList.toggle("open", open);
    };

    menu.addEventListener("click", () => {
      setMenu(menu.getAttribute("aria-expanded") !== "true");
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menu.focus();
      }
    });
    window.matchMedia("(min-width: 851px)").addEventListener("change", (event) => {
      if (event.matches) setMenu(false);
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Antes/Depois
  document.querySelectorAll("[data-compare]").forEach((box) => {
    const range = box.querySelector(".compare-range");
    const set = (v) => {
      box.style.setProperty("--pos", v + "%");
      range.setAttribute("aria-valuetext", `${v}% antes`);
    };
    range.addEventListener("input", () => set(range.value));
  });

  // Carrossel circular (sem clones)
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("[data-carousel]").forEach((root) => {
    const track = root.querySelector(".carousel-track");
    let busy = false;
    let timer = null;
    let paused = false;
    const stepSize = () => {
      const first = track.firstElementChild;
      return first.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || "0");
    };
    const next = () => {
      if (busy) return;
      if (reduce.matches) { track.append(track.firstElementChild); return; }
      busy = true;
      track.style.transform = `translateX(-${stepSize()}px)`;
      const end = () => {
        track.style.transition = "none";
        track.append(track.firstElementChild);
        track.style.transform = "translateX(0)";
        void track.offsetWidth;
        track.style.transition = "";
        busy = false;
      };
      track.addEventListener("transitionend", end, { once: true });
    };
    const prev = () => {
      if (busy) return;
      if (reduce.matches) { track.prepend(track.lastElementChild); return; }
      busy = true;
      track.style.transition = "none";
      track.prepend(track.lastElementChild);
      track.style.transform = `translateX(-${stepSize()}px)`;
      void track.offsetWidth;
      track.style.transition = "";
      track.style.transform = "translateX(0)";
      track.addEventListener("transitionend", () => { busy = false; }, { once: true });
    };
    root.querySelector("[data-carousel-next]").addEventListener("click", next);
    root.querySelector("[data-carousel-prev]").addEventListener("click", prev);
    const start = () => {
      clearInterval(timer);
      if (!reduce.matches) timer = setInterval(() => { if (!paused && !document.hidden) next(); }, 4000);
    };
    root.addEventListener("mouseenter", () => { paused = true; });
    root.addEventListener("mouseleave", () => { paused = false; });
    root.addEventListener("focusin", () => { paused = true; });
    root.addEventListener("focusout", () => { paused = false; });
    reduce.addEventListener?.("change", start);
    start();
  });

  const dialog = document.querySelector("#lightbox");
  if (!dialog) return;

  const image = dialog.querySelector(".lightbox-image");
  const caption = dialog.querySelector(".lightbox-caption");
  const status = dialog.querySelector(".lightbox-status");
  const indicators = dialog.querySelector(".lightbox-indicators");
  const closeButton = dialog.querySelector(".lightbox-close");
  const previousButton = dialog.querySelector("[data-previous]");
  const nextButton = dialog.querySelector("[data-next]");
  let items = [];
  let activeIndex = 0;
  let returnFocus = null;

  const updateImage = () => {
    const trigger = items[activeIndex];
    const source = trigger.querySelector("img");
    image.src = source.currentSrc || source.src;
    image.alt = source.alt;
    caption.textContent = trigger.dataset.caption || source.alt;
    status.textContent = `${activeIndex + 1} de ${items.length}`;
    previousButton.disabled = items.length < 2;
    nextButton.disabled = items.length < 2;

    Array.from(indicators.children).forEach((indicator, index) => {
      indicator.setAttribute("aria-current", String(index === activeIndex));
    });
  };

  const showImage = (index) => {
    activeIndex = (index + items.length) % items.length;
    updateImage();
  };

  const openLightbox = (trigger) => {
    items = Array.from(
      document.querySelectorAll(
        `[data-lightbox-group="${CSS.escape(trigger.dataset.lightboxGroup)}"]`,
      ),
    );
    activeIndex = items.indexOf(trigger);
    returnFocus = trigger;
    indicators.replaceChildren();

    items.forEach((item, index) => {
      const source = item.querySelector("img");
      const indicator = document.createElement("button");
      indicator.className = "lightbox-indicator";
      indicator.type = "button";
      indicator.setAttribute("aria-label", `Mostrar imagem ${index + 1} de ${items.length}: ${source.alt}`);
      indicator.setAttribute("aria-current", String(index === activeIndex));
      indicator.addEventListener("click", () => showImage(index));
      indicators.append(indicator);
    });

    updateImage();
    dialog.showModal();
    closeButton.focus();
  };

  document.querySelectorAll("[data-lightbox-group]").forEach((trigger) => {
    trigger.addEventListener("click", () => openLightbox(trigger));
  });

  closeButton.addEventListener("click", () => dialog.close());
  previousButton.addEventListener("click", () => showImage(activeIndex - 1));
  nextButton.addEventListener("click", () => showImage(activeIndex + 1));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dialog.close();
    } else if (event.key === "ArrowLeft" && items.length > 1) {
      event.preventDefault();
      showImage(activeIndex - 1);
    } else if (event.key === "ArrowRight" && items.length > 1) {
      event.preventDefault();
      showImage(activeIndex + 1);
    }
  });
  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
    if (returnFocus?.isConnected) returnFocus.focus();
  });
})();
