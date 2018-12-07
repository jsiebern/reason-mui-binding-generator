export default {
    Input: {
        inputComponent: {
            type: {
                name: 'any',
            },
            required: false,
            description: '-',
        },
    },
    MenuItem: {
        value: {
            type: {
                name: 'union',
                value: [
                    {
                        name: 'string'
                    },
                    {
                        name: 'number'
                    },
                    {
                        name: 'arrayOf',
                        value: {
                            name: 'string',
                        },
                    },
                ],
            },
            required: false,
            description: '-',
        },
        onFocus: {
            type: {
                name: 'func',
            },
            required: false,
            description: '-',
        },
        onClick: {
            type: {
                name: 'func',
            },
            required: false,
            description: '-',
        },
    },
    ListItem: {
        value: {
            type: {
                name: 'union',
                value: [
                    {
                        name: 'string'
                    },
                    {
                        name: 'number'
                    },
                    {
                        name: 'arrayOf',
                        value: {
                            name: 'string',
                        },
                    },
                ],
            },
            required: false,
            description: '-',
        },
        onFocus: {
            type: {
                name: 'func',
            },
            required: false,
            description: '-',
        },
        onClick: {
            type: {
                name: 'func',
            },
            required: false,
            description: '-',
        },
    },
    Menu: {
        anchorEl: {
            type: {
                name: 'any'
            },
            required: false,
            description: '-',
        },
    },
    TablePagination: {
        labelRowsPerPage: {
            type: {
                name: 'custom',
                reasonType: '({. "from": int, "to": int, "count": int, "page": int}) => ReasonReact.reactElement',
                jsType: '\'labelRowsPerPage',
            },
            required: false,
            description: '-',
        },
        labelDisplayedRows: {
            type: {
                name: 'custom',
                reasonType: '({. "from": int, "to": int, "count": int}) => string',
                jsType: '\'labelDisplayedRows',
            },
            required: false,
            description: '-',
        },
        rowsPerPageOptions: {
            type: {
                name: 'arrayOf',
                value: {
                    name: 'int',
                }
            },
            required: false,
            description: '-',
        },
    },
    TableCell: {
        colSpan: {
            type: {
                name: 'int',
            },
            required: false,
            description: '-',
        },
    },
    TableRow: {
        onDoubleClick: {
            type: {
                name: 'func',
            },
            required: false,
            description: '-',
        },
    },
    Grid: {
        xsAuto: {
            type: {
                name: 'bool',
            },
            required: false,
            description: '-',
            reasonOnly: true,
        },
        smAuto: {
            type: {
                name: 'bool',
            },
            required: false,
            description: '-',
            reasonOnly: true,
        },
        mdAuto: {
            type: {
                name: 'bool',
            },
            required: false,
            description: '-',
            reasonOnly: true,
        },
        lgAuto: {
            type: {
                name: 'bool',
            },
            required: false,
            description: '-',
            reasonOnly: true,
        },
        xlAuto: {
            type: {
                name: 'bool',
            },
            required: false,
            description: '-',
            reasonOnly: true,
        },
    },
    MuiThemeProvider: {
        theme: {
            type: {
                name: 'custom',
                reasonType: 'MaterialUi_Theme.t(_)',
                jsType: 'MaterialUi_Theme.t(_)',
            },
            required: true,
            description: '-',
        },
    },
};