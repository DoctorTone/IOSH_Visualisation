

export class TextLoader {
    constructor() {

    }

    load(url, callback) {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if ( xhr.readyState === xhr.DONE ) {
                if ( xhr.status === 200 || xhr.status === 0 ) {
                    if ( xhr.responseText ) {
                        callback( xhr.responseText );
                    } else {
                        console.error( 'DataLoader: "' + url + '" seems to be unreachable or the file is empty.' );
                    }
                } else {
                    console.error( 'DataLoader: Couldn\'t load "' + url + '" (' + xhr.status + ')' );
                }
            }
        };

        xhr.open( 'GET', url, true );
        xhr.send( null );
    }
}