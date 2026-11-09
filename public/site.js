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

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = carousel.querySelector("[data-dots]");
    const status = carousel.querySelector("[data-status]");
    const toggle = carousel.querySelector("[data-toggle]");
    const previous = carousel.querySelector("[data-previous]");
    const next = carousel.querySelector("[data-next]");

    if (!slides.length || !dots || !status || !previous || !next) return;

    let activeIndex = 0;
    let timer = 0;

    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };

    const show = (index, announce) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, position) => {
        const active = position === activeIndex;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });
      Array.from(dots.children).forEach((dot, position) => {
        dot.setAttribute("aria-current", String(position === activeIndex));
      });
      status.textContent = `${activeIndex + 1} de ${slides.length}`;
      status.setAttribute("aria-live", announce ? "polite" : "off");
    };

    const start = () => {
      stop();
      if (document.hidden) return;
      timer = window.setInterval(() => show(activeIndex + 1, false), 3000);
    };

    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.className = "carousel-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Mostrar foto ${index + 1} de ${slides.length}`);
      dot.setAttribute("aria-current", String(index === activeIndex));
      dot.addEventListener("click", () => {
        show(index, true);
        start();
      });
      dots.append(dot);
    });

    previous.addEventListener("click", () => {
      show(activeIndex - 1, true);
      start();
    });
    next.addEventListener("click", () => {
      show(activeIndex + 1, true);
      start();
    });
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        show(activeIndex - 1, true);
        start();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        show(activeIndex + 1, true);
        start();
      }
    });
    document.addEventListener("visibilitychange", start);
    show(activeIndex, false);
    start();
  });

  document.querySelectorAll("[data-marquee]").forEach((marquee) => {
    const track = marquee.querySelector("[data-marquee-track]");
    const originalSet = track?.querySelector(".gallery-set");
    const toggle = marquee.querySelector("[data-marquee-toggle]");
    const toggleLabel = toggle?.querySelector("[data-marquee-label]");

    if (!track || !originalSet || !toggle || !toggleLabel) return;

    const duplicateSet = originalSet.cloneNode(true);
    duplicateSet.dataset.marqueeClone = "";
    duplicateSet.setAttribute("aria-hidden", "true");
    duplicateSet.querySelectorAll("button").forEach((button) => {
      button.tabIndex = -1;
      button.removeAttribute("data-lightbox-group");
    });
    track.append(duplicateSet);

    let userPaused = false;
    let hovered = false;
    let focused = false;

    const updatePauseState = () => {
      const reduced = reducedMotion.matches;
      const paused = userPaused || reduced || document.hidden || hovered || focused;
      marquee.classList.toggle("is-paused", paused);
      toggle.disabled = reduced;
      toggle.setAttribute("aria-pressed", String(userPaused || reduced));
      toggle.setAttribute("aria-label", userPaused ? "Retomar movimento da galeria" : "Pausar movimento da galeria");
      toggleLabel.textContent = userPaused ? "Retomar movimento" : "Pausar movimento";
      toggle.firstElementChild.textContent = userPaused ? "▶" : "Ⅱ";
      if (reduced) {
        toggle.setAttribute("aria-label", "Movimento pausado pela preferência de movimento reduzido");
        toggleLabel.textContent = "Movimento reduzido";
      }
    };

    toggle.addEventListener("click", () => {
      userPaused = !userPaused;
      updatePauseState();
    });
    marquee.addEventListener("mouseenter", () => {
      hovered = true;
      updatePauseState();
    });
    marquee.addEventListener("mouseleave", () => {
      hovered = false;
      updatePauseState();
    });
    marquee.addEventListener("focusin", (event) => {
      focused = true;
      const focusedItem = event.target.closest(".gallery-item");
      if (focusedItem) {
        track.style.animation = "none";
        track.style.transform = "translateX(0)";
        window.requestAnimationFrame(() => {
          const viewport = marquee.getBoundingClientRect();
          const item = focusedItem.getBoundingClientRect();
          let offset = 0;
          if (item.left < viewport.left) {
            offset = viewport.left - item.left;
          } else if (item.right > viewport.right) {
            offset = viewport.right - item.right;
          }
          track.style.transform = `translateX(${offset}px)`;
        });
      }
      updatePauseState();
    });
    marquee.addEventListener("focusout", (event) => {
      if (!marquee.contains(event.relatedTarget)) {
        focused = false;
        if (!userPaused) {
          track.style.removeProperty("animation");
          track.style.removeProperty("transform");
        }
        updatePauseState();
      }
    });
    marquee.addEventListener("pointerdown", () => {
      hovered = true;
      updatePauseState();
    });
    marquee.addEventListener("pointerup", () => {
      hovered = false;
      updatePauseState();
    });
    marquee.addEventListener("pointercancel", () => {
      hovered = false;
      updatePauseState();
    });
    document.addEventListener("visibilitychange", updatePauseState);
    reducedMotion.addEventListener("change", updatePauseState);
    updatePauseState();
  });

  document.querySelectorAll("[data-before-after]").forEach((slider) => {
    const range = slider.querySelector("[data-before-after-range]");
    const beforeLayer = slider.querySelector("[data-before-layer]");
    const afterLayer = slider.querySelector("[data-after-layer]");

    if (!range || !beforeLayer || !afterLayer) return;

    const updateSplit = () => {
      const position = Number(range.value);
      slider.style.setProperty("--split", `${position}%`);
      range.setAttribute("aria-valuetext", `Imagem de antes visível em ${position}% da área`);
    };

    range.addEventListener("input", updateSplit);
    updateSplit();

    const beforeSource = slider.dataset.beforeSrc.trim();
    const afterSource = slider.dataset.afterSrc.trim();
    if (!beforeSource && !afterSource) return;

    if (!beforeSource || !afterSource) {
      slider.classList.add("is-error");
      slider.querySelectorAll(".before-after-empty small").forEach((message) => {
        message.textContent = "Informe os caminhos das duas imagens no HTML.";
      });
      return;
    }

    let loadedImages = 0;
    let failedImage = false;
    const addImage = (layer, source, alt, label) => {
      const image = document.createElement("img");
      image.alt = alt;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("load", () => {
        loadedImages += 1;
        if (loadedImages === 2 && !failedImage) {
          range.disabled = false;
          slider.classList.add("is-ready");
        }
      }, { once: true });
      image.addEventListener("error", () => {
        failedImage = true;
        slider.classList.remove("is-ready");
        slider.classList.add("is-error");
        range.disabled = true;
        const message = document.createElement("p");
        message.className = "before-after-load-error";
        message.setAttribute("role", "alert");
        message.textContent = `Não foi possível carregar a imagem de ${label}. Verifique o caminho do arquivo.`;
        layer.replaceChildren(message);
      }, { once: true });
      image.src = source;
      layer.replaceChildren(image);
    };

    addImage(beforeLayer, beforeSource, slider.dataset.beforeAlt, "antes");
    addImage(afterLayer, afterSource, slider.dataset.afterAlt, "depois");
    range.disabled = false;
    slider.classList.add("is-ready");
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
