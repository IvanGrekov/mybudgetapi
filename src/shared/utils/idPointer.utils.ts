export const getIdPointer = (id: number | string): string => {
    return `#${id}`;
};

export const getMultipleIdPointers = (nodeIds: Array<number | string>): string => {
    return `[#${nodeIds.join(', #')}]`;
};
