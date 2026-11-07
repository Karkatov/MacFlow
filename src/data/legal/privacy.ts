import type { LegalDocument, Locale } from './types';

/** Политика обработки персональных данных. */
export const privacyPolicy: Record<Locale, LegalDocument> = {
  ru: {
    title: 'Политика обработки персональных данных',
    updatedAt: '2026-10-23',
    intro:
      'Настоящая Политика обработки персональных данных (далее — Политика) определяет порядок обработки и защиты персональных данных пользователей сайта и программы для ЭВМ «MacFlow» для macOS, а также порядок и условия обработки персональных данных Оператором.',
    sections: [
      {
        id: 'general',
        title: '1. Общие положения',
        paragraphs: [
          '1.1. Политика описывает обработку персональных данных при посещении сайта, покупке, скачивании, активации и использовании MacFlow для macOS, а также при обращении в поддержку.',
          '1.2. Оператор определяет цели и способы обработки и соблюдает Федеральный закон № 152-ФЗ «О персональных данных» и иные применимые нормы.',
          '1.3. Платёжные сервисы, Apple и иные поставщики могут обрабатывать данные как самостоятельные операторы по собственным документам; их роли нужно проверить по фактической интеграции.',
        ],
      },
      {
        id: 'data',
        title: '2. Какие данные обрабатываются',
        paragraphs: ['2.1. В зависимости от реально используемых функций могут обрабатываться:'],
        list: [
          'данные заказа: идентификатор заказа, тариф, сумма, дата, статус оплаты/возврата;',
          'контакты: email и имя, если пользователь их сообщает;',
          'данные лицензии: идентификатор лицензии, статус, дата активации, число активных устройств;',
          'технические данные: IP-адрес, время запроса, версия приложения и macOS, журналы и отчёты об ошибках — только если они реально собираются;',
          'содержание обращения в поддержку и контактные данные, добровольно сообщённые пользователем.',
        ],
      },
      {
        id: 'goals',
        title: '3. Цели и основания обработки',
        paragraphs: [
          '3.1. Данные заказа и лицензии обрабатываются для оформления и исполнения договора, подтверждения оплаты, выдачи/восстановления доступа, предотвращения злоупотреблений и рассмотрения обращений — в необходимом объёме.',
          '3.2. Данные для необязательных рассылок или аналитики, если они используются и основаны на согласии, обрабатываются только после отдельного конкретного и подтверждаемого согласия.',
          '3.3. Данные могут обрабатываться для исполнения обязанностей, установленных законодательством, включая обязательное хранение документов.',
          '3.4. Оператор не использует данные для несовместимых целей без надлежащего правового основания.',
        ],
      },
      {
        id: 'operations',
        title: '4. Операции и сроки хранения',
        paragraphs: [
          '4.1. В зависимости от цели Оператор может собирать, записывать, систематизировать, хранить, уточнять, использовать, передавать уполномоченным обработчикам, блокировать и удалять данные.',
          '4.2. После достижения цели или прекращения правового основания данные удаляются или обезличиваются в предусмотренные законом сроки, если дальнейшее хранение не требуется законом или для защиты законных требований.',
        ],
      },
      {
        id: 'recipients',
        title: '5. Получатели и обработчики',
        paragraphs: [
          '5.1. Данные могут передаваться поставщикам, участие которых необходимо: хостингу, платёжному сервису, почтовому сервису и поддержке — только если они действительно используются и передача законна.',
          '5.2. Оператор не продаёт персональные данные пользователей.',
          '5.3. При поручении обработки подрядчику оформляются условия, требуемые законом, включая цели, перечень данных и операций, конфиденциальность и меры безопасности.',
        ],
      },
      {
        id: 'localization',
        title: '6. Локализация и трансграничная передача',
        paragraphs: [
          '6.1. При сборе персональных данных граждан РФ через Интернет Оператор соблюдает требования законодательства РФ о локализации баз данных и ограничения трансграничной передачи.',
          '6.2. Если архитектура предусматривает трансграничную передачу, до запуска необходимо проверить и выполнить предусмотренные законом процедуры и уведомления.',
        ],
      },
      {
        id: 'security',
        title: '7. Безопасность',
        paragraphs: [
          '7.1. Оператор принимает необходимые правовые, организационные и технические меры защиты от неправомерного доступа, изменения, раскрытия, уничтожения и иных неправомерных действий.',
          '7.2. Доступ ограничивается лицами, которым он необходим. Секреты и токены не хранятся в открытом виде в исходном коде или публичных репозиториях.',
          '7.3. При инцидентах Оператор выполняет предусмотренные законом обязанности по реагированию и уведомлению органов и субъектов данных, если применимо.',
        ],
      },
      {
        id: 'rights',
        title: '8. Права пользователя и обращения',
        paragraphs: [
          '8.1. Пользователь вправе запросить сведения об обработке, уточнение, блокирование или удаление данных, отозвать согласие и реализовать иные права по закону.',
          '8.2. Запрос направляется по контактам Оператора. Для защиты данных может запрашиваться разумное подтверждение личности без сбора избыточных сведений.',
          '8.3. Отзыв согласия не прекращает обработку, которая законно продолжается на ином основании, например для исполнения договора или обязательного хранения документов.',
        ],
      },
      {
        id: 'cookies',
        title: '9. Cookies, аналитика и журналы',
        paragraphs: [
          'Информация об используемых инструментах (cookies, аналитика, crash reporting, телеметрия и журналы) определяется в соответствии с фактической конфигурацией сайта и приложения.',
        ],
      },
      {
        id: 'changes',
        title: '10. Изменения Политики',
        paragraphs: [
          '10.1. Актуальная редакция публикуется на Сайте. Новые цели, для которых требуется согласие, не внедряются только путём публикации новой редакции Политики.',
        ],
      },
      {
        id: 'contacts',
        title: '11. Контакты',
        paragraphs: [
          'Оператор: [ЗАПОЛНИТЬ: ФИО/наименование, статус, ИНН, адрес для обращений].',
          'Email для обращений по вопросам обработки персональных данных: [ЗАПОЛНИТЬ].',
        ],
      },
    ],
  },
  en: {
    title: 'Personal Data Processing Policy',
    updatedAt: '2026-10-23',
    intro:
      'This Policy defines the procedure for processing and protecting personal data of users of the website and the MacFlow macOS application, as well as the procedure and conditions for processing personal data by the Operator.',
    sections: [
      {
        id: 'general',
        title: '1. General Provisions',
        paragraphs: [
          '1.1. This Policy describes the processing of personal data when visiting the website, making a purchase, downloading, activating and using MacFlow for macOS, as well as when contacting support.',
          '1.2. The Operator determines the purposes and methods of processing and complies with Federal Law No. 152-FZ "On Personal Data" and other applicable regulations.',
          '1.3. Payment services, Apple and other providers may process data as independent data controllers under their own policies.',
        ],
      },
      {
        id: 'data',
        title: '2. What Data is Processed',
        paragraphs: [
          '2.1. Depending on the functions actually used, the following data may be processed:',
        ],
        list: [
          'order data: order ID, tariff, amount, date, payment/refund status;',
          'contacts: email and name if provided by the user;',
          'license data: license ID, status, activation date, number of active devices;',
          'technical data: IP address, request time, app and macOS version, logs and error reports — only if actually collected;',
          'support request content and contact details voluntarily provided by the user.',
        ],
      },
      {
        id: 'goals',
        title: '3. Purposes and Legal Grounds',
        paragraphs: [
          '3.1. Order and license data are processed for contract execution, payment confirmation, access provision/restoration, fraud prevention and handling requests — to the extent necessary.',
          '3.2. Data for optional newsletters or analytics is processed only with separate, specific and verifiable consent.',
          '3.3. Data may be processed to comply with legal obligations, including document retention.',
          '3.4. The Operator does not process data for incompatible purposes without proper legal grounds.',
        ],
      },
      {
        id: 'rights',
        title: '4. User Rights and Contacts',
        paragraphs: [
          'The user has the right to request information about processing, rectification, blocking or deletion of data, withdraw consent and exercise other rights under the law.',
          'Requests should be sent to the Operator’s contact email. The Operator will respond within 30 days.',
        ],
      },
    ],
  },
};
