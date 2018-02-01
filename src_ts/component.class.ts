import ComponentFromJson from './helpers/component-from-json';
import Property from './property.class';
import GenerateReasonName from './helpers/generate-reason-name';

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
        const classes = this.component.styles.classes;
        let strClasses = '';
        if (classes.length) {
            const classesTypeDefs = classes.map(c => `| ${GenerateReasonName(c)}(string)`).join('\n');
            const toString = classes.map(c => `| ${GenerateReasonName(c)}(_) => "${c}"`).join('\n');
            const toClassname = classes.map(c => `| ${GenerateReasonName(c)}(className)`).join('\n');
            strClasses = `
                module Classes = {
                    type classesType = ${classesTypeDefs};
                    type t = list(classesType);
                    let to_string =
                        fun
                        ${toString};
                    let to_obj = (listOfClasses) =>
                    listOfClasses |> StdLabels.List.fold_left(
                        ~f=(obj, classType) => {
                            switch classType {
                                ${toClassname} => Js.Dict.set(obj, to_string(classType), className)
                            };
                            obj
                        },
                        ~init=Js.Dict.empty()
                    );
                };
            `;
        }

        const strMake = this.properties.length ? this.properties.map(property => property.make).join(',') + ',' : '';
        const strWrapJs = this.properties.length ? this.properties.map(property => property.wrapjs).join(',') : '';
        const requiredProps = this.properties.filter(prop => prop.signature.required);
        const strPropJs = this.properties.length ? `
            let props = ref(${requiredProps.length ? `{
                ${this.properties.map(prop => (prop.signature.required ? prop.wrapjs : '')).filter(str => str !== '').join(',')}
            }
            ` : 'Js.Obj.empty()'});
            ${this.properties.map(prop => (!prop.signature.required ? `
                if (${prop.safeName} != None) {
                    props := Js.Obj.assign(props^, {"${prop.name}": ${prop.propjs}})
                };
            ` : '')).join('\n')}
            ${strClasses ? `
                if (classes != None) {
                    props := Js.Obj.assign(props^, {"classes": Js.Nullable.from_opt(classes)})
                };
            ` : ''}
        ` : '';
        const added = this.properties.length ? this.properties.map(property => property.addToComponent).join('') : '';

        const hasOptionalNode = strMake.includes('option(ReasonReact.reactElement)');

        return `
            module ${this.name} = {
                ${added}
                ${strClasses}
                [@bs.module "${this.modulePath}"] external reactClass : ReasonReact.reactClass = "default";
                let make = (
                    ${strMake}
                    ${strClasses ? '~classes: option(Classes.t)=?,' : ''}
                    children
                ) => {
                    ${hasOptionalNode ? strPropJs : ''}
                    ReasonReact.wrapJsForReason(
                        ~reactClass,
                        ${hasOptionalNode ? '~props=props^' : `
                            ~props=${strWrapJs ? `{ ${strWrapJs} ${strClasses ? ', "classes": Js.Nullable.from_opt(optionMap(Classes.to_obj, classes))' : ''} }` : (strClasses ? '{ "classes": Js.Nullable.from_opt(optionMap(Classes.to_obj, classes)) }' : 'Js.Obj.empty()')}
                        `}
                        ,children
                    )
                }
            };
        `;
    }
}

export default Component;