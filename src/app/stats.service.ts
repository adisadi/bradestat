import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

// Observable operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { IRating, IRank, IMemberRating, IStatType } from './interfaces/IRating';
var dateFormat = require('dateformat');

@Injectable()
export class StatsService {


    private membersUrl = 'api/members';
    private statsUrl = 'api/stats';
    private statTypesUrl = 'api/statTypes';
    private statFieldsUrl = 'api/statFields';
    private updateDateUrl = 'api/updateDate';

    constructor(private http: Http) { }

    GetUpdateDate(): Observable<Date> {
        return this.http.get(this.updateDateUrl)
            .map((response: Response) => <string[]>response.json())
            .catch(this.handleError);
    }


    GetMembers(): Observable<string[]> {
        return this.http.get(this.membersUrl)
            .map((response: Response) => <string[]>response.json())
            .catch(this.handleError);
    }

    GetStats(statType: string, statField: string): Observable<any[]> {
        let url = `${this.statsUrl}/${statType}/${statField}`;
        return this.http.get(url)
            .map((response: Response) => {
                var result = <any>response.json();

                var statsSorted = result.dates.sort((r1, r2) => {
                    if (r1.date > r2.date)
                        return 1;
                    if (r1.date < r2.date)
                        return -1;
                    return 0;
                });

                //Create Dates
                let dates = statsSorted.map(function (obj) {
                    return dateFormat(new Date(obj.date * 1000), 'dd.mm.yyyy');
                })

                //Create Series
                let series = [];
                for (let member of result.members) {
                    let data = []
                    for (let stats of statsSorted) {

                        for (let ranking of stats.rankings) {

                            if (ranking.account_name === member)
                                data.push(ranking.ranking['value']);
                        }
                    }
                    series.push({ name: member, data: data });
                }

                return { series, dates };

            })
            .catch(this.handleError);


    }

    GetAvailableStatTypes(): Observable<string[]> {
        return this.http.get(this.statTypesUrl)
            .map((response: Response) => <string[]>response.json())
            .catch(this.handleError);
    }

    GetAvailableStatFields(statType: string): Observable<string[]> {
        let url = `${this.statFieldsUrl}/${statType}`;
        return this.http.get(url)
            .map((response: Response) => <string[]>response.json())
            .catch(this.handleError);
    }


    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}