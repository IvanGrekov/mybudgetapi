export interface ICalculatedTransactionValuesItem {
    // NOTE: key is ECurrency
    overall: number;
    [key: string]: number;
}

export interface ICalculatedTransactionValues {
    from: ICalculatedTransactionValuesItem;
    to: ICalculatedTransactionValuesItem;
}
