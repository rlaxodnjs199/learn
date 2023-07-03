// any
// 특정 변수와 타입을 우리가 확실하게 모를 때 사용한다.
// 타입 검사는 다 통과하는 치트키 같은 타입이지만으
// 런타임에서 에러를 일으키므로 사용을 지양하자.

let notSure: any = 4;
notSure = "maybe a string instead";


// unknown
let unknownVar: unknown;
let num: number = 30;

unknownVar = 10;
// error: unkownVar is not a number
// num = unknownVar;

// good: this ensures that unknownVar is a number
if (typeof unknownVar === "number") {
    num = unknownVar;
}
