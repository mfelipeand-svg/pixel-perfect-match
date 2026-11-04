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

  // Progressive reveal: content remains visible when motion is reduced or observer is unavailable.
  const revealTargets = document.querySelectorAll(
    ".intro-grid, .philosophy-grid, .singular-note, .practice-head, .card, .section-heading, .gallery-item, .attend-row"
  );
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealTargets.forEach((element) => element.classList.add("reveal"));
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((element) => revealObserver.observe(element));
  }

})();
