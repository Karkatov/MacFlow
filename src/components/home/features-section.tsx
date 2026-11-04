import { getTranslations } from 'next-intl/server';
import { BatteryCharging, Layers, ListMusic, Lock, MonitorPlay, Upload } from 'lucide-react';

const featureIcons = {
  performance: { Icon: BatteryCharging, className: 'icon-teal' },
  menuBar: { Icon: MonitorPlay, className: 'icon-green' },
  lockScreen: { Icon: Lock, className: 'icon-purple' },
  bend: { Icon: Layers, className: 'icon-orange' },
  playlists: { Icon: ListMusic, className: 'icon-blue' },
  import: { Icon: Upload, className: 'icon-pink' },
} as const;

const featureOrder = [
  'performance',
  'menuBar',
  'lockScreen',
  'bend',
  'playlists',
  'import',
] as const;

/** Сетка возможностей с иконками и stagger-анимацией. */
export async function FeaturesSection() {
  const t = await getTranslations('landing.features');
  const benefits = await getTranslations('home.benefits.items');

  return (
    <section className="lw-section">
      <div className="lw-inner">
        <div className="lw-header" data-animate>
          <span className="section-label">{t('label')}</span>
          <h2 className="lw-heading">
            {t('title')}
            <br />
            <span className="heading-gradient">{t('titleAccent')}</span>
          </h2>
          <p className="lw-subheading">{t('subtitle')}</p>
        </div>

        <div className="lw-grid" data-stagger>
          {featureOrder.map((key) => {
            const { Icon, className } = featureIcons[key];
            return (
              <div key={key} className="lw-item" data-stagger-child>
                <div className={`lw-icon-wrap ${className}`}>
                  <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div className="lw-text">
                  <div className="lw-title">{benefits(`${key}.title`)}</div>
                  <div className="lw-description">{benefits(`${key}.description`)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
