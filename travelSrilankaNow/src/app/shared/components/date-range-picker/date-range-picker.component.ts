import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

export interface CalendarDay {
  date: string;
  day: number;
  currentMonth: boolean;
  isToday: boolean;
  isStart: boolean;
  isEnd: boolean;
  inRange: boolean;
  isDisabled: boolean;
  isHover: boolean;
}

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss']
})
export class DateRangePickerComponent implements OnInit, OnChanges {
  @Input() mode: 'single' | 'range' = 'range';
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() minDate: string = '';
  @Input() placeholder: string = 'Select date';
  @Output() apply = new EventEmitter<{ start: string; end: string }>();
  @Output() cancel = new EventEmitter<void>();

  isOpen = false;
  leftYear = 0;
  leftMonth = 0;
  tempStart: string = '';
  tempEnd: string = '';
  hoverDate: string = '';
  leftDays: CalendarDay[] = [];
  rightDays: CalendarDay[] = [];
  /** Tracks whether we're waiting for the end-date click in range mode */
  selectingEnd = false;

  readonly WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  readonly MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  ngOnInit(): void {
    const now = new Date();
    this.leftYear = now.getFullYear();
    this.leftMonth = now.getMonth();
    this.tempStart = this.startDate || '';
    this.tempEnd = this.endDate || '';
    this.buildCalendars();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate']) this.tempStart = this.startDate || '';
    if (changes['endDate']) this.tempEnd = this.endDate || '';
    this.buildCalendars();
  }

  get rightYear(): number {
    return this.leftMonth === 11 ? this.leftYear + 1 : this.leftYear;
  }

  get rightMonth(): number {
    return this.leftMonth === 11 ? 0 : this.leftMonth + 1;
  }

  get displayLabel(): string {
    const s = this.tempStart || this.startDate;
    if (!s) return this.placeholder;
    if (this.mode === 'single') return this.formatDisplay(s);
    const e = this.tempEnd || this.endDate;
    if (e && e !== s) return `${this.formatDisplay(s)} → ${this.formatDisplay(e)}`;
    return this.formatDisplay(s);
  }

  formatDisplay(d: string): string {
    if (!d) return '';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  toggleOpen(event: Event): void {
    event.stopPropagation();
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel(): void {
    this.tempStart = this.startDate || '';
    this.tempEnd = this.endDate || '';
    this.hoverDate = '';
    this.selectingEnd = false;
    const now = new Date();
    this.leftYear = now.getFullYear();
    this.leftMonth = now.getMonth();
    if (this.tempStart) {
      const d = new Date(this.tempStart + 'T00:00:00');
      this.leftYear = d.getFullYear();
      this.leftMonth = d.getMonth();
    }
    this.buildCalendars();
    this.isOpen = true;
  }

  private closePanel(): void {
    this.isOpen = false;
    this.selectingEnd = false;
    this.hoverDate = '';
  }

  prevMonth(event: Event): void {
    event.stopPropagation();
    if (this.leftMonth === 0) { this.leftMonth = 11; this.leftYear--; }
    else { this.leftMonth--; }
    this.buildCalendars();
  }

  nextMonth(event: Event): void {
    event.stopPropagation();
    if (this.leftMonth === 11) { this.leftMonth = 0; this.leftYear++; }
    else { this.leftMonth++; }
    this.buildCalendars();
  }

  onDayClick(event: Event, day: CalendarDay): void {
    event.stopPropagation();
    if (day.isDisabled || !day.currentMonth) return;

    if (this.mode === 'single') {
      this.tempStart = day.date;
      this.tempEnd = day.date;
      this.buildCalendars();
      this.onApply(event);
      return;
    }

    // Range mode: explicit two-phase selection
    if (!this.selectingEnd) {
      // Phase 1 — pick start date
      this.tempStart = day.date;
      this.tempEnd = '';
      this.hoverDate = '';
      this.selectingEnd = true;
    } else {
      // Phase 2 — pick end date
      this.selectingEnd = false;
      if (day.date < this.tempStart) {
        // Clicked before start → swap
        this.tempEnd = this.tempStart;
        this.tempStart = day.date;
      } else if (day.date === this.tempStart) {
        // Same day → single-day range
        this.tempEnd = day.date;
      } else {
        this.tempEnd = day.date;
      }
    }
    this.buildCalendars();
  }

  onDayHover(date: string): void {
    if (this.selectingEnd && this.tempStart) {
      this.hoverDate = date;
      this.buildCalendars();
    }
  }

  clearHover(): void {
    if (this.hoverDate) {
      this.hoverDate = '';
      this.buildCalendars();
    }
  }

  onApply(event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.tempStart) return;
    this.closePanel();
    this.apply.emit({ start: this.tempStart, end: this.tempEnd || this.tempStart });
  }

  onCancel(event?: Event): void {
    if (event) event.stopPropagation();
    this.closePanel();
    this.tempStart = this.startDate || '';
    this.tempEnd = this.endDate || '';
    this.cancel.emit();
  }

  get selectionHint(): string {
    if (this.mode === 'single') {
      return this.tempStart ? this.formatDisplay(this.tempStart) : 'Click a date to select';
    }
    if (!this.tempStart) return 'Click to select check-in date';
    if (this.selectingEnd) return `${this.formatDisplay(this.tempStart)} → Click to select check-out date`;
    if (this.tempEnd) return `${this.formatDisplay(this.tempStart)} → ${this.formatDisplay(this.tempEnd)}`;
    return 'Click to select check-in date';
  }

  trackByDate(_index: number, day: CalendarDay): string {
    return day.date;
  }

  private buildCalendars(): void {
    this.leftDays = this.buildMonth(this.leftYear, this.leftMonth);
    this.rightDays = this.buildMonth(this.rightYear, this.rightMonth);
  }

  private buildMonth(year: number, month: number): CalendarDay[] {
    const today = new Date().toISOString().split('T')[0];
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const days: CalendarDay[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const pm = month === 0 ? 11 : month - 1;
      const py = month === 0 ? year - 1 : year;
      days.push(this.makeDay(this.toDateStr(py, pm, d), d, false, today));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push(this.makeDay(this.toDateStr(year, month, d), d, true, today));
    }

    const remainder = 42 - days.length;
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remainder; d++) {
      days.push(this.makeDay(this.toDateStr(ny, nm, d), d, false, today));
    }

    return days;
  }

  private makeDay(dateStr: string, day: number, currentMonth: boolean, today: string): CalendarDay {
    const effectiveEnd = this.tempEnd || (this.selectingEnd && this.hoverDate ? this.hoverDate : '');
    const rs = this.tempStart && effectiveEnd
      ? (this.tempStart <= effectiveEnd ? this.tempStart : effectiveEnd) : this.tempStart;
    const re = this.tempStart && effectiveEnd
      ? (this.tempStart <= effectiveEnd ? effectiveEnd : this.tempStart) : '';

    return {
      date: dateStr,
      day,
      currentMonth,
      isToday: dateStr === today,
      isStart: !!(rs && dateStr === rs),
      isEnd: !!(re && dateStr === re) || (this.mode === 'single' && dateStr === this.tempStart),
      inRange: !!(rs && re && dateStr > rs && dateStr < re),
      isDisabled: !!(this.minDate && dateStr < this.minDate),
      isHover: dateStr === this.hoverDate
    };
  }

  private toDateStr(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
}
