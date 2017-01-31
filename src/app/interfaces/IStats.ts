import { IRank } from './IRating';

export interface IStats {
    members: string[],
    dates: IStatsDetail[]
}

export interface IStatsDetail {
    date: string,
    rankings: any[]
}

export interface IRankingDetail {
    account_name: string;
    ranking: IRank;
}