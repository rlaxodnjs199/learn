/**
 * 타입 좁히기
 * 조건문 등을 이용해 넓은 타입에서 좁은 타입으로
 * 상황에 따라 좁혀나가는 과정
 */

type Person = {
    name: string;
    age: number;
};

function func(value: number | string | Date | null | Person) {
    if (value instanceof Date) {
        value.getTime() // Date
    } else if (typeof value === "string") {
        value.toUpperCase() // string
    } else if (typeof value === "number") {
        value.toFixed() // number
    } else if (value && "name" in value) {
        // since Person is not a class, we can't use instanceof
        value.age // Person
    } else {
        value // null
    }
}