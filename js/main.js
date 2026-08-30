const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".site-nav a");
const featureVideo = document.querySelector("[data-feature-video]");
const siteNav = document.querySelector(".site-nav");
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const previewShell = document.querySelector(".site-preview-shell");

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${id}`;
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

if ("IntersectionObserver" in window && sections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: 0.05,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

if (mobileMenuToggle && siteNav) {
  const setMobileMenu = (open) => {
    mobileMenuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    mobileMenuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    siteNav.classList.toggle("is-open", open);
  };

  mobileMenuToggle.addEventListener("click", () => {
    const expanded = mobileMenuToggle.getAttribute("aria-expanded") === "true";
    setMobileMenu(!expanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMobileMenu(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      setMobileMenu(false);
    }
  });
}

if (featureVideo) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const syncPreviewAspectRatio = () => {
    if (!previewShell || !featureVideo.videoWidth || !featureVideo.videoHeight) {
      return;
    }

    previewShell.style.setProperty("--preview-width", `${featureVideo.videoWidth}`);
    previewShell.style.setProperty("--preview-height", `${featureVideo.videoHeight}`);
  };

  const syncFeatureVideoPlayback = () => {
    syncPreviewAspectRatio();

    if (reduceMotion.matches) {
      featureVideo.pause();
      featureVideo.removeAttribute("autoplay");
      featureVideo.currentTime = 0;
      return;
    }

    featureVideo.setAttribute("autoplay", "");
    featureVideo.muted = true;

    const playAttempt = featureVideo.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {});
    }
  };

  featureVideo.addEventListener("loadedmetadata", syncFeatureVideoPlayback, { once: true });
  featureVideo.addEventListener("loadedmetadata", syncPreviewAspectRatio, { once: true });
  syncFeatureVideoPlayback();

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", syncFeatureVideoPlayback);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(syncFeatureVideoPlayback);
  }
}
