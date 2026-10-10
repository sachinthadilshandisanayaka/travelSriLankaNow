import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoConfig {
  title: string;
  description?: string;
  image?: string;
  /** Path (e.g. /locations/sigiriya). Defaults to the current path. */
  path?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  /** schema.org JSON-LD object(s) */
  jsonLd?: object | object[];
}

const SITE_URL = 'https://travelsrilankanow.lk';
const SITE_NAME = 'Travel Sri Lanka Now';
const DEFAULT_IMAGE = SITE_URL + '/assets/images/og-image.png';
const DEFAULT_DESC = 'Discover the best places to visit in Sri Lanka: beaches, mountains, cultural sites, wildlife, tours, events, hotels and restaurants. Plan your trip with Travel Sri Lanka Now.';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document
  ) { }

  set(cfg: SeoConfig): void {
    const fullTitle = cfg.title.indexOf(SITE_NAME) >= 0 ? cfg.title : `${cfg.title} | ${SITE_NAME}`;
    const description = this.clean(cfg.description || DEFAULT_DESC, 160);
    const path = cfg.path !== undefined ? cfg.path : this.currentPath();
    const url = SITE_URL + (path === '/' ? '' : path);
    const image = this.absolute(cfg.image) || DEFAULT_IMAGE;

    this.title.setTitle(fullTitle);
    this.tag('name', 'description', description);
    this.tag('name', 'robots', cfg.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    this.tag('property', 'og:type', cfg.type || 'website');
    this.tag('property', 'og:site_name', SITE_NAME);
    this.tag('property', 'og:url', url);
    this.tag('property', 'og:title', fullTitle);
    this.tag('property', 'og:description', description);
    this.tag('property', 'og:image', image);
    this.tag('name', 'twitter:card', 'summary_large_image');
    this.tag('name', 'twitter:url', url);
    this.tag('name', 'twitter:title', fullTitle);
    this.tag('name', 'twitter:description', description);
    this.tag('name', 'twitter:image', image);
    this.canonical(url);
    this.jsonLd(cfg.jsonLd);
  }

  /** Breadcrumb JSON-LD helper */
  breadcrumbs(items: { name: string; path: string }[]): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((it, i) => ({
        '@type': 'ListItem', position: i + 1, name: it.name, item: SITE_URL + (it.path === '/' ? '' : it.path)
      }))
    };
  }

  absoluteUrl(path: string): string { return SITE_URL + path; }

  private currentPath(): string {
    return (this.doc.location ? this.doc.location.pathname : '/') || '/';
  }

  private absolute(img?: string): string | null {
    if (!img) { return null; }
    if (/^https?:\/\//i.test(img)) { return img; }
    return SITE_URL + (img.startsWith('/') ? '' : '/') + img;
  }

  private clean(text: string, max: number): string {
    const t = (text || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    return t.length > max ? t.substring(0, max - 1).replace(/\s+\S*$/, '') + '…' : t;
  }

  private tag(attr: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attr]: key, content } as any, `${attr}='${key}'`);
  }

  private canonical(url: string): void {
    let link = this.doc.head.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private jsonLd(data?: object | object[]): void {
    const old = this.doc.head.querySelector('script[data-seo-jsonld]');
    if (old) { old.remove(); }
    if (!data) { return; }
    const script = this.doc.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-seo-jsonld', 'true');
    script.text = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }
}
