const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".site-nav a");
const featureVideo = document.querySelector("[data-feature-video]");
const rotatingOutcome = document.querySelector("[data-outcome-text]");
const siteNav = document.querySelector(".site-nav");
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const themePreference = window.matchMedia("(prefers-color-scheme: dark)");

const getSystemTheme = () => (themePreference.matches ? "dark" : "light");
const getThemeColor = (theme) => (theme === "dark" ? "#353839" : "#F3F0EB");

const updateThemeColor = (theme) => {
  const color = getThemeColor(theme);

  document.documentElement.style.backgroundColor = color;
  if (document.body) {
    document.body.style.backgroundColor = color;
  }

  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", color);
    // Re-attaching prompts Safari to re-evaluate the browser chrome color.
    document.head.append(themeColorMeta);
  }
};

const applyTheme = (theme, persist = false) => {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  updateThemeColor(nextTheme);

  if (themeToggle) {
    const toggleLabel = nextTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    themeToggle.setAttribute("aria-label", toggleLabel);
    themeToggle.setAttribute("aria-pressed", String(nextTheme === "dark"));
    themeToggle.setAttribute("title", toggleLabel);
  }

  if (persist) {
    try {
      localStorage.setItem("studio29-theme", nextTheme);
    } catch {}
  }
};

applyTheme(document.documentElement.dataset.theme || getSystemTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
  });
}

const syncSystemTheme = () => {
  try {
    if (!localStorage.getItem("studio29-theme")) {
      applyTheme(getSystemTheme());
    }
  } catch {}
};

if (typeof themePreference.addEventListener === "function") {
  themePreference.addEventListener("change", syncSystemTheme);
} else if (typeof themePreference.addListener === "function") {
  themePreference.addListener(syncSystemTheme);
}

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
  const typingMs = 82;
  const holdMs = 1400;
  const deletingMs = 45;
  const nextWordMs = 260;
  let outcomeIndex = 0;
  let characterIndex = 0;
  let outcomeTimeoutId = null;

  const clearOutcomeTimer = () => {
    if (outcomeTimeoutId !== null) {
      window.clearTimeout(outcomeTimeoutId);
      outcomeTimeoutId = null;
    }
  };

  const scheduleOutcome = (callback, delay) => {
    outcomeTimeoutId = window.setTimeout(() => {
      outcomeTimeoutId = null;
      callback();
    }, delay);
  };

  const typeOutcome = () => {
    const word = outcomes[outcomeIndex];

    rotatingOutcome.textContent = word.slice(0, characterIndex);

    if (characterIndex < word.length) {
      characterIndex += 1;
      scheduleOutcome(typeOutcome, typingMs);
      return;
    }

    scheduleOutcome(deleteOutcome, holdMs);
  };

  const deleteOutcome = () => {
    const word = outcomes[outcomeIndex];

    rotatingOutcome.textContent = word.slice(0, characterIndex);

    if (characterIndex > 0) {
      characterIndex -= 1;
      scheduleOutcome(deleteOutcome, deletingMs);
      return;
    }

    outcomeIndex = (outcomeIndex + 1) % outcomes.length;
    scheduleOutcome(typeOutcome, nextWordMs);
  };

  const syncOutcomeRotation = () => {
    clearOutcomeTimer();

    if (reduceMotion.matches) {
      outcomeIndex = 0;
      rotatingOutcome.textContent = outcomes[outcomeIndex];
      return;
    }

    if (document.hidden) {
      return;
    }

    outcomeIndex = 0;
    characterIndex = 0;
    rotatingOutcome.textContent = "";
    typeOutcome();
  };

  syncOutcomeRotation();
  document.addEventListener("visibilitychange", syncOutcomeRotation);

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", syncOutcomeRotation);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(syncOutcomeRotation);
  }
}
