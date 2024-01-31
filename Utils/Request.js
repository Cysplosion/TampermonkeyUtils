class Routes {
    /**
     * param: url
     */
    static get GetArtistPath() {
        return "getArtistPath";
    }

    /**
     * param: tag
     */
    static get GetIsTagSaved() {
        return "getIsTagSaved";
    }

    /**
     * param: path, query: solo* | count
     */
    static get GetFileExists() {
        return "getFileExists";
    }

    /**
     * query: a | f | ext | files
     */
    static get OpenFile() {
        return "openFile";
    }

    /**
     * query: service | userid | name
     */
    static get SaveArtist() {
        return "saveArtist";
    }

    /**
     * param: tag, query: alt*
     */
    static get SaveTag() {
        return "saveTag";
    }
}

class PMRequest {
    static ApiUrl = "http://localhost:3000";

    /**
     * route* | parameter | query | method = GET
     * @param {*} parameters 
     * @returns 
     */
    static async HttpRequestPM(parameters) {
        parameters.endPoint = this.ApiUrl;
        return this.HttpRequest(parameters);
    }

    static async HttpRequest(parameters) {
        const query = encodeURI(parameters.query ?? "");
        const param = parameters.parameter?.replaceAll("/", encodeURIComponent("/"));
        const url = `${parameters.endPoint}/${parameters.route}/${param !== undefined ? param + "/" : ""}${query.startsWith("?") && query !== "" ? query : "?" + query}`;
        parameters.url = url;

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: parameters.method ?? "GET",
                url: url,
                onload: function(response) {
                    Logger.log(5, [parameters, url, response.responseText], "Request");
                    try {
                        if(parameters.mode ?? "JSON" == "JSON") {
                            resolve(JSON.parse(response.responseText));
                        } else {
                            resolve(response.responseText);
                        }
                    } catch (error) {
                        Logger.error([error, parameters, response.responseText], "Error");
                        reject(null);
                    }
                },
                onerror: function(error) {
                    Logger.error(error, "Error fetching data:");
                    reject(error);
                }
            });
        });
    }

    static SaveTag(tagName, extras) {
        return this.HttpRequestPM({
                route:Routes.SaveTag,
                parameter:tagName,
                query:this.BuildQueryString({extra:extras})
            });
    }

    static StartServer() {
        GM_xmlhttpRequest({
            method:"GET",
            url:"http://localhost:3000",
            onload: ()=> {
                Logger.log(0, "Server already started");
            },
            onerror:()=> {
                window.open("openexp:-startServer");
            }
        });
    }

    static async GetFileExists(path, query) {
        const queryString = this.BuildQueryString(query);
        return this.HttpRequestPM({
            route:Routes.GetFileExists,
            parameter:path,
            query:queryString
        });
    }

    static async OpenFile(query) {
        const queryString = this.BuildQueryString(query);
        Logger.log(3, "OpenFile: " + queryString);

        return this.HttpRequestPM({
            route:Routes.OpenFile,
            query:queryString,
        });
    }

    /**
     * Takes service, userid and name. all required.
     * @param query 
     * @returns true if artist was newly set
     */
    static OpenArtist(query) {
        const queryString = this.BuildQueryString(query);
        Logger.log(3, "OpenArist: " + queryString);

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: this.ApiUrl + "saveArtist" + queryString,
                onload: function(response) {
                    Logger.log(5, response.responseText);

                    let res = JSON.parse(response.responseText);
                    if(response.status == 500) {
                        callback({"exists":false, "files":[]});
                        return;
                    }
                    
                    resolve(JSON.parse(response.responseText));
                },
                onerror: function(error) {
                    reject(JSON.parse(false));
                }
            });
        });
    }

    static IsTagSaved(name) {
        return this.HttpRequestPM({
            route:Routes.GetIsTagSaved,
            parameter:name,
        });
    }

    static BuildQueryString(query) {
        let keys = Array.from(Object.keys(query));
        let queryString = "";
        if(keys.length > 0){
            queryString = "?";
            keys.forEach((element) => {
                queryString += `${element}=${query[element]}&`;
            });
            queryString = queryString.slice(0,-1);
        }

        return queryString;
    }
}