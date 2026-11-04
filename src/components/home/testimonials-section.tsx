import { getTranslations } from 'next-intl/server';

const reviewKeys = ['one', 'two', 'three', 'four', 'five', 'six'] as const;

function Stars() {
  return (
    <div className="testimonial-stars" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg key={index} width="16" height="16" viewBox="0 0 24 24" fill="#facc15">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

/** Бесконечная карусель отзывов. */
export async function TestimonialsSection() {
  const t = await getTranslations('landing.testimonials');

  const reviews = reviewKeys.map((key, index) => ({
    key,
    text: t(`items.${key}.text`),
    name: t(`items.${key}.name`),
    role: t(`items.${key}.role`),
    avatar: `/placeholders/avatars/avatar-0${index + 1}.svg`,
  }));

  const loop = [...reviews, ...reviews];

  return (
    <section className="testimonials-section">
      <div className="testimonials-inner">
        <div className="testimonials-header" data-animate>
          <span className="section-label">{t('label')}</span>
          <h2 className="testimonials-heading">{t('title')}</h2>
          <p className="testimonials-subtitle">{t('subtitle')}</p>
        </div>

        <div className="testimonials-track-wrapper" data-animate data-animate-delay="150">
          <div className="testimonials-track">
            {loop.map((review, index) => (
              <article
                key={`${review.key}-${index}`}
                className="testimonial-card"
                aria-hidden={index >= reviews.length ? true : undefined}
              >
                <Stars />
                <p className="testimonial-text">“{review.text}”</p>
                <div className="testimonial-author">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="testimonial-avatar-img"
                    src={review.avatar}
                    alt=""
                    loading="lazy"
                  />
                  <div className="testimonial-info">
                    <div className="testimonial-name">{review.name}</div>
                    <div className="testimonial-role">{review.role}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
