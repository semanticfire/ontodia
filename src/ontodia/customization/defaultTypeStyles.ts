import { TypeStyleResolver } from './props';

const classIcon = require('../../../images/icons/class.svg');
const objectPropertyIcon = require('../../../images/icons/objectProperty.svg');
const datatypePropertyIcon = require('../../../images/icons/datatypeProperty.svg');
const personIcon = require('../../../images/icons/person.svg');
const countryIcon = require('../../../images/icons/country.svg');
const organizationIcon = require('../../../images/icons/organization.svg');
const locationIcon = require('../../../images/icons/location.svg');
const eventIcon = require('../../../images/icons/event.svg');
const objectIcon = require('../../../images/icons/object.svg');

export const DefaultTypeStyleBundle: TypeStyleResolver = types => {
    if (types.includes('http://www.w3.org/2002/07/owl#Class') ||
        types.includes('http://www.w3.org/2000/01/rdf-schema#Class')
    ) {
        return {color: '#eaac77', icon: classIcon};
    } else if (types.includes('http://www.w3.org/2002/07/owl#ObjectProperty')) {
        return {color: '#34c7f3', icon: objectPropertyIcon};
    } else if (types.includes('http://www.w3.org/2002/07/owl#DatatypeProperty')) {
        return {color: '#34c7f3', icon: datatypePropertyIcon};
    } else if (
        types.includes('http://xmlns.com/foaf/0.1/Person') ||
        types.includes('http://www.wikidata.org/entity/Q5')
    ) {
        return {color: '#eb7777', icon: personIcon};
    } else if (types.includes('http://www.wikidata.org/entity/Q6256')) {
        return {color: '#77ca98', icon: countryIcon};
    } else if (
        types.includes('http://schema.org/Organization') ||
        types.includes('http://dbpedia.org/ontology/Organisation') ||
        types.includes('http://xmlns.com/foaf/0.1/Organization') ||
        types.includes('http://www.wikidata.org/entity/Q43229')
    ) {
        return {color: '#77ca98', icon: organizationIcon};
    } else if (types.includes('http://www.wikidata.org/entity/Q618123')) {
        return {color: '#bebc71', icon: locationIcon};
    } else if (types.includes('http://www.wikidata.org/entity/Q1190554')) {
        return {color: '#b4b1fb', icon: eventIcon};
    } else if (types.includes('http://www.wikidata.org/entity/Q488383')) {
        return {color: '#53ccb2', icon: objectIcon};
    }
    return undefined;
};
