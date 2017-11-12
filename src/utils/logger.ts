class Logger {
    debug (...args) {
        console.log(...args);
    }
    info (...args) {
        console.info(...args);
    }
    error (...args) {
        console.error(...args);
    }
}

export default new Logger();