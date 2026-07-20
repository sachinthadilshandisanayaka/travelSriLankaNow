import { Component, Input, AfterViewInit, OnDestroy, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PageHeaderService } from '../../../services/page-header.service';
import { PageHeaderBackground } from '../../../models/page-header-background.model';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() subtitle = '';
  @Input() title = '';
  @Input() description = '';
  @Input() theme: 'locations' | 'events' | 'gallery' | 'places' | 'packages' | 'default' = 'default';
  @Input() showAnimation = true;

  @ViewChild('lottieContainer') lottieContainer!: ElementRef<HTMLDivElement>;

  // Dynamic background properties
  backgroundImage: string | null = null;
  overlayStyle: { [key: string]: string } = {};
  isLoadingBackground = true;
  private viewInitialized = false;

  constructor(
    private pageHeaderService: PageHeaderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDynamicBackground();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    // Only init animation if background loading is already complete and no image
    if (!this.isLoadingBackground && this.showAnimation && !this.backgroundImage) {
      this.initAnimation();
    }
  }

  private loadDynamicBackground(): void {
    if (this.theme === 'default') {
      this.isLoadingBackground = false;
      this.tryInitAnimation();
      return;
    }

    this.pageHeaderService.getActiveBackground(this.theme).subscribe({
      next: (bg: PageHeaderBackground | null) => {
        if (bg && bg.imageUrl) {
          this.backgroundImage = bg.imageUrl;
          // Apply overlayOpacity as the alpha channel (fixes the opacity slider bug)
          this.overlayStyle = {
            'background-color': this.buildOverlayColor(
              bg.overlayColor || 'rgba(28, 77, 141, 0.7)',
              bg.overlayOpacity ?? 0.7
            )
          };
        }
        // Override hardcoded @Input values with DB values when present
        if (bg?.subtitle)     this.subtitle     = bg.subtitle;
        if (bg?.title)        this.title        = bg.title;
        if (bg?.description)  this.description  = bg.description;
        this.isLoadingBackground = false;
        this.cdr.detectChanges();
        this.tryInitAnimation();
      },
      error: () => {
        this.isLoadingBackground = false;
        this.cdr.detectChanges();
        this.tryInitAnimation();
      }
    });
  }

  private tryInitAnimation(): void {
    // Only initialize animation if view is ready and no background image
    if (this.viewInitialized && this.showAnimation && !this.backgroundImage && this.lottieContainer) {
      setTimeout(() => this.initAnimation(), 0);
    }
  }

  /** Extract the RGB from an rgba/rgb string and apply the given opacity as alpha. */
  private buildOverlayColor(colorStr: string, opacity: number): string {
    const match = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
    }
    return colorStr;
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initAnimation(): void {
    // Create animated decorative elements based on theme
    if (this.lottieContainer) {
      this.lottieContainer.nativeElement.innerHTML = this.getThemeDecoration();
    }
  }

  private getThemeDecoration(): string {
    switch (this.theme) {
      case 'locations':
        return `
          <svg class="theme-decoration locations-deco" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="locGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#4988C4"/>
                <stop offset="100%" style="stop-color:#1C4D8D"/>
              </linearGradient>
            </defs>
            <!-- Compass -->
            <circle cx="100" cy="100" r="60" fill="none" stroke="url(#locGrad)" stroke-width="3" class="compass-ring"/>
            <circle cx="100" cy="100" r="50" fill="rgba(73, 136, 196, 0.1)"/>
            <!-- Compass needle -->
            <g class="compass-needle">
              <polygon points="100,50 95,100 100,95 105,100" fill="#D4AF73"/>
              <polygon points="100,150 95,100 100,105 105,100" fill="#1C4D8D"/>
            </g>
            <!-- Direction marks -->
            <text x="100" y="35" text-anchor="middle" fill="#1C4D8D" font-size="12" font-weight="bold">N</text>
            <text x="165" y="104" text-anchor="middle" fill="#6B6762" font-size="10">E</text>
            <text x="100" y="175" text-anchor="middle" fill="#6B6762" font-size="10">S</text>
            <text x="35" y="104" text-anchor="middle" fill="#6B6762" font-size="10">W</text>
            <!-- Floating location pins -->
            <g class="floating-pin pin-1">
              <path d="M30,40 C30,25 45,25 45,40 C45,55 37.5,65 37.5,65 C37.5,65 30,55 30,40" fill="#D4AF73"/>
              <circle cx="37.5" cy="40" r="5" fill="white"/>
            </g>
            <g class="floating-pin pin-2">
              <path d="M155,60 C155,45 170,45 170,60 C170,75 162.5,85 162.5,85 C162.5,85 155,75 155,60" fill="#4988C4"/>
              <circle cx="162.5" cy="60" r="5" fill="white"/>
            </g>
          </svg>
        `;
      case 'events':
        return `
          <svg class="theme-decoration events-deco" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <!-- Calendar -->
            <rect x="50" y="50" width="100" height="100" rx="10" fill="white" stroke="#1C4D8D" stroke-width="2"/>
            <rect x="50" y="50" width="100" height="25" rx="10" ry="0" fill="#1C4D8D"/>
            <rect x="50" y="65" width="100" height="10" fill="#1C4D8D"/>
            <!-- Calendar hooks -->
            <rect x="70" y="42" width="8" height="20" rx="2" fill="#D4AF73"/>
            <rect x="122" y="42" width="8" height="20" rx="2" fill="#D4AF73"/>
            <!-- Calendar text -->
            <text x="100" y="62" text-anchor="middle" fill="white" font-size="10" font-weight="bold">EVENTS</text>
            <!-- Date grid -->
            <g fill="#6B6762" font-size="10">
              <text x="65" y="100">1</text><text x="85" y="100">2</text><text x="105" y="100">3</text><text x="125" y="100">4</text>
              <text x="65" y="120">5</text><text x="85" y="120">6</text><text x="105" y="120">7</text><text x="125" y="120">8</text>
            </g>
            <!-- Highlighted date -->
            <circle cx="105" cy="115" r="10" fill="#D4AF73" class="pulse-circle"/>
            <text x="105" y="119" text-anchor="middle" fill="white" font-size="10" font-weight="bold">7</text>
            <!-- Confetti -->
            <rect class="confetti c1" x="30" y="30" width="8" height="8" fill="#D4AF73" transform="rotate(45 34 34)"/>
            <rect class="confetti c2" x="170" y="50" width="6" height="6" fill="#4988C4" transform="rotate(30 173 53)"/>
            <rect class="confetti c3" x="40" y="160" width="7" height="7" fill="#1C4D8D" transform="rotate(60 43.5 163.5)"/>
            <circle class="confetti c4" cx="160" cy="150" r="4" fill="#D4AF73"/>
            <circle class="confetti c5" cx="25" y="100" r="3" fill="#4988C4"/>
          </svg>
        `;
      case 'gallery':
        return `
          <svg class="theme-decoration gallery-deco" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <!-- Camera body -->
            <rect x="40" y="70" width="120" height="80" rx="10" fill="#1C4D8D"/>
            <rect x="45" y="75" width="110" height="70" rx="8" fill="#0F2854"/>
            <!-- Lens -->
            <circle cx="100" cy="110" r="30" fill="#2a2826" stroke="#D4AF73" stroke-width="3"/>
            <circle cx="100" cy="110" r="22" fill="#4988C4"/>
            <circle cx="100" cy="110" r="15" fill="#1C4D8D"/>
            <circle cx="92" cy="102" r="5" fill="rgba(255,255,255,0.3)" class="lens-flare"/>
            <!-- Flash -->
            <rect x="130" y="78" width="20" height="12" rx="2" fill="#D4AF73"/>
            <!-- Viewfinder -->
            <rect x="70" y="55" width="30" height="15" rx="3" fill="#1C4D8D"/>
            <!-- Shutter button -->
            <circle cx="140" cy="62" r="8" fill="#D4AF73" class="shutter-btn"/>
            <!-- Photo frames floating -->
            <g class="photo-float p1">
              <rect x="15" y="40" width="35" height="28" rx="2" fill="white" stroke="#e8e4e0" stroke-width="1"/>
              <rect x="18" y="43" width="29" height="18" fill="#BDE8F5"/>
              <circle cx="25" cy="50" r="4" fill="#D4AF73"/>
            </g>
            <g class="photo-float p2">
              <rect x="155" y="30" width="30" height="24" rx="2" fill="white" stroke="#e8e4e0" stroke-width="1"/>
              <rect x="158" y="33" width="24" height="14" fill="#4988C4"/>
            </g>
            <g class="photo-float p3">
              <rect x="160" y="160" width="32" height="26" rx="2" fill="white" stroke="#e8e4e0" stroke-width="1"/>
              <rect x="163" y="163" width="26" height="16" fill="#1C4D8D"/>
            </g>
          </svg>
        `;
      case 'places':
        return `
          <svg class="theme-decoration places-deco" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <!-- Hotel building -->
            <rect x="60" y="60" width="80" height="100" fill="#1C4D8D"/>
            <rect x="65" y="55" width="70" height="10" fill="#0F2854"/>
            <!-- Roof decoration -->
            <polygon points="100,40 60,55 140,55" fill="#D4AF73"/>
            <!-- Windows -->
            <g fill="#BDE8F5">
              <rect x="72" y="70" width="15" height="15" rx="2"/>
              <rect x="92" y="70" width="15" height="15" rx="2"/>
              <rect x="112" y="70" width="15" height="15" rx="2"/>
              <rect x="72" y="95" width="15" height="15" rx="2"/>
              <rect x="92" y="95" width="15" height="15" rx="2"/>
              <rect x="112" y="95" width="15" height="15" rx="2"/>
            </g>
            <!-- Door -->
            <rect x="88" y="125" width="24" height="35" fill="#D4AF73"/>
            <circle cx="107" cy="145" r="2" fill="#0F2854"/>
            <!-- Stars -->
            <g class="stars" fill="#D4AF73">
              <polygon class="star s1" points="40,50 42,56 48,56 43,60 45,66 40,62 35,66 37,60 32,56 38,56"/>
              <polygon class="star s2" points="160,45 162,51 168,51 163,55 165,61 160,57 155,61 157,55 152,51 158,51"/>
              <polygon class="star s3" points="30,120 31.5,124 36,124 32.5,127 34,131 30,128 26,131 27.5,127 24,124 28.5,124"/>
            </g>
            <!-- Utensils for restaurant -->
            <g class="utensils" transform="translate(150, 100)">
              <ellipse cx="20" cy="30" rx="18" ry="6" fill="none" stroke="#4988C4" stroke-width="2"/>
              <line x1="20" y1="30" x2="20" y2="5" stroke="#4988C4" stroke-width="2"/>
              <path d="M5,5 L5,20 Q5,25 10,25 L10,5" fill="none" stroke="#D4AF73" stroke-width="2"/>
              <line x1="7.5" y1="5" x2="7.5" y2="15" stroke="#D4AF73" stroke-width="1"/>
            </g>
          </svg>
        `;
      case 'packages':
        return `
          <svg class="theme-decoration packages-deco" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <!-- Suitcase -->
            <rect x="60" y="90" width="80" height="60" rx="6" fill="#1C4D8D"/>
            <rect x="60" y="90" width="80" height="14" fill="#0F2854"/>
            <!-- Handle -->
            <path d="M85,90 L85,75 Q85,68 92,68 L108,68 Q115,68 115,75 L115,90" fill="none" stroke="#D4AF73" stroke-width="6"/>
            <!-- Straps -->
            <rect x="78" y="90" width="8" height="60" fill="#D4AF73"/>
            <rect x="114" y="90" width="8" height="60" fill="#D4AF73"/>
            <!-- Luggage tag -->
            <g transform="translate(140, 108)">
              <rect x="0" y="0" width="18" height="14" rx="2" fill="#D4AF73"/>
              <circle cx="9" cy="7" r="2" fill="#0F2854"/>
              <line x1="0" y1="-6" x2="4" y2="0" stroke="#D4AF73" stroke-width="2"/>
            </g>
            <!-- Stars -->
            <g class="stars" fill="#D4AF73">
              <polygon class="star s1" points="40,55 42,61 48,61 43,65 45,71 40,67 35,71 37,65 32,61 38,61"/>
              <polygon class="star s2" points="160,50 162,56 168,56 163,60 165,66 160,62 155,66 157,60 152,56 158,56"/>
              <polygon class="star s3" points="35,130 36.5,134 41,134 37.5,137 39,141 35,138 31,141 32.5,137 29,134 33.5,134"/>
            </g>
            <!-- Flight path -->
            <path class="wave-path w1" d="M20,40 Q80,20 160,45" fill="none" stroke="#BDE8F5" stroke-width="2" stroke-dasharray="4 4"/>
          </svg>
        `;
      default:
        return `
          <svg class="theme-decoration default-deco" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <!-- Palm tree -->
            <rect x="95" y="100" width="10" height="60" fill="#8B7355"/>
            <!-- Leaves -->
            <g fill="#4988C4">
              <ellipse cx="100" cy="80" rx="40" ry="15" transform="rotate(-30 100 80)"/>
              <ellipse cx="100" cy="80" rx="40" ry="15" transform="rotate(30 100 80)"/>
              <ellipse cx="100" cy="85" rx="35" ry="12" transform="rotate(-60 100 85)"/>
              <ellipse cx="100" cy="85" rx="35" ry="12" transform="rotate(60 100 85)"/>
            </g>
            <!-- Sun -->
            <circle cx="160" cy="50" r="20" fill="#D4AF73" class="sun-glow"/>
            <!-- Waves -->
            <path class="wave-path w1" d="M0,170 Q25,160 50,170 T100,170 T150,170 T200,170 L200,200 L0,200 Z" fill="#BDE8F5"/>
            <path class="wave-path w2" d="M0,180 Q25,170 50,180 T100,180 T150,180 T200,180 L200,200 L0,200 Z" fill="#4988C4" opacity="0.5"/>
          </svg>
        `;
    }
  }
}
