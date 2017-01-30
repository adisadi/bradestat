import { Component, OnInit } from '@angular/core';

import { StatsService } from './stats.service';
import { IRating, IRank, IMemberRating, IStatType } from './interfaces/IRating';
import { IStatField,IStatFields } from './interfaces/IStatField';

import { MdSnackBar } from '@angular/material';

const { version: appVersion } = require('../../package.json')


var dateFormat = require('dateformat');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MdSnackBar]

})
export class AppComponent implements OnInit {

  private selectedStatType: string;
  private selectedStatField: string;

  private updateDate: Date;

  private statTypes: any[];
  private statFields: {[key:string]:IStatField[]; }={};

  private statFieldsTranslation: any = {
    "hits_ratio": { name: "Trefferquote", "unit": "%" },
    "xp_amount": { name: "Summe der XP", "unit": "Punkte" },
    "frags_count": { name: "Anzahl Kills", "unit": "Kills" },
    "capture_points": { name: "Summe der Eroberungspunkte", "unit": "Punkte" },
    "damage_dealt": { name: "Summe des Schadens", "unit": "Schaden" },
    "spotted_count": { name: "Anzahl gespottete Gegner", "unit": "Anzahl" },
    "battles_count": { name: "Anzahl Gefechte", "unit": "Anzahl" },
    "frags_avg": { name: "Durchschnitt Kills", "unit": "Kills/Gefecht" },
    "xp_avg": { name: "Durchschnitt XP", "unit": "XP/Gefecht" },
    "damage_avg": { name: "Durchschnitt Schaden", "unit": "Schaden/Gefecht" },
    "survived_ratio": { name: "Überlebensrate", "unit": "%" },
    "wins_ratio": { name: "Winrate", "unit": "%" },
    "spotted_avg": { name: "Durchschnitt gespottete Gegner", "unit": "Spotted/Gefecht" },
    "global_rating": { name: "Globales Rating", "unit": "Wert" },
    "xp_max": { name: "Maximale XP", "unit": "XP" },
  };

  private options: Object;

  private appVersion;

  constructor(private statsService: StatsService, private snackBar: MdSnackBar) {
    this.appVersion = appVersion;
  }

  ngOnInit(): void {
    //Get Available StatTypes;
    this.statsService.GetAvailableStatTypes().subscribe((data: string[]) => {
      this.statTypes = data.map(function (str) {
        return {
          type: str, name: function () {
            if (isNaN(this.type))
              return this.type;
            else
              return this.type + "-Tag";
          }
        };
      });

      this.statFields = {};
      for (let statType of this.statTypes) {
        console.log(statType);
        this.statsService.GetAvailableStatFields(statType.type).subscribe((data: string[]) => {
          console.log(data);
          this.statFields[statType.type] = data.map((str)=>{
            console.log(str);
            return {type:str,name:this.statFieldsTranslation[str].name,unit:this.statFieldsTranslation[str].unit} as IStatField;
          });
        });
      }
    });

    this.statsService.GetUpdateDate().subscribe((data: Date) => this.updateDate = dateFormat(data, 'dd.mm.yyyy HH:MM:ss'));
  }

  updateStat() {
    this.statsService.UpdateStatistics().subscribe((data: any) => {
      console.log(data);
      if (data.status === 'NOTUPDATED') {
        this.snackBar.open('Nur einmal pro Tag möglich.', data.status);
      }
      else {
        this.snackBar.open('Statistik aktualisiert', data.status);
      }
    });
  }

}
