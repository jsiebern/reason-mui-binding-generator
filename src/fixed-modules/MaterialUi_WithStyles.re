type classRecordDef('classRecord) =
  | Record('classRecord)
  | ThemeFunc(MaterialUi_Theme.t => 'classRecord);

module type WithStylesSafeTemplate = {
  type classRecord;
  type classRecordJs;
  type classRecordStrings;
  type classRecordStringsJs;
  let classRecordToJs: classRecord => classRecordJs;
  let classRecordStringsFromJs: classRecordStringsJs => classRecordStrings;
  let classes: classRecordDef(classRecord);
};

module WithStylesSafe = (S: WithStylesSafeTemplate) => {
  [@bs.module "@material-ui/styles"]
  external createStyled: S.classRecordJs => ReasonReact.reactClass = "";

  [@bs.module "@material-ui/styles"]
  external createStyledWithTheme:
    (MaterialUi_Theme.t => S.classRecordJs) => ReasonReact.reactClass =
    "createStyled";

  module Styled = {
    let styled =
      switch (S.classes) {
      | Record(record) => createStyled(record->S.classRecordToJs)
      | ThemeFunc(func) =>
        createStyledWithTheme(theme => func(theme)->S.classRecordToJs)
      };

    let make =
        (
          children:
            {. "classes": S.classRecordStringsJs} => ReasonReact.reactElement,
        ) =>
      ReasonReact.wrapJsForReason(
        ~reactClass=styled,
        ~props=Js.Obj.empty(),
        children,
      );
  };

  let component = ReasonReact.statelessComponent("WithStylesSafe");
  let make = children => {
    ...component,
    render: _ =>
      <Styled>
        ...{classes => children(classes##classes->S.classRecordStringsFromJs)}
      </Styled>,
  };
};
