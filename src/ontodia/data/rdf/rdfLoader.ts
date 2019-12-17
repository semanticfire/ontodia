import { Dataset } from 'rdf-ext';
import { Dictionary } from '../model';
import { RDFCompositeParser } from './rdfCompositeParser';

export const DEFAULT_PROXY = '/lod-proxy/';

export class RDFLoader {
    private fetchingFileCatche: Dictionary<Promise<Dataset>> = {};
    public parser: RDFCompositeParser;
    public proxy: string;

    constructor(parameters: {
        parser: RDFCompositeParser;
        proxy?: string;
    }) {
        this.parser = parameters.parser;
        this.proxy = parameters.proxy || DEFAULT_PROXY;
    }

    private parseData(data: string, contentType?: string, prefix?: string): Promise<Dataset> {
        let result: Promise<Dataset>;
        result = this.parser.parse(data, contentType);
        return result;
    }

    downloadElement(elementId: string): Promise<Dataset> {
        const sharpIndex = elementId.indexOf('#');
        const fileUrl = sharpIndex !== -1 ? elementId.substr(0, sharpIndex) : elementId;
        let typePointer = 0;
        const mimeTypes = Object.keys(this.parser.parserMap);

        const recursivePart = async (): Promise<Dataset> => {
            const acceptType = mimeTypes[typePointer++];

            if (acceptType && (elementId.startsWith('http') || elementId.startsWith('file'))) {
                const body = await fetchFile({
                    url: elementId,
                    proxy: this.proxy,
                    headers: {
                        'Accept': acceptType,
                    },
                });
                try {
                    const data = this.parseData(body, acceptType, elementId);
                    return data;
                } catch (error) {
                    // tslint:disable-next-line:no-console
                    console.warn(error);
                    if (typePointer < mimeTypes.length) {
                        return recursivePart();
                    }
                    throw new Error(`Unable to parse response. Response: ${body}`);
                }
            }
            throw new Error(`Unable to fetch data using this id (${elementId})`);
        };

        if (!this.fetchingFileCatche[fileUrl]) {
            this.fetchingFileCatche[fileUrl] = recursivePart();
        }
        return this.fetchingFileCatche[fileUrl];
    }
}

async function fetchFile(params: {
    url: string;
    proxy: string;
    headers?: any;
}) {
    const response = await fetch(params.proxy + params.url, {
        method: 'GET',
        credentials: 'same-origin',
        mode: 'cors',
        cache: 'default',
        headers: params.headers || {
            'Accept': 'application/rdf+xml',
        },
    });
    if (response.ok) {
        return response.text();
    }
    const error = new Error(response.statusText);
    (error as any).response = response;
    throw error;
}
