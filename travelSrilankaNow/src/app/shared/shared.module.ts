import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateRangePickerComponent } from './components/date-range-picker/date-range-picker.component';

@NgModule({
  declarations: [DateRangePickerComponent],
  imports: [CommonModule],
  exports: [DateRangePickerComponent]
})
export class SharedModule {}
