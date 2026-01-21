'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Hook for scroll-triggered animations
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(element, { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    gsap.fromTo(
      element,
      { opacity: 0, y: 80 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          end: 'top 20%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return ref;
}

// Hook for staggered reveal animations
export function useStaggerReveal<T extends HTMLElement>(
  stagger = 0.1,
  direction: 'up' | 'down' | 'left' | 'right' = 'up'
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const children = container.children;

    if (prefersReducedMotion) {
      gsap.set(children, { opacity: 1, y: 0, x: 0 });
      return;
    }

    const fromVars: gsap.TweenVars = { opacity: 0 };
    const toVars: gsap.TweenVars = { opacity: 1, duration: 0.8, ease: 'expo.out', stagger };

    switch (direction) {
      case 'up':
        fromVars.y = 60;
        toVars.y = 0;
        break;
      case 'down':
        fromVars.y = -60;
        toVars.y = 0;
        break;
      case 'left':
        fromVars.x = 60;
        toVars.x = 0;
        break;
      case 'right':
        fromVars.x = -60;
        toVars.x = 0;
        break;
    }

    gsap.fromTo(children, fromVars, {
      ...toVars,
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [stagger, direction]);

  return containerRef;
}

// Hook for parallax effect
export function useParallaxGSAP<T extends HTMLElement>(speed = 0.5) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.to(element, {
      y: () => speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [speed]);

  return ref;
}

// Hook for horizontal scroll
export function useHorizontalScroll<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const totalWidth = content.scrollWidth - container.offsetWidth;

    gsap.to(content, {
      x: -totalWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${totalWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return { containerRef, contentRef };
}

// Hook for text split animation
export function useSplitText<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const text = element.textContent || '';
    const words = text.split(' ');
    element.innerHTML = '';

    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.marginRight = '0.25em';
      wordSpan.style.overflow = 'hidden';

      const chars = word.split('');
      chars.forEach((char) => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.style.display = 'inline-block';
        charSpan.className = 'split-char';
        wordSpan.appendChild(charSpan);
      });

      element.appendChild(wordSpan);
    });

    const charElements = element.querySelectorAll('.split-char');

    gsap.fromTo(
      charElements,
      { y: '100%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.6,
        stagger: 0.02,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return ref;
}

// Hook for pinned scroll sections
export function usePinnedSection<T extends HTMLElement>(
  onProgress?: (progress: number) => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    ScrollTrigger.create({
      trigger: element,
      start: 'top top',
      end: 'bottom bottom',
      pin: true,
      pinSpacing: false,
      onUpdate: (self) => {
        onProgress?.(self.progress);
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [onProgress]);

  return ref;
}

// Hook for magnetic effect
export function useMagnetic<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      gsap.to(element, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return ref;
}

// Timeline factory for complex animations
export function useGSAPTimeline() {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const createTimeline = useCallback((vars?: gsap.TimelineVars) => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    timelineRef.current = gsap.timeline(vars);
    return timelineRef.current;
  }, []);

  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return { createTimeline, timeline: timelineRef.current };
}

// Scroll progress hook
export function useScrollProgress(onProgress: (progress: number) => void) {
  useEffect(() => {
    ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        onProgress(self.progress);
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [onProgress]);
}
