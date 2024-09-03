export const capitalize = (str: string): string => {
    const strParts = str.split(' ');

    return strParts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
};

export const addPluralSuffix = (str: string): string => {
    if (str.endsWith('y')) {
        return `${str.slice(0, -1)}ies`;
    }

    if (str.endsWith('s')) {
        return str;
    }

    return `${str}s`;
};
