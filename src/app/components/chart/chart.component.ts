import { Component, OnInit, Input } from '@angular/core';

import { StatsService } from './../../stats.service';
import { IRating, IRank, IMemberRating, IStatType } from './../../interfaces/IRating';

var dateFormat = require('dateformat');

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  private statType: string;
  private statField: string;

  @Input()
  set StatType(type: string) {
    this.statType = type;
  }

  get StatType(): string { return this.statType; }

  @Input()
  set StatField(type: string) {
    this.statField = type;
    this.updateChartData();
  }

  get StatField(): string { return this.statField; }


  private options: Object;

  constructor(private statsService: StatsService) { }

  ngOnInit() {
    this.updateChartData();
  }

  updateChartData(): void {

    if (this.statType === null || this.statField === null) {
      this.options = {
        title: { text: this.statField },
        series: null,
        xAxis: {
          categories: null
        }
      };
      return;
    }

    this.statsService.GetStats(this.statType, this.statField)
      .subscribe((data: any) => {
        this.options = {
          title: { text: this.statField },
          series: data.series,
          xAxis: {
            categories: data.dates
          },
          yAxis: {
            title: {
              text: 'Werte'
            }
          },
          plotOptions: {
            series: {
              shadow: true
            }
          },
          credits: {enabled:false},
          chart:{width:"330"}
        };
      },
      error => console.log(error),
      () => {
        console.log('Get Stats complete');
      });
  }

  private chart:any;
  saveInstance(chartInstance) {
        this.chart = chartInstance;
        /*this.chart.setSize(200,200);*/
    }

}
