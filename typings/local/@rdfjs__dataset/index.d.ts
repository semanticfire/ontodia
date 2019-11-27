import { Quad } from 'rdf-js';
import * as dataModel from '@rdfjs/data-model';

declare module "@rdfjs/dataset" {
    import { Quad, DefaultGraph, Term } from 'rdf-js';

    class DatasetCore implements Iterable<Quad> {
        constructor(quads?: Quad[]);

        add(quad: Quad): this;
        delete(quad: Quad): this;
        has(quad: Quad): boolean;

        match(
            subject?: Term,
            predicate?: Term,
            object?: Term,
            graph?: DefaultGraph,
        ): DatasetCore;

        readonly size: number;

        [Symbol.iterator](): Iterator<Quad>;
    }

    type Dataset = {
        dataset(quads?: Quad[]): DatasetCore;
    } & typeof dataModel;

    export = Dataset;
}
