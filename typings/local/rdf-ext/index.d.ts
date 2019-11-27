declare module "rdf-ext" {
    import { Quad,Stream,Term, DefaultGraph, BaseQuad } from "rdf-js";
   
    export function createDataset(options?: any): RDFStore;

    export function dataset(quads: Quad[]): Dataset;

    export function createGraph(triples: Triple[]):RDFGraph;

    export function createNamedNode(value: string): NamedNode;

    export function createLiteral(value: string, language?: string, datatype?: string): Literal;

    export class Parser {
        import(data: Stream<BaseQuad>): Stream<Quad>;
    }

    export class Parsers {
        constructor(parserMap: { [mimeType: string]: Parser });
        import(mimeType: string, data: any): Stream<Quad>;
        find(mimeType: string): Parser;
        list(): string[];
    }

    export class Dataset {
        add: (quad: Quad) => void;
        import: (dataStream: Stream<Quad>) => Promise<any>;
        length:  number;
        toArray: () => Quad[];
        addAll: (quads: Quad[]) => void;
        merge: (quads: Quad[])  => Dataset;
        match: (subject: Term, predicate : Term, object: Term, graph: DefaultGraph) => Dataset;
    }

    export class RDFStore {
        graphs: {
            [id: string]: { _graph: Triple[] };
        };
        add: (id: string, graph: RDFGraph) => void;
        match: (
            subject?: string,
            predicat?: string,
            object?: string,
            iri?: string,
            callback?: (result: any) => void,
            limit?: number
        ) => Promise<RDFGraph>;
    }

    export class RDFGraph {
        toArray: () => Triple[];
        match: (
            subject?: string,
            predicat?: string,
            object?: string,
            iri?: string,
            callback?: (result: any) => void,
            limit?: number
        ) => RDFGraph;
    }

    export class Triple {
        object: Node;
        predicate: Node;
        subject: Node;
    }

    export type Node = NamedNode | Literal | BlankNode;

    export class BlankNode {
        interfaceName: 'BlankNode';
        nominalValue: string;
    }

    export class NamedNode {
        interfaceName: 'NamedNode';
        nominalValue: string;
    }

    export class Literal {
        interfaceName: 'Literal';
        language: string;
        nominalValue: string;
    }
}
