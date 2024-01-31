class Logger{
    //1 
    //2 
    //3+ specific info about files
    //4+ Ui logging
    static defaultLogger = new Logger();
     static loggingLevel = 3; //specificFile == -1 ? GM_getValue("LoggingLevel", 0) : 99;

    static get log() {
        return (level, message, groupName)=> this.defaultLogger.log(level, message, groupName);
    }

    static get error() {
        return (message, groupName)=> this.defaultLogger.error(message, groupName);
    }

    log(level, messages, groupName = "") {
        if(Logger.loggingLevel < level) {
            return false;
        }

        if(Array.isArray(messages)) {
            console.groupCollapsed(groupName);
            for(let i = 0; i < messages.length;i++) {
                console.log(messages[i]);
            }
            console.groupEnd();
        }
        else {
            console.log(messages);
        }
        return true;
    }

    /**
     * Minimum Loggerlevel of 1
     */
    error(messages, groupName = "") {
        if(Logger.loggingLevel < 1) {
            return false;
        }

        if(Array.isArray(messages)) {
            console.groupCollapsed(groupName);
            for(let i = 0; i < messages.length;i++) {
                console.log(messages[i]);
            }
            console.groupEnd();
        }
        else {
            console.log(messages);
        }
        return true;
    }
}