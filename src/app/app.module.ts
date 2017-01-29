import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import 'hammerjs';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChartModule } from 'angular2-highcharts';

import { AppComponent } from './app.component';
import {StatsService} from './stats.service';
import { ChartComponent } from './components/chart/chart.component';

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ChartModule,
    MaterialModule.forRoot(),
    FlexLayoutModule.forRoot() 
  ],
  providers: [StatsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
