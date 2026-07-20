export type ContactType =
  | 'PHONE' | 'EMAIL' | 'WHATSAPP' | 'TELEGRAM' | 'VIBER'
  | 'WECHAT' | 'LINE' | 'WEBSITE' | 'FACEBOOK' | 'INSTAGRAM'
  | 'YOUTUBE' | 'TWITTER' | 'TIKTOK' | 'LINKEDIN';

export type EntityType = 'LOCATION' | 'EVENT' | 'PACKAGE' | 'PLACE' | 'MORE_SECTION_ITEM';

export interface ContactDetail {
  id?: number;
  entityType: EntityType;
  entityId: number;
  contactType: ContactType;
  value: string;
  label?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ContactTypeMeta {
  label: string;
  color: string;
  buildUrl: (value: string) => string;
  openInNew: boolean;
}

export const CONTACT_TYPE_META: Record<ContactType, ContactTypeMeta> = {
  PHONE:     { label: 'Phone',       color: '#10b981', buildUrl: v => `tel:${v}`,                                       openInNew: false },
  EMAIL:     { label: 'Email',       color: '#6366f1', buildUrl: v => `mailto:${v}`,                                    openInNew: false },
  WHATSAPP:  { label: 'WhatsApp',    color: '#25d366', buildUrl: v => `https://wa.me/${v.replace(/[^0-9]/g, '')}`,      openInNew: true  },
  TELEGRAM:  { label: 'Telegram',    color: '#229ed9', buildUrl: v => `https://t.me/${v}`,                              openInNew: true  },
  VIBER:     { label: 'Viber',       color: '#7360f2', buildUrl: v => `viber://chat?number=${v.replace(/[^0-9]/g, '')}`,openInNew: false },
  WECHAT:    { label: 'WeChat',      color: '#07c160', buildUrl: () => '',                                              openInNew: false },
  LINE:      { label: 'LINE',        color: '#00c300', buildUrl: v => `https://line.me/ti/p/${v}`,                      openInNew: true  },
  WEBSITE:   { label: 'Website',     color: '#3b82f6', buildUrl: v => v.startsWith('http') ? v : `https://${v}`,        openInNew: true  },
  FACEBOOK:  { label: 'Facebook',    color: '#1877f2', buildUrl: v => `https://facebook.com/${v}`,                      openInNew: true  },
  INSTAGRAM: { label: 'Instagram',   color: '#e1306c', buildUrl: v => `https://instagram.com/${v}`,                     openInNew: true  },
  YOUTUBE:   { label: 'YouTube',     color: '#ff0000', buildUrl: v => `https://youtube.com/${v}`,                       openInNew: true  },
  TWITTER:   { label: 'X (Twitter)', color: '#1da1f2', buildUrl: v => `https://twitter.com/${v}`,                      openInNew: true  },
  TIKTOK:    { label: 'TikTok',      color: '#010101', buildUrl: v => `https://tiktok.com/@${v}`,                       openInNew: true  },
  LINKEDIN:  { label: 'LinkedIn',    color: '#0077b5', buildUrl: v => `https://linkedin.com/in/${v}`,                   openInNew: true  },
};

export const ALL_CONTACT_TYPES: ContactType[] = [
  'PHONE', 'EMAIL', 'WHATSAPP', 'TELEGRAM', 'VIBER', 'WECHAT', 'LINE',
  'WEBSITE', 'FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER', 'TIKTOK', 'LINKEDIN'
];
