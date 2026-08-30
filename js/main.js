const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".site-nav a");
const featureVideo = document.querySelector("[data-feature-video]");

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

if (featureVideo) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const syncFeatureVideoPlayback = () => {
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
  syncFeatureVideoPlayback();

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", syncFeatureVideoPlayback);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(syncFeatureVideoPlayback);
  }
}
