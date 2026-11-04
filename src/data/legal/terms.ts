import type { LegalDocument, Locale } from './types';

/** Условия использования сайта и приложения (шаблон). */
export const termsOfUse: Record<Locale, LegalDocument> = {
  ru: {
    title: 'Условия использования',
    updatedAt: '2026-10-01',
    intro:
      'Условия регулируют использование сайта macflow.app и приложения MacFlow для macOS. Продолжая использование, вы принимаете эти условия.',
    sections: [
      {
        id: 'subject',
        title: '1. Предмет договора',
        paragraphs: [
          'Исполнитель предоставляет право использования программного обеспечения MacFlow (далее — Программа) на условиях настоящих Условий и Публичной оферты.',
          'Программа распространяется в виде триала (24 часа) и платных версий: Premium навсегда и Premium на год.',
        ],
      },
      {
        id: 'license',
        title: '2. Лицензия',
        paragraphs: [
          'После оплаты Пользователю предоставляется простая (неисключительная) лицензия на использование Программы на срок, указанный при покупке.',
          'Лицензия Premium «навсегда» распространяется не более чем на три личных компьютера Mac пользователя. Лицензия «на год» — на один Mac.',
        ],
      },
      {
        id: 'requirements',
        title: '3. Требования к оборудованию',
        paragraphs: [
          'Программа требует macOS 15 (Sequoia) или более позднюю версию. Живые обои на экране блокировки и в заставке доступны начиная с macOS 26 (Tahoe).',
          'Использование собственных видео и файлов плейлиста возможно только при наличии достаточного свободного места на диске.',
        ],
      },
      {
        id: 'payment',
        title: '4. Оплата',
        paragraphs: [
          'Стоимость указана на странице «Цены» в рублях Российской Федерации. Оплата производится через платёжного провайдера.',
          'Услуга считается оказанной в момент предоставления доступа к приобретённым материалам.',
        ],
      },
      {
        id: 'obligations',
        title: '5. Обязанности пользователя',
        list: [
          'не использовать Программу в нарушение законодательства Российской Федерации;',
          'не распространять Программу и материалы каталога в виде исходных файлов (кроме личного некоммерческого использования);',
          'не использовать каталог для перепродажи и публикации в сторонних сервисах.',
        ],
      },
      {
        id: 'ip',
        title: '6. Интеллектуальная собственность',
        paragraphs: [
          'Исключительные права на Программу принадлежат Исполнителю. Права на материалы каталога принадлежат их правообладателям; лицензия действует только в рамках Программы.',
          'Товарные знаки и логотипы принадлежат их владельцам.',
        ],
      },
      {
        id: 'liability',
        title: '7. Ответственность',
        paragraphs: [
          'Программа предоставляется «как есть» (as is). Исполнитель не гарантирует, что её использование не приведёт к потере данных или повреждению оборудования.',
          'Ответственность Исполнителя ограничена стоимостью приобретённой лицензии.',
        ],
      },
      {
        id: 'contacts',
        title: '8. Контакты',
        paragraphs: ['Вопросы по настоящим Условиям: hello@macflow.app.'],
      },
    ],
  },
  en: {
    title: 'Terms of use',
    updatedAt: '2026-10-01',
    intro:
      'These terms govern the use of macflow.app and the MacFlow macOS application. By continuing to use the service you accept these terms.',
    sections: [
      {
        id: 'subject',
        title: '1. Subject of the agreement',
        paragraphs: [
          'The Service Provider grants the right to use the MacFlow software (the "Application") subject to these Terms and the Public Offer.',
          'The Application is distributed as a free trial (24 hours) and as paid versions: Premium forever and Premium for a year.',
        ],
      },
      {
        id: 'license',
        title: '2. License',
        paragraphs: [
          'After payment the user receives a simple (non-exclusive) license to use the Application for the period selected at checkout.',
          'A "forever" Premium license covers no more than three personal Macs. A yearly license covers one Mac.',
        ],
      },
      {
        id: 'requirements',
        title: '3. System requirements',
        paragraphs: [
          'The Application requires macOS 15 (Sequoia) or later. Live Lock Screen and Screen Saver wallpapers require macOS 26 (Tahoe) or later.',
          'Using your own videos and local playlists requires enough free disk space.',
        ],
      },
      {
        id: 'payment',
        title: '4. Payment',
        paragraphs: [
          'Prices are listed on the Pricing page in Russian roubles. Payment is made through a payment provider.',
          'The service is considered rendered at the moment access to the purchased materials is granted.',
        ],
      },
      {
        id: 'obligations',
        title: '5. User obligations',
        list: [
          'do not use the Application in violation of applicable law;',
          'do not redistribute the Application or catalog files (except for personal non-commercial use);',
          'do not resell or republish catalog content in third-party services.',
        ],
      },
      {
        id: 'ip',
        title: '6. Intellectual property',
        paragraphs: [
          'Exclusive rights to the Application belong to the Service Provider. Rights to catalog materials belong to their respective owners; the license applies only within the Application.',
          'Trademarks and logos belong to their owners.',
        ],
      },
      {
        id: 'liability',
        title: '7. Disclaimer',
        paragraphs: [
          'The Application is provided "as is". The Service Provider does not guarantee that its use will not cause data loss or hardware damage.',
          'The Service Provider liability is limited to the price of the purchased license.',
        ],
      },
      {
        id: 'contacts',
        title: '8. Contacts',
        paragraphs: ['Questions about these terms: hello@macflow.app.'],
      },
    ],
  },
};
