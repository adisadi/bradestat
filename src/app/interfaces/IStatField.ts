export interface IStatField{
    type:string;
    name:string;
    unit:string;
}

export interface IStatFields{
    statType:string;
    statFields:Array<IStatField>
}