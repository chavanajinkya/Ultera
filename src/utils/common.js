export const SORT_DIRECTION={
    ASC:'Asc',
    DES:'Des'
}

export const INPUT_TYPE={
    TEXT: 'text', //default
    NUMBER: 'number',
    PHONE: 'phone',
    PASSWORD:'password'
}

export const VALIDATION_PROPERTY={
    EDITABLE: 0,
    HIDDEN: 1,
    READONLY: 2,
    REQUIRED: 3,
    REQUIRED_ONE: 4
};

export const DATE_FORMAT= "MM/DD/YYYY";
export const DATE_FORMAT_FR="DD/MM/YYYY";
export const DATE_TIME_FORMAT= "MM/DD/YYYY hh:mm:ss A";
export const DATE_TIME_FORMAT_WITHOUT_SEC = "MM/DD/YYYY hh:mm A";
export const DATE_TIME_FORMAT_WITHOUT_SEC_FR = "DD/MM/YYYY HH:mm";

export const OPERATOR_SEQUENCE=[
    {seqId:0, id: "=" },
    {seqId:1, id:'<>'},
    {seqId:2, id:'STARTS WITH'},
    {seqId:3, id:'CONTAINS'},
    {seqId:4, id:'ENDS WITH'},
    {seqId:5, id:'IS NOT IN'},
    {seqId:6, id:'IN'},
    {seqId:7, id:'IS EMPTY'},
    {seqId:8, id:'IS NOT EMPTY'},
    {seqId:9, id:'BETWEEN'},
    {seqId:10, id:'>'},
    {seqId:11, id:'>='},
    {seqId:12, id:'<'},
    {seqId:13, id:'<='},
    {seqId:14, id:'ON'},
];