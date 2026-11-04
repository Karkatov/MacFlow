'use client';

import { useEffect } from 'react';

/**
 * Включает scroll-reveal анимации из референса.
 * Элементы с data-animate / data-stagger-child появляются при попадании
 * во вьюпорт, с задержкой из data-animate-delay и шагом для stagger-групп.
 */
export function RevealProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elements = new Set<Element>();

    document.querySelectorAll('[data-animate]').forEach((el) => elements.add(el));

    document.querySelectorAll('[data-stagger]').forEach((group) => {
      const children = Array.from(group.querySelectorAll('[data-stagger-child]'));
      children.forEach((child, index) => {
        (child as HTMLElement).style.transitionDelay = reduce
          ? '0ms'
          : `${Math.min(index * 70, 420)}ms`;
        elements.add(child);
      });
    });

    document.querySelectorAll('[data-animate-delay]').forEach((el) => {
      const delay = el.getAttribute('data-animate-delay');
      if (delay) (el as HTMLElement).style.transitionDelay = `${delay}ms`;
    });

    if (reduce) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.96) {
        el.classList.add('is-visible');
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
