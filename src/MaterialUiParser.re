type component = {
    cName: string,
};

let parse = (path) => {
    let componentList = [];

    let files = Sys.readdir(path);
    /* for (x in 0 to Array.length(files) - 1) { */
    for (x in 0 to 0) {
        let fileName = files[x];
        let filePath = path ++ "/" ++ fileName;
        if (Str.last_chars(filePath, 5) == ".json") {

            open Yojson.Basic.Util;
            let json = Yojson.Basic.from_file(filePath);

            let componentInfo = {
                cName: json |> member("name") |> to_string
            };

            let componentList = [componentInfo, ...componentList];
            /* print_endline(); */

        };
    };

    componentList
};
