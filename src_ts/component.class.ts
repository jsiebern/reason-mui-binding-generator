import ComponentFromJson from './helpers/component-from-json';
import Property from './property.class';

const ignoreProperties = ['classes', 'children'];

class Component {
    component: ComponentSignature

    name: string
    modulePath: string
    properties: Property[]
    inheritsFrom: string

    constructor(jsonString: string) {
        this.component = ComponentFromJson(jsonString);
        this.parse();
    }

    parse() {
        this.name = this.component.name;
        this.modulePath = this.component.importPath;
        this.inheritsFrom = this.component.inheritsFrom;

        const keys = Object.keys(this.component.props);
        const doneWithDouble: string[] = [];
        this.properties = keys.filter(key => ignoreProperties.indexOf(key) === -1).map(key => {
            let newKey = key;
            if (doneWithDouble.indexOf(key.toLowerCase()) === -1 && keys.filter(k => key !== k).map(k => k.toLowerCase()).indexOf(newKey.toLowerCase()) > -1) {
                doneWithDouble.push(key.toLowerCase());
                newKey += '2';
            }
            return new Property(newKey, this.component.props[key]);
        }).filter(property => property.valid);
    }

    render() {
        const strMake = this.properties.length ? this.properties.map(property => property.make).join(',') + ',' : '';
        const strWrapJs = this.properties.length ? this.properties.map(property => property.wrapjs).join(',') : '';
        const added = this.properties.length ? this.properties.map(property => property.addToComponent).join('') : '';

        return `
module ${this.name} = {
    ${added}
    [@bs.module "${this.modulePath}"] external reactClass : ReasonReact.reactClass = "default";
    let make = (
        ${strMake}
        children
    ) => ReasonReact.wrapJsForReason(
        ~reactClass,
        ~props=${strWrapJs ? `{ ${strWrapJs} }` : 'Js.Obj.empty()'},
        children
    );
};
        `;
    }
}

export default Component;