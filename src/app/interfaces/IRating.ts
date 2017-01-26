import {IMember} from './IMember';

export interface IRating {
    survived_ratio: IRank;
    capture_points: IRank;
    wins_ratio: IRank;
    spotted_count: IRank;
    account_id: Number;
    frags_avg: IRank;
    hits_ratio: IRank;
    xp_amount: IRank;
    frags_count: IRank;
    spotted_avg: IRank;
    battles_to_play: 0,
    damage_dealt: IRank;
    global_rating: IRank;
    xp_max: IRank;
    damage_avg: IRank;
    xp_avg: IRank;
    battles_count: IRank;
    date:Number;
}

export interface IRank {
    rank_delta: Number;
    rank: Number;
    value: Number
}

export interface IMemberRating{
    type:string;
    dates:{[key:string]:IRating; };
}

export interface IStatType{
    type:string;
    rank_fields:string[];
}

