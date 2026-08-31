const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".site-nav a");
const featureVideo = document.querySelector("[data-feature-video]");
const rotatingOutcome = document.querySelector("[data-outcome-text]");
const siteNav = document.querySelector(".site-nav");
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");

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
  let isVideoReady = false;

  const revealFeatureVideo = () => {
    if (reduceMotion.matches || isVideoReady) {
      return;
    }

    isVideoReady = true;
    featureVideo.classList.add("is-ready");
  };

  const syncFeatureVideoPlayback = () => {
    if (reduceMotion.matches) {
      isVideoReady = false;
      featureVideo.classList.remove("is-ready");
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

  if (featureVideo.readyState >= 2) {
    revealFeatureVideo();
  } else {
    featureVideo.addEventListener("loadeddata", revealFeatureVideo, { once: true });
    featureVideo.addEventListener("canplay", revealFeatureVideo, { once: true });
  }

  featureVideo.addEventListener("loadedmetadata", syncFeatureVideoPlayback, { once: true });
  syncFeatureVideoPlayback();

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", syncFeatureVideoPlayback);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(syncFeatureVideoPlayback);
  }
}

if (rotatingOutcome) {
  const outcomes = ["customers", "traffic", "sales", "enquiries"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const transitionMs = 320;
  const holdMs = 3000;
  let outcomeIndex = 0;
  let outcomeTimeoutId = null;

  const clearOutcomeTimer = () => {
    if (outcomeTimeoutId !== null) {
      window.clearTimeout(outcomeTimeoutId);
      outcomeTimeoutId = null;
    }
  };

  const setOutcomeWord = (word) => {
    rotatingOutcome.textContent = word;
    rotatingOutcome.classList.remove("is-entering", "is-exiting");
  };

  const queueNextOutcome = () => {
    clearOutcomeTimer();

    if (reduceMotion.matches || document.hidden) {
      return;
    }

    outcomeTimeoutId = window.setTimeout(() => {
      rotatingOutcome.classList.add("is-exiting");

      window.setTimeout(() => {
        outcomeIndex = (outcomeIndex + 1) % outcomes.length;
        rotatingOutcome.textContent = outcomes[outcomeIndex];
        rotatingOutcome.classList.remove("is-exiting");
        rotatingOutcome.classList.add("is-entering");

        window.setTimeout(() => {
          rotatingOutcome.classList.remove("is-entering");
          queueNextOutcome();
        }, transitionMs);
      }, transitionMs);
    }, holdMs);
  };

  const syncOutcomeRotation = () => {
    clearOutcomeTimer();

    if (reduceMotion.matches) {
      outcomeIndex = 0;
      setOutcomeWord(outcomes[outcomeIndex]);
      return;
    }

    if (document.hidden) {
      return;
    }

    setOutcomeWord(outcomes[outcomeIndex]);
    queueNextOutcome();
  };

  syncOutcomeRotation();
  document.addEventListener("visibilitychange", syncOutcomeRotation);

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", syncOutcomeRotation);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(syncOutcomeRotation);
  }
}
