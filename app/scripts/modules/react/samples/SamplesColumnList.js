
var WIDTH = 10;

/* Keep key == dataKey */
var columnDef = {
    family: {
        key: "family_id",
        order: 0,
        label: "Family",
        width: WIDTH,
        flexGrow: 1,
        dataKey: "family_id",
    },
    sample: {
        key: "name",
        order: 1,
        label: "Sample",
        width: WIDTH,
        flexGrow: 1,
        dataKey: "name",
    },
    phenotype: {
        key: "phenotype",
        order: 1,
        label: "Affected",
        width: WIDTH,
        flexGrow: 1,
        dataKey: "phenotype",
        align: "center",
    },
    sex: {
        key: "sex",
        order: 3,
        label: "Sex",
        width: WIDTH,
        flexGrow: 1,
        dataKey: "sex",
        align: "center",
    },
    mother: {
        key: "mother_id",
        order: 4,
        label: "Mother",
        width: WIDTH,
        flexGrow: 1,
        dataKey: "mother_id",
        align: "center",
    },
    father: {
        key: "father_id",
        order: 5,
        label: "Father",
        width: WIDTH,
        flexGrow: 1,
        dataKey: "father_id",
        align: "center",
    },
};

module.exports = {
    columnDef: columnDef,
};
