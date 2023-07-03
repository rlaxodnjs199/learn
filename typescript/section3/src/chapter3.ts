type Animal = {
    name: string;
    color: string;
}

type Dog = {
    name: string;
    color: string;
    breed: string;
}

let animal1: Animal = {
    name: 'Fido',
    color: 'brown'
}

let dog1: Dog = {
    name: 'Fido',
    color: 'brown',
    breed: 'mixed'
}

animal1 = dog1; // OK
// dog1 = animal1; // Error

// supertype
type Book = {
    name: string;
    price: number;
}

// subtype
type ProgrammingBook = {
    name: string;
    price: number;
    skill: string;
}

let book1: Book
let programmingBook1: ProgrammingBook = {
    name: 'Learning TypeScript',
    price: 99,
    skill: 'TypeScript'
}

book1 = programmingBook1; // OK
// programmingBook1 = book1; // Error


// 초과 프로퍼티 검사: 객체를 직접 할당하는 경우 발동
// 피하는 방법: 초과 프로퍼티를 가진 객체를 다른 변수에 할당한 후에 사용
// let book2: Book = {
//     name: 'Learning JavaScript',
//     price: 99,
//     skill: 'JavaScript'
// };
let book2: Book = programmingBook1; // OK