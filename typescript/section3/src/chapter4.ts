// 합집합 - Union Type
let a: string | number | boolean;
a = 1;
a = "hello";
a = true;

let arr: (number | string | boolean)[] = [1, "hello", true];

type Dog = {
    name: string;
    color: string;
}

type Person = {
    name: string;
    language: string;
}

type Union1 = Dog | Person;

let union1: Union1 = {
    name: 'Fido',
    color: 'brown'
}

let union2: Union1 = {
    name: 'Jane',
    language: 'Korean'
} 

// Ok - union3 belongs to union of Dog & Person
let union3: Union1 = {
    name: 'Mary',
    color: 'black',
    language: 'Korean'
}

// Error - union4 doesn't belong to Dog or Person
// let union4: Union1 = {
//     name: 'John',
// }

// 교집합 - Intersection Type
let v1: number & string & boolean;
// same as 'never' type

type Intersection1 = Dog & Person;
// Dog & Person = {dog properties} & {person properties}
let intersection1: Intersection1 = {
    name: 'Fido',
    color: 'brown',
    language: 'Korean'
}
