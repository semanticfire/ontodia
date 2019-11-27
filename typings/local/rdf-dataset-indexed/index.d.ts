declare module "rdf-dataset-indexed" {
    import { NamedNode, Quad, Stream , DefaultGraph,Term } from 'rdf-js';

    class Dataset {
        constructor (quads?: Quad[], factory?: { dataset(quads: Quad[]): Dataset});

        match(
            subject?: Term,
            predicat?: Term,
            object?: Term,
            graph?: DefaultGraph,
        ): Dataset;

        import(dataStream: Stream<Quad>): Promise<Quad>;
        add(quad: Quad): void;
        addAll(quads: Quad[]): void;
        merge(other: Dataset): Dataset;

        toArray(): Quad[];
        toStream(): Stream<Quad>;

        clone(): Dataset;
        forEach(calback: (quad: Quad) => void): void;
        includes(quad: Quad): boolean;

        _quads: Quad[];
        _dataFactory(quads: Quad[]): Dataset;
        readonly length: number;
    }

    export = Dataset;

    // export default Dataset;
}