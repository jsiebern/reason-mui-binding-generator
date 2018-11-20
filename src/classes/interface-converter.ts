// @ts-ignore
import { parseRE, printRE } from 'reason';
import { SourceFile, InterfaceDeclaration, Type, FunctionTypeNode } from 'ts-simple-ast';
import { capitalize, uncapitalize, isNumeric, reservedNames } from '../helpers/generate-reason-name';
import * as Console from '../helpers/console';

const interfaceTypeOverrides = {
    'Overrides': 'Js.Dict.t(string)',
    'ComponentsProps': 'Js.Dict.t(string)',
};

class Converter {
    private readonly sourceFile: SourceFile;
    private readonly interfaceName: string;

    private interfaces: InterfaceDeclaration[] = [];

    constructor(sourceFile: SourceFile, interfaceName: string) {
        this.sourceFile = sourceFile;
        this.interfaceName = interfaceName;
    }

    private hasInterface(name: string) {
        return this.interfaces.some(i => i.getName() === name);
    }

    private safePropertyName(name: string) {
        if (isNumeric(name)) {
            return `[@bs.as "${name}"] n${name}`;
        }
        else if (reservedNames.indexOf(name) > -1) {
            return `[@bs.as "${name}"] ${name}_`;
        }
        else {
            return `[@bs.as "${name}"] ${uncapitalize(name)}`;
        }
    };

    private getDeclarationFromType(t: Type) {
        return t.getSymbolOrThrow().getDeclarations()[0];
    }

    private getReasonTypeForType(t: Type, noRecursion = false): string {
        let kindName = null;
        try {
            kindName = this.getDeclarationFromType(t).getKindName();
        }
        catch (e) {
        }
        if (t.isNumber()) {
            return 'float';
        }
        else if (t.isString()) {
            return 'string';
        }
        else if (t.isBoolean()) {
            return 'bool';
        }
        else if (t.isInterface()) {
            const i = <InterfaceDeclaration>this.getDeclarationFromType(t);
            if (!this.hasInterface(i.getName())) {
                this.interfaces = [i, ...this.interfaces];
            }
            return `${i.getName()}.t`;
        }
        else if (kindName === 'FunctionType') {
            const f = <FunctionTypeNode>this.getDeclarationFromType(t);
            return `
                (
                    ${f.getParameters().map(p => this.getReasonTypeForType(p.getType())).join(',')}
                ) => ${this.getReasonTypeForType(f.getReturnType())}
            `;
        }
        else if (t.isArray()) {
            let arrayType = t.getArrayType()
            return arrayType ? `array(${this.getReasonTypeForType(arrayType)})` : 'fixType';
        }
        else if (t.isUnion()) {
            let isStringLiteral = true;
            t.getUnionTypes().forEach(t => {
                if (!t.isStringLiteral()) {
                    isStringLiteral = false;
                }
            });

            return isStringLiteral ? 'string' : 'fixUnionType';
        }
        else if (t.isStringLiteral()) {
            return 'string';
        }
        else if (kindName === 'MappedType') {
            try {
                const name = t.getAliasSymbolOrThrow().getName();
                const node = t.getSymbolOrThrow().getDeclarations()[0];
                const typeAlias = node.getSourceFile().getTypeAliasOrThrow(name);
                const type = typeAlias.getType();
                const properties = type.getProperties();

                const newI = this.sourceFile.addInterface({
                    name,
                });
                properties.forEach((p, i) => {
                    newI.insertProperty(i, {
                        name: p.getName(),
                        type: typeof interfaceTypeOverrides[name] !== 'undefined' ? 'any' : p.getTypeAtLocation(typeAlias).getText(),
                        hasQuestionToken: true,
                    });
                });
                if (!this.hasInterface(name)) {
                    this.interfaces = [newI, ...this.interfaces];
                }

                return this.getReasonTypeForType(newI.getType());
            }
            catch (e) {
                console.log(e);
                return 'fixType';
            }
        }
        else if (!noRecursion && kindName == null) {
            if (t.getText().indexOf('import(') === 0 && t.getSymbol() != null) {
                const symbol = t.getSymbolOrThrow();
                console.log(symbol.getDeclarations()[0].getType().getText());
            }
            return this.getReasonTypeForType(t.getApparentType(), true);
        }
        else {
            Console.warn('-------------------------');
            Console.info(kindName);
            Console.error(t.getText());
            Console.warn('-------------------------');
            return `fixType`;
        }
    }

    private interfaceToModule(i: InterfaceDeclaration) {
        return `
            module ${capitalize(i.getName())} = {
                ${i.getProperties().length > 0 ? `
                    [@bs.deriving abstract]
                    type t = {
                        ${i.getProperties().map(property => `
                            ${property.hasQuestionToken() ? '[@bs.optional]' : ''}
                            ${this.safePropertyName(`${property.getName()}`)}: ${typeof interfaceTypeOverrides[i.getName()] !== 'undefined' ? interfaceTypeOverrides[i.getName()] : this.getReasonTypeForType(property.getType())},
                        `).join("\n")}
                    };
                ` : `type t;`}
            };
        `;
    }

    private extractInterfaces(t: Type) {
        if (t.isInterface()) {
            const i = <InterfaceDeclaration>this.getDeclarationFromType(t);
            i.getProperties().forEach(property => {
                this.extractInterfaces(property.getType());
            });

            if (!this.hasInterface(i.getName())) {
                this.interfaces = [...this.interfaces, i];
            }
        }
    }

    public parse() {
        const baseInterface = this.sourceFile.getInterfaceOrThrow(this.interfaceName);
        this.extractInterfaces(baseInterface.getType());

        // Parse once to generate mapped type modules
        this.interfaces.forEach(i => this.interfaceToModule(i));

        const composed = `
            type fixType;
            type fixUnionType;

            ${this.interfaces.map(i => this.interfaceToModule(i)).join("\n")}

            type t = ${baseInterface.getName()}.t;
        `;
        return printRE(parseRE(composed));
    }
};

export default Converter;