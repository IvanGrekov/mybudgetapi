const log = (message: string, ...data: unknown[]): void => {
    if (process.env.NODE_ENV !== 'development') {
        return;
    }

    console.log(message, ...data);
};

export default log;
