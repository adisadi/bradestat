import { Component, OnInit } from '@angular/core';

import { StatsService } from './stats.service';
import { IRating, IRank, IMemberRating, IStatType } from './interfaces/IRating';

const { version: appVersion } = require('../../package.json')


var dateFormat = require('dateformat');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private selectedStatType: string;
  private selectedStatField: string;

  private updateDate:Date;

  private statTypes: any[];
  private statFields: string[];

  private options: Object;

  private appVersion;

  constructor(private statsService: StatsService) {
    this.appVersion=appVersion;
   }

  ngOnInit(): void {
    //Get Available StatTypes;
    this.statsService.GetAvailableStatTypes().subscribe((data: string[]) => {
      this.statTypes = data.map(function(str){
        return {type:str, name: function(){
          if (isNaN(this.type))
            return this.type;
          else
            return this.type + "-Tag";  
        }};
      });
      this.selectedStatType = this.statTypes[0].type;
      this.updateChartFields(this.selectedStatType);
    });

    this.statsService.GetUpdateDate().subscribe((data:Date)=>this.updateDate=dateFormat(data, 'dd.mm.yyyy HH:MM:ss'));
  }


  updateChartFields(statType: string) {
    this.statsService.GetAvailableStatFields(statType).subscribe((data: string[]) => {
      this.statFields = data;
      this.selectedStatField = this.statFields[0];
   /*   this.updateChartData(this.selectedStatType, this.selectedStatField);*/
    });
  }

  /*updateChartData(statType: string, statField: string): void {

    if (statType === null || statField === null) {
      this.options = {
        title: { text: statField },
        series: null,
        xAxis: {
          categories: null
        }
      };
      return;
    }

    this.statsService.GetStats(statType, statField)
      .subscribe((data: any) => {
        this.options = {
          title: { text: statField },
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
        };
      },
      error => console.log(error),
      () => {
        console.log('Get Stats complete');
      });
  }*/

 /* sortRatings(r1: IRating, r2: IRating): number {
    if (r1.date > r2.date)
      return 1;
    if (r1.date < r2.date)
      return -1;
    return 0;
  }*/

  selectStatType(statType: string) {
    this.selectedStatType = statType;
    this.updateChartFields(this.selectedStatType);
  }

  selectStatField(statField: string) {
    this.selectedStatField = statField;
   /* this.updateChartData(this.selectedStatType, this.selectedStatField);*/
  }

}
