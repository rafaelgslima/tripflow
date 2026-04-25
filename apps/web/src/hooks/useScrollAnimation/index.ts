import { useLayoutEffect } from "react";

export function useScrollAnimation() {
  useLayoutEffect(() => {
    function setupObserver() {
      const sections = document.querySelectorAll("[data-scroll-section]");

      if (sections.length === 0) {
        requestAnimationFrame(setupObserver);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const elements = (entry.target as HTMLElement).querySelectorAll(
                "[data-scroll-animate]",
              );
              elements.forEach((el, index) => {
                const htmlEl = el as HTMLElement;
                htmlEl.classList.add("animate-slide-up");
                // Only set delay if not already set
                if (!htmlEl.style.animationDelay) {
                  htmlEl.style.animationDelay = `${index * 0.15}s`;
                }
              });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 },
      );

      sections.forEach((section) => observer.observe(section));

      return () => observer.disconnect();
    }

    setupObserver();
  }, []);

  return null;
}
