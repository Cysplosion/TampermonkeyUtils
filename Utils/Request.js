class Routes {
  /**
   * param: url
   */
  static get GetArtistPath() {
    return 'getArtistPath';
  }

  /**
   * param: tag
   */
  static get GetIsTagSaved() {
    return 'getIsTagSaved';
  }

  /**
   * param: path, query: solo* | count
   */
  static get GetFileExists() {
    return 'getFileExists';
  }

  /**
   * query: a | f | ext | files
   */
  static get OpenFile() {
    return 'openFile';
  }

  /**
   * query: service | userid | name
   */
  static get SaveArtist() {
    return 'saveArtist';
  }

  /**
   * param: url
   */
  static get unlinkArtist() {
    return 'unlinkArtist';
  }

  /**
   * param: tag, query: alt*
   */
  static get SaveTag() {
    return 'saveTag';
  }
}

class PMRequestBase {
  static BuildQueryString(query) {
    let keys = Array.from(Object.keys(query));
    let queryString = '';
    if (keys.length > 0) {
      queryString = '?';
      keys.forEach(element => {
        if (query[element] === undefined) return;
        queryString += `${element}=${query[element]}&`;
      });
      queryString = queryString.slice(0, -1);
    }

    return queryString;
  }

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
    const query = encodeURI(parameters.query ?? '');
    const param = parameters.parameter?.replaceAll('/', encodeURIComponent('/'));
    const url = `${parameters.endPoint}/${parameters.route}/${param !== undefined ? param + '/' : ''}${
      query.startsWith('?') && query !== '' ? query : '?' + query
    }`;
    parameters.url = url;

    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: parameters.method ?? 'GET',
        url: url,
        onload: function (response) {
          Logger.log(5, [parameters, url, response.responseText], 'Request');
          try {
            if (parameters.mode ?? 'JSON' == 'JSON') {
              resolve(JSON.parse(response.responseText));
            } else {
              resolve(response.responseText);
            }
          } catch (error) {
            Logger.error([error, parameters, response.responseText], 'Error');
            reject(null);
          }
        },
        onerror: function (error) {
          Logger.error(error, 'Error fetching data:');
          reject(error);
        },
      });
    });
  }
}

class PMRequest extends PMRequestBase {
  static ApiUrl = 'http://localhost:3000';

  static SaveTag(tagName, extras) {
    return this.HttpRequestPM({
      route: Routes.SaveTag,
      parameter: tagName,
      query: this.BuildQueryString({ extra: extras }),
    });
  }

  static StartServer() {
    GM_xmlhttpRequest({
      method: 'GET',
      url: 'http://localhost:3000',
      onload: () => {
        Logger.log(0, 'Server already started');
      },
      onerror: () => {
        window.open('openexp:-startServer');
      },
    });
  }

  static async GetFileExists(path, query) {
    const queryString = this.BuildQueryString(query);
    return this.HttpRequestPM({
      route: Routes.GetFileExists,
      parameter: path,
      query: queryString,
    });
  }

  static async OpenFile(query) {
    const queryString = this.BuildQueryString(query);
    Logger.log(3, 'OpenFile: ' + queryString);

    return this.HttpRequestPM({
      route: Routes.OpenFile,
      query: queryString,
    });
  }

  /**
   * Takes service, userid and name. all required.
   * @param query
   * @returns true if artist was newly set
   */
  static OpenArtist(query) {
    const queryString = this.BuildQueryString(query);
    Logger.log(3, 'OpenArist: ' + queryString);

    return this.HttpRequestPM({
      route: Routes.SaveArtist,
      query: queryString,
    });
  }

  static unlinkArtist(url) {
    Logger.log(3, 'OpenArist: ' + url, '-r');

    return this.HttpRequestPM({
      route: Routes.unlinkArtist,
      parameter: url,
    });
  }

  static IsTagSaved(name) {
    return this.HttpRequestPM({
      route: Routes.GetIsTagSaved,
      parameter: name,
    });
  }
}

String.prototype.format = function (...args) {
  let index = 0;
  return this.replace(/{(\w+)}/g, () => {
    return args[index++];
  });
};

class RoutesNew {
  //#region File
  static get #FilePrefix() {
    return 'File';
  }
  /**
   * site | id | file | fuzzy | service*
   */
  static get FileExists() {
    return `${this.#FilePrefix}/exists/site/{site}/id/{id}/file/{file}`;
  }

  /**
   * site | id | file | service*
   */
  static get OpenFile() {
    return `${this.#FilePrefix}/open/site/{site}/id/{id}/file/{file}`;
  }

  /**
   * site | id | service*
   */
  static get Files() {
    return `${this.#FilePrefix}/all/site/{site}/id/{id}`;
  }
  //#endregion

  //#region Artist
  static get #ArtistPrefix() {
    return 'Artist';
  }

  /**
   * site | id | service*
   */
  static get ArtistPath() {
    return `${this.#ArtistPrefix}/path/site/{site}/id/{id}`;
  }

  /**
   * site | id | service* | name*
   */
  static get OpenArtist() {
    return `${this.#ArtistPrefix}/open/site/{site}/id/{id}`;
  }

  /**
   * site | id | service*
   */
  static get UnlinkArtist() {
    return `${this.#ArtistPrefix}/unlink/site/{site}/id/{id}`;
  }
  //#endregion

  //#region
  static get #TagPrefix() {
    return 'Tag';
  }

  /**
   * tag | extra*
   */
  static get SaveTag() {
    return `${this.#TagPrefix}/save/{tag}`;
  }

  /**
   * tag
   */
  static get TagExists() {
    return `${this.#TagPrefix}/exists/{tag}`;
  }
  //#endregion
}

class PMRequestNew extends PMRequestBase {
  static ApiUrl = 'https://localhost:7216/api';

  //#region Artist
  static GetArtistPath(site, id, service = undefined) {
    const queryString = this.BuildQueryString({ service: service });

    return this.HttpRequestPM({
      route: RoutesNew.ArtistPath.format(site, id),
      query: queryString,
    });
  }

  static OpenArtist(site, id, service = undefined, name = undefined) {
    const queryString = this.BuildQueryString({ service: service, name: name });

    return this.HttpRequestPM({
      route: RoutesNew.OpenArtist.format(site, id),
      method: 'POST',
      query: queryString,
    });
  }

  static UnlinkArtist(site, id, service = undefined) {
    const queryString = this.BuildQueryString({ service: service });

    return this.HttpRequestPM({
      route: RoutesNew.UnlinkArtist.format(site, id),
      method: 'DELETE',
      query: queryString,
    });
  }
  //#endregion

  //#region File
  static FileExists(site, id, file, fuzzy, service = undefined) {
    const queryString = this.BuildQueryString({ fuzzy: fuzzy, service: service });

    return this.HttpRequestPM({
      route: RoutesNew.FileExists.format(site, id, file),
      query: queryString,
    });
  }

  static OpenFile(site, id, file, service = undefined) {
    const queryString = this.BuildQueryString({ service: service });

    return this.HttpRequestPM({
      route: RoutesNew.OpenFile.format(site, id, file),
      query: queryString,
    });
  }

  static GetAllFiles(site, id, service = undefined) {
    const queryString = this.BuildQueryString({ service: service });

    return this.HttpRequestPM({
      route: RoutesNew.Files.format(site, id),
      query: queryString,
    });
  }
  //#endregion

  //#region Tag
  static TagExists(tag) {
    return this.HttpRequestPM({
      route: RoutesNew.TagExists.format(tag),
    });
  }

  static SaveTag(tag, extra = undefined) {
    const queryString = this.BuildQueryString({ extra: extra });

    return this.HttpRequestPM({
      route: RoutesNew.SaveTag.format(tag),
      method: 'POST',
      query: queryString,
    });
  }
  //#endregion
}
