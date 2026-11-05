'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Единая система появления секций и stagger-элементов
 * при прокрутке на всех страницах сайта.
 */
export function RevealProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let observer: IntersectionObserver | null = null;

    if (!reduce) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('is-visible');
            observer?.unobserve(entry.target);
          });
        },
        {
          rootMargin: '0px 0px -8% 0px',
          threshold: 0.08,
        },
      );
    }

    const register = (element: Element) => {
      const htmlElement = element as HTMLElement;

      if (element.hasAttribute('data-animate-delay')) {
        const delay = element.getAttribute('data-animate-delay');
        if (delay) htmlElement.style.transitionDelay = `${delay}ms`;
      }

      if (element.hasAttribute('data-stagger-child')) {
        const group = element.closest('[data-stagger]');

        if (group) {
          const children = Array.from(group.querySelectorAll('[data-stagger-child]'));
          const index = children.indexOf(element);

          htmlElement.style.transitionDelay = reduce ? '0ms' : `${Math.min(index * 70, 420)}ms`;
        }
      }

      if (element.classList.contains('is-visible')) return;

      if (reduce) {
        element.classList.add('is-visible');
        return;
      }

      const rect = element.getBoundingClientRect();

      if (rect.top < window.innerHeight * 0.96) {
        element.classList.add('is-visible');
      } else {
        observer?.observe(element);
      }
    };

    const scan = (root: ParentNode) => {
      // Автоматически анимируем только верхнеуровневые секции,
      // не затрагивая вложенные секции и уже анимируемые блоки.
      root.querySelectorAll('section').forEach((section) => {
        if (section.hasAttribute('data-animate')) return;
        if (section.parentElement?.closest('section')) return;
        if (section.parentElement?.closest('[data-animate], .reveal-on-scroll')) {
          return;
        }

        section.setAttribute('data-animate', 'auto');
      });

      const elements = new Set<Element>();

      if (root instanceof Element) {
        if (root.matches('[data-animate], [data-stagger-child]')) {
          elements.add(root);
        }
      }

      root
        .querySelectorAll('[data-animate], [data-stagger-child]')
        .forEach((element) => elements.add(element));

      elements.forEach(register);

      root.querySelectorAll('[data-stagger]').forEach((group) => {
        group.querySelectorAll('[data-stagger-child]').forEach(register);
      });
    };

    scan(main);

    // Отслеживаем новые элементы при переходах и динамическом рендеринге.
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            scan(node);
          }
        });
      });
    });

    mutationObserver.observe(main, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}
