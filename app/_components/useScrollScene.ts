"use client";

import { useEffect, useRef } from "react";

// Keep scroll movement outside React renders and leave content visible without JavaScript.
export function useScrollScene<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;
    const update = () => {
      frame = 0;
      if (!visible || motion.matches) return;
      // offsetTop excludes the transform we apply, avoiding scroll/measurement feedback.
      let top = 0;
      let node: HTMLElement | null = element;
      while (node) { top += node.offsetTop; node = node.offsetParent as HTMLElement | null; }
      const progress = Math.max(0, Math.min(1, (top - window.scrollY - innerHeight * .24) / (innerHeight * .76)));
      element.style.setProperty("--scroll-depth", progress.toFixed(3));
    };
    const schedule = () => { if (visible && !motion.matches && !frame) frame = requestAnimationFrame(update); };
    const onMotionChange = () => {
      element.toggleAttribute("data-scene-visible", visible && !motion.matches);
      if (motion.matches) { cancelAnimationFrame(frame); frame = 0; element.style.removeProperty("--scroll-depth"); }
      else schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      element.toggleAttribute("data-scene-visible", visible && !motion.matches);
      schedule();
    }, { rootMargin: "80px 0px" });
    observer.observe(element);
    const resize = new ResizeObserver(schedule);
    resize.observe(element);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", onMotionChange);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", onMotionChange);
      element.style.removeProperty("--scroll-depth");
      element.removeAttribute("data-scene-visible");
    };
  }, []);
  return ref;
}
