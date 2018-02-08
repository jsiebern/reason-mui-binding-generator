/* type crs = {
     height: string,
     xfield: string
   };

   module STest: MaterialUi.WithStylesSC with type classRecordStrings = crs = {
     [@bs.deriving jsConverter]
     type classRecord = {
       height: ReactDOMRe.Style.t,
       xfield: ReactDOMRe.Style.t
     };
     type classRecordJs = {
       .
       "height": ReactDOMRe.Style.t,
       "xfield": ReactDOMRe.Style.t
     };
     let classes = {
       height:
         ReactDOMRe.Style.make(
           ~width="100%",
           ~height="100%",
           ~backgroundColor="transparent",
           ~color="#FFFFFF",
           ~border="0",
           ~fontFamily="courier new",
           ()
         ),
       xfield:
         ReactDOMRe.Style.make(
           ~height="200px",
           ~backgroundColor="rgb(13, 43, 53)",
           ~padding="0px",
           ~fontFamily="courier new",
           ()
         )
     };
     type classRecordStrings = crs;
     type classRecordStringsJs = {
       .
       "height": string,
       "xfield": string
     };
     let classRecordStringsFromJs = cr : classRecordStrings => {
       height: cr##height,
       xfield: cr##xfield
     };
   };

   module ModuleName = MaterialUi.WithStylesSafe(STest); */
[@bs.deriving jsConverter]
type classRecord = {
  height: ReactDOMRe.Style.t,
  xfield: ReactDOMRe.Style.t
};