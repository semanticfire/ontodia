import { Stream,Quad, BaseQuad } from 'rdf-js'
import { Parsers } from 'rdf-ext';
import { Dictionary } from '../model';
import stringToStream = require('string-to-stream');

export enum ReaderState {
    reading,
    success,
    fail,
}

export type StreamReader<Type> = {
    mimeType: string,
    stream: Stream<BaseQuad>,
    state: ReaderState,
};

function workaroundForRDFXmlParser(body: string) {
    // For some strange reason we've encountered xml parser errors
    // when parsing rdf/xml file with Collection tag.
    // As I remember, file came from x3c Ontology
    // and this workaround helps to get file through xml parsing.
    return body.replace(/parseType=["']Collection["']/ig, 'parseType="Collection1"');
}

const POSTFIX_TO_MIME: { [key: string]: string } = {
    'xml': 'application/rdf+xml',
    'rdf': 'application/rdf+xml',
    'owl': 'application/rdf+xml',
    'nttl': 'application/x-turtle',
    'jsonld': 'application/ld+json',
    'rj': 'application/ld+json',
    'ttl': 'text/turtle',
    'nt': 'text/turtle',
    'nq': 'text/turtle',
};

function getMimeTypeByFileName(fileName: string): string {
    const postfix = (fileName.match(/\.([\S]*)$/i) || [])[1];
    return postfix ? POSTFIX_TO_MIME[postfix] : undefined;
}

export class RDFCompositeParser {
    private parsers: Parsers;

    constructor(public parserMap: Dictionary<any>) {
        this.parsers = new Parsers(parserMap);
    }

   

    parse(body: string, mimeType?: string, fileName?: string): Promise<any> {
        if (mimeType) {
            if (mimeType === 'application/rdf+xml') {
                body = workaroundForRDFXmlParser(body);
            }
            if (!this.parserMap[mimeType]) {
                throw Error('There is no parser for this MIME type');
            }
            return this.parserMap[mimeType].parse(body);
        } else {
            return this.tryToGuessMimeType(body, fileName);
        }
    }

    import(dataStream: any, mimeType?: string): Stream<Quad> {
        /*if (!mimeType || !this.parsers.find(mimeType)) {
            return this.tryToGuess(dataStream);
        }*/
        return this.parsers.import(mimeType, dataStream);
    }

    private tryToGuessMimeType(body: string, fileName?: string): Promise<any> {
        let mimeTypeIndex = 0;
        let mimeTypes = Object.keys(this.parserMap);

        if (fileName) {
            const mime = getMimeTypeByFileName(fileName);
            if (mime) {
                mimeTypes = [mime].concat(mimeTypes.filter(type => type !== mime));
            }
        }

        const errors: Array<{ mimeType: string; error: Error }> = [];

        const recursion = (): Promise<any> => {
            if (mimeTypeIndex < mimeTypes.length) {
                const mimeType = mimeTypes[mimeTypeIndex++];
                try {
                    const bodyToParse = mimeType === 'application/rdf+xml' ?
                        workaroundForRDFXmlParser(body) : body;

                    return this.parserMap[mimeType].parse(bodyToParse).catch((error: Error) => {
                        errors.push({ mimeType, error });
                        return recursion();
                    });
                } catch (error) {
                    return recursion();
                }
            } else {
                throw new Error('Unknow mime type. Parse errors:\n' +
                    errors.map(e => `${e.mimeType}: ${e.error.message} ${e.error.stack};\n`).join('\n'),
                );
            }
        };
        return recursion();
    }

    private tryToGuess(dataStream: any): void {
        const readers: StreamReader<Quad>[] = this.parsers.list().map(
            mimeType => ({
                mimeType: mimeType,
                state: ReaderState.reading,
                stream: this.parsers.import(mimeType, dataStream),
            }),
        );
        const results: {[id: string]: Quad[]} = {};

        for (let reader of readers) {
            results[reader.mimeType] = [];

            reader.stream.once('end', () => {
                reader.state = ReaderState.success;
                if (isParsingCompleted()) {
                    onParsingCompleted();
                }
            });

            reader.stream.once('error', () => {
                reader.state = ReaderState.fail;
                if (isParsingCompleted()) {
                    onParsingCompleted();
                }
            });

            reader.stream.on('data', (quad) => {
                results[reader.mimeType].push(quad);
            });
        }

        let parseError: Error = null;
        let endOfStream = false;
        const onDataCallbacks: ((data?: Quad) => void)[] = [];
        const onEndCallbacks: ((data?: Quad) => void)[] = [];
        const onErrorCallbacks: ((data?: Error) => void)[] = [];

        /*return {
            on: on,
            once: on,
        };*/

        function on(event: string, calback: (data?: any) => void) {
            if (event === 'data') {
                onDataCallbacks.push(calback);
            } else if (event === 'end') {
                onEndCallbacks.push(calback);
                if (endOfStream) {
                    calback(null);
                }
            } else if (event === 'error') {
                onErrorCallbacks.push(calback);
                if (parseError) {
                    calback(parseError);
                }
            }
        };

        function onParsingCompleted() {
            endOfStream = true;
            const successReader = readers.find(reader => reader.state === ReaderState.success);
            if (successReader) {
                console.warn(`It's figured out that the file MIME type is ${successReader.mimeType}`);
                ;
                for (const quad of results[successReader.mimeType]) {
                    for (const callback of onDataCallbacks) {
                        callback(quad);
                    }
                }
                for (const callback of onEndCallbacks) {
                    callback(null);
                }
            } else {
                parseError = Error('There is no parser for this MIME type');
                for (const callback of onErrorCallbacks) {
                    callback(parseError);
                }
            }
        }

        function isParsingCompleted() {
            return readers.filter(
                reader => reader.state === ReaderState.reading
            ).length === 0;
        }
    }
}
