'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

/** FAQ-аккордеон в стиле референса. */
export function FaqSection({ items }: { items: FaqItem[] }) {
  const t = useTranslations('landing.faq');
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="faq-section" id="faq" aria-label={t('label')}>
      <div className="faq-inner">
        <div className="faq-header" data-animate>
          <span className="section-label">{t('label')}</span>
          <h2 className="faq-heading">
            {t('title')}
            <br />
            {t('titleAccent')}
          </h2>
        </div>

        <div className="faq-list" data-stagger>
          {items.map((item) => {
            const open = openId === item.id;
            return (
              <div key={item.id} className={`faq-item ${open ? 'open' : ''}`} data-stagger-child>
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={open}
                  aria-controls={`faq-answer-${item.id}`}
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  <span>{item.question}</span>
                  <svg
                    className="faq-chevron"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="faq-answer" id={`faq-answer-${item.id}`}>
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
