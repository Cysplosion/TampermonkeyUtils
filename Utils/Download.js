class DownloadHelper {
    static Download(options) {
        const defaultHeaders = {};
        const defaultConflictAction  ="prompt";
        const defaultSaveAs = false;

        const rejectResponse = (error)=> ({
            downloaded:false,
            url:options.url,
            aborted:false,
            error:error
        })
        
        const abortResponse = {
            downloaded:false,
            url:options.url,
            aborted:true
        }

        const resolveResponse = {
            downloaded:true,
            url:options.url,
            aborted:false
        }

        const invalidOptionsResponse ={
            downloaded:false,
            url:options.url,
            aborted:false,
            error:new Error("Invalid options"),
            options:options,
        }

        let download;
        return {download:new Promise((res, rej) => {
            if(!DownloadHelper.#OptionsAreValid(options)) {
                rej(invalidOptionsResponse);
                return;
            }

            const onload = options.onload ?? (()=>{
                res(resolveResponse)
            })
            
            const onerror = options.onerror ?? ((error)=> {
                reject(error.toString().includes("The user aborted")
                 ? abortResponse
                 : rejectResponse(error));
            })

            const onprogress = (event) =>  {
                if(options.onprogress === undefined) return;

                const percentComplete = ((event.loaded / event.total) * 100).toFixed(0);
                options.onprogress(percentComplete);
            }

            const ontimeout = options.ontimeout ?? (()=>{
                //ontimeout
            })
            
            download = GM_download({
                url: options.url,
                name: options.fileName,
                headers: options.headers ?? defaultHeaders,
                conflictAction: options.conflictAction ?? defaultConflictAction,
                saveAs: options.saveAs ?? defaultSaveAs,
                onload: onload,
                onerror: onerror,
                onprogress: onprogress,
                ontimeout: ontimeout,
            });
        }),
        abort: download.abort}
    }

    static ProgressDownload(options) {
        const abortedString = "The user aborted";

        const rejectResponse = (error)=> ({
            downloaded:false,
            url:options.url,
            aborted:false,
            error:error
        });
        
        const abortResponse = {
            downloaded:false,
            url:options.url,
            aborted:true
        };

        const resolveResponse = {
            downloaded:true,
            url:options.url,
            aborted:false
        };

        const invalidOptionsResponse ={
            downloaded:false,
            url:options.url,
            aborted:false,
            error:new Error("Invalid options"),
            options:options,
        };

        const controller = new AbortController();
        const signal = controller.signal;

        let download;
        let failedDownloadAbort;
        let abort = ()=> {
            try {
                controller.abort(abortedString)
                failedDownloadAbort();
            } catch (error) {
            }
        };

        return {
            promise:new Promise((resolve,reject)=> {
                const onProgress = options.onProgress ?? ((progress)=>{
                    try{
                        Logger.log(0, `[${options.fileName} - Progress: ${progress}]`);
                    }
                    catch {
        
                    }
                });
        
                const onerror = options.onerror ?? ((error)=> {
                    let errorMessage = "";
                    try {
                        errorMessage = error.toString(); 
                    } catch (error) {
                    }

                    reject(errorMessage.includes(abortedString) || error?.details?.current === "USER_CANCELED"
                     ? abortResponse
                     : rejectResponse(error));
                });

                const onload = options.onload ?? (()=>{
                    resolve(resolveResponse);
                });

                if(!DownloadHelper.#OptionsAreValid(options)) {
                    reject(invalidOptionsResponse(options))
                    return;
                }

                try {
                    fetch(options.url, {signal:signal}).then(res=>{
                        if(res.status === 429) {
                            throw new Error("Too Many Requests");
                        }

                        DownloadHelper.#GetDownloadPercent(onProgress, res);

                        res.blob().then(blob=>{
                            download(blob);
                        }).catch(error=>{
                            onerror(error);
                        });
                    }).catch(error=>{
                        onerror(error);
                        
                        //backup download
                        //failedDownloadAbort = DownloadHelper.Download({url:options.url, fileName:options.fileName, onload:onload, onerror:onerror, onprogress:onProgress}).abort;
                    });
                }catch(error) {
                    onerror(error);
                }

                download = (blob)=> GM_download({
                    url: URL.createObjectURL(blob),
                    name: options.fileName,
                    conflictAction: options.conflictAction ?? "overwrite",
                    onerror: onerror,
                    onload: onload
                });
            }),
            abort:abort
        };
    }

    static async #GetDownloadPercent(onProgress, response) {
        try {
            let totalPercent = 0;
            const totalSize = response.clone().headers.get('Content-Length');

            let reader =  response.clone().body.getReader();
            while(true) {
                // done is true for the last chunk
                // value is Uint8Array of the chunk bytes
                const {done, value} = await reader.read();
                if (done) {
                    onProgress(100);
                    break;
                }

                totalPercent += parseFloat((value.length / totalSize) * 100);
                onProgress(totalPercent.toFixed(2))
            }
        } catch (error) {

        }
    }

    static #OptionsAreValid(options) {
        return options.url !== undefined
            && options.fileName !== undefined;
    }
}
