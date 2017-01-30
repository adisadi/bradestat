import { Component, OnInit, Input } from '@angular/core';

import { StatsService } from './../../stats.service';

import { IStatField } from './../../interfaces/IStatField';

var dateFormat = require('dateformat');

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  private statType: string;
  private statField: IStatField;

  @Input()
  set StatType(type: string) {
    this.statType = type;
  }

  get StatType(): string { return this.statType; }

  @Input()
  set StatField(type: IStatField) {
    this.statField = type;
    this.updateChartData();
  }

  get StatField(): IStatField { return this.statField; }




  private options: Object;

  constructor(private statsService: StatsService) { }

  ngOnInit() {
    this.updateChartData();
  }

  updateChartData(): void {

    if (this.statType === null || this.statField === null) {
      this.options = {
        title: { text: this.StatField.name },
        series: null,
        xAxis: {
          categories: null
        },
        credits: {enabled:false},
        chart:{width:300}
      };
      return;
    }

    this.statsService.GetStats(this.statType, this.statField.type)
      .subscribe((data: any) => {
        this.options = {
          title: { text: this.StatField.name },
          series: data.series,
          xAxis: {
            categories: data.dates
          },
          yAxis: {
            title: {
              text: this.StatField.unit
            }
          },
          plotOptions: {
            series: {
              shadow: true
            }
          },
          credits: {enabled:false},
          chart:{width:300}
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
