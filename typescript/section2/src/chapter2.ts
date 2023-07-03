// array
let numArr: Array<number> = [1,2,3];
let numArr2: number[] = [1,2,3];
let strArr: Array<string> = ["hello", "world"];
let strArr2: string[] = ["hello", "world"];
let boolArr: Array<boolean> = [true, false];
let boolArr2: boolean[] = [true, false];

// array with multiple types
let multiArr = Array<number | string>(1, "hello");

// nested array
let doubleArr: number[][] = [[1,2,3], [4,5,6]];

// tuple: Fixed length array
let tup1: [number, number] = [1,2];
let tup2: [number, string] = [1, "hello"];
let tup3: [number, string, boolean] = [1, "hello", true];

// tuple array
// Good for forcing data type within array
const users: [string, number][] = [
    ["kim", 123],
    ["park", 456],
    ["lee", 789], 
]