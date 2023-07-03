// void
// void -> 아무것도 없음을 의미하는 타입

function func1(): void {
    console.log("hello");
}

// never
// 불가능한 타입

function func3(): never {
    while (true) {}
}

function func4(): never {
    throw new Error();
}