import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';

const CACHE_KEY = 'tsln_ct';
const MAX_CHUNK = 450;
const API = 'https://api.mymemory.translated.net/get';

@Injectable({ providedIn: 'root' })
export class ContentTranslationService {
  private mem = new Map<string, string>();

  constructor(private http: HttpClient) {
    this.loadCache();
  }

  // Translate a plain text string
  text(raw: string, lang: string): Observable<string> {
    if (!raw?.trim() || lang === 'en') return of(raw);
    const key = `${lang}:${raw}`;
    if (this.mem.has(key)) return of(this.mem.get(key)!);

    const chunks = this.chunk(raw);
    if (chunks.length === 1) return this.callApi(raw, lang, key);

    return forkJoin(chunks.map((c, i) =>
      this.callApi(c, lang, `${lang}:${c}`)
    )).pipe(
      map(parts => {
        const joined = parts.join(' ');
        this.save(key, joined);
        return joined;
      }),
      catchError(() => of(raw))
    );
  }

  // Translate HTML by extracting text nodes, translating each, and reinserting
  html(htmlStr: string, lang: string): Observable<string> {
    if (!htmlStr?.trim() || lang === 'en') return of(htmlStr);

    const htmlKey = `${lang}:html:${htmlStr.length}:${htmlStr.slice(0, 40)}`;
    if (this.mem.has(htmlKey)) return of(this.mem.get(htmlKey)!);

    // Collect unique text nodes (>3 chars, not whitespace only)
    const texts = this.extractTextNodes(htmlStr);
    if (texts.length === 0) return of(htmlStr);

    const jobs = texts.map(t => this.text(t, lang).pipe(map(tr => ({ orig: t, tr }))));

    return forkJoin(jobs).pipe(
      map(pairs => {
        let result = htmlStr;
        pairs.forEach(({ orig, tr }) => {
          // Only replace inside tag content, not inside attributes
          result = result.replace(
            new RegExp('(?<=>)(' + this.escapeRegex(orig) + ')(?=\\s*<)', 'g'),
            tr
          );
        });
        this.save(htmlKey, result);
        return result;
      }),
      catchError(() => of(htmlStr))
    );
  }

  private callApi(text: string, lang: string, cacheKey: string): Observable<string> {
    const url = `${API}?q=${encodeURIComponent(text)}&langpair=en|${lang}`;
    return this.http.get<any>(url).pipe(
      map(r => {
        const translated: string = r?.responseData?.translatedText || text;
        const result = translated.startsWith('MYMEMORY WARNING') ? text : translated;
        this.save(cacheKey, result);
        return result;
      }),
      catchError(() => of(text))
    );
  }

  private extractTextNodes(html: string): string[] {
    const matches = html.match(/(?<=>)([^<]{4,})(?=<)/g) || [];
    const unique = [...new Set(
      matches
        .map(m => m.trim())
        .filter(m => m.length > 3 && /\S/.test(m))
    )];
    return unique;
  }

  private chunk(text: string): string[] {
    if (text.length <= MAX_CHUNK) return [text];
    const chunks: string[] = [];
    const sentences = text.split(/(?<=[.!?])\s+/);
    let current = '';
    for (const s of sentences) {
      if ((current + s).length > MAX_CHUNK && current) {
        chunks.push(current.trim());
        current = s;
      } else {
        current += (current ? ' ' : '') + s;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks.length ? chunks : [text.substring(0, MAX_CHUNK)];
  }

  private escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private save(key: string, value: string): void {
    if (this.mem.size > 800) {
      const first = this.mem.keys().next().value;
      this.mem.delete(first);
    }
    this.mem.set(key, value);
    this.persistCache();
  }

  private loadCache(): void {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const obj = JSON.parse(raw) as Record<string, string>;
      Object.entries(obj).forEach(([k, v]) => this.mem.set(k, v));
    } catch {}
  }

  private persistCache(): void {
    try {
      const obj: Record<string, string> = {};
      this.mem.forEach((v, k) => (obj[k] = v));
      localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
    } catch {}
  }
}
