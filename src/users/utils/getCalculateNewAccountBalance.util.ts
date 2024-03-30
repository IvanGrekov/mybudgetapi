export const getCalculateNewAccountBalance = (rate: number, isInitBalance?: boolean) => {
    const fieldName = isInitBalance ? 'initBalance' : 'balance';

    return () => `${fieldName} * ${rate}`;
};
