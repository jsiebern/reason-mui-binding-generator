import * as Fs from 'fs';
import * as Path from 'path';

const GetIcons = (): string[] => JSON.parse(Fs.readFileSync(Path.join(__dirname, '../', 'output', 'json', 'icons.json'), 'utf8'));

const RenderIcons = () => {
    const icons = GetIcons();

    return `
    [@bs.deriving jsConverter]
        type color = [
        | [@bs.as "inherit"] \`Inherit
        | [@bs.as "primary"] \`Primary
        | [@bs.as "secondary"] \`Secondary
        | [@bs.as "action"] \`Action
        | [@bs.as "error"] \`Error
        | [@bs.as "disabled"] \`Disabled
        ];

        [@bs.deriving jsConverter]
        type fontSize = [
        | [@bs.as "inherit"] \`Inherit
        | [@bs.as "default"] \`Default
        | [@bs.as "small"] \`Small
        | [@bs.as "large"] \`Large
        ];

        module Classes = {
        type classesType =
            | Root(string)
            | ColorPrimary(string)
            | ColorSecondary(string)
            | ColorAction(string)
            | ColorError(string)
            | ColorDisabled(string)
            | FontSizeInherit(string)
            | FontSizeSmall(string)
            | FontSizeLarge(string);
        type t = list(classesType);
        let to_string =
            fun
            | Root(_) => "root"
            | ColorPrimary(_) => "colorPrimary"
            | ColorSecondary(_) => "colorSecondary"
            | ColorAction(_) => "colorAction"
            | ColorError(_) => "colorError"
            | ColorDisabled(_) => "colorDisabled"
            | FontSizeInherit(_) => "fontSizeInherit"
            | FontSizeSmall(_) => "fontSizeSmall"
            | FontSizeLarge(_) => "fontSizeLarge";
        let to_obj = listOfClasses =>
            listOfClasses->(
                            Belt.List.reduce(
                            Js.Dict.empty(),
                            (obj, classType) => {
                                switch (classType) {
                                | Root(className)
                                | ColorPrimary(className)
                                | ColorSecondary(className)
                                | ColorAction(className)
                                | ColorError(className)
                                | ColorDisabled(className)
                                | FontSizeInherit(className)
                                | FontSizeSmall(className)
                                | FontSizeLarge(className) =>
                                Js.Dict.set(obj, to_string(classType), className)
                                };
                                obj;
                            },
                            )
                        );
        };

        [@bs.obj]
        external makeProps:
        (
            ~className: string=?,
            ~color: string=?,
            ~fontSize: string=?,
            ~nativeColor: string=?,
            ~shapeRendering: string=?,
            ~titleAccess: string=?,
            ~viewBox: string=?,
            ~classes: Js.Dict.t(string)=?,
            ~style: ReactDOMRe.Style.t=?,
            unit
        ) =>
        _ =
        "";
    
    ${icons.map(iconName => `
        module ${iconName} {
            [@bs.module]
            external reactClass: ReasonReact.reactClass = "@material-ui/icons/${iconName}";
            let make =
                (
                ~className: option(string)=?,
                ~color: option(color)=?,
                ~fontSize: option(fontSize)=?,
                ~nativeColor: option(string)=?,
                ~shapeRendering: option(string)=?,
                ~titleAccess: option(string)=?,
                ~viewBox: option(string)=?,
                ~classes: option(Classes.t)=?,
                ~style: option(ReactDOMRe.Style.t)=?,
                children,
                ) =>
            ReasonReact.wrapJsForReason(
                ~reactClass,
                ~props=
                makeProps(
                    ~className?,
                    ~color=?color->(Belt.Option.map(v => colorToJs(v))),
                    ~fontSize=?fontSize->(Belt.Option.map(v => fontSizeToJs(v))),
                    ~nativeColor?,
                    ~shapeRendering?,
                    ~titleAccess?,
                    ~viewBox?,
                    ~classes=?Belt.Option.map(classes, v => Classes.to_obj(v)),
                    ~style?,
                    (),
                ),
                children,
            );

        }
    `).join('\n')}`;
};

export default RenderIcons();