import { createElement, ClassAttributes } from 'react';
import * as ReactDOM from 'react-dom';

import { Workspace, WorkspaceProps, RDFDataProvider, GroupTemplate } from '../index';

import { ExampleMetadataApi, ExampleValidationApi } from './resources/exampleMetadataApi';
import { onPageLoad, tryLoadLayoutFromLocalStorage, saveLayoutToLocalStorage } from './common';

const N3Parser: any = require('@rdfjs/parser-n3');
import {RdfXmlParser} from "rdfxml-streaming-parser";
const JsonLdParser: any = require('@rdfjs/parser-jsonld');

const data = require('./resources/testData2.ttl');

function onWorkspaceMounted(workspace: Workspace) {
    if (!workspace) { return; }

    const dataProvider = new RDFDataProvider({
        data: [
            {
                content: data,
                type: 'text/turtle',
                uri: 'file://testData.ttl',
            },
        ],
        //acceptBlankNodes: false,
        dataFetching: false,
        parsers: {
            'application/rdf+xml': new RdfXmlParser(),
            'application/ld+json': new JsonLdParser(),
            'text/turtle': new N3Parser(),
        },
    });

    const diagram = tryLoadLayoutFromLocalStorage();
    workspace.getModel().importLayout({
        diagram,
        validateLinks: true,
        dataProvider,
    });
}

const props: WorkspaceProps & ClassAttributes<Workspace> = {
    ref: onWorkspaceMounted,
    onSaveDiagram: workspace => {
        const diagram = workspace.getModel().exportLayout();
        window.location.hash = saveLayoutToLocalStorage(diagram);
        window.location.reload();
    },
    onPersistChanges: workspace => {
        const state = workspace.getEditor().authoringState;
        // tslint:disable-next-line:no-console
        console.log('Authoring state:', state);
    },
    metadataApi: new ExampleMetadataApi(),
    validationApi: new ExampleValidationApi(),
    viewOptions: {
        onIriClick: ({iri}) => window.open(iri),
        groupBy: [
            {linkType: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', linkDirection: 'in'},
        ],
    },
    elementTemplateResolver: types => {
        if (types.length === 0) {
            // use group template only for classes
            return GroupTemplate;
        }
        return undefined;
    },
};

onPageLoad(container => ReactDOM.render(createElement(Workspace, props), container));
