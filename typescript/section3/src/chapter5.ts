// type reference
// 타입 추론을 잘하는 경우
// 객체 할당
let a = 10;
let b = "hello";
let c = {
    id: 1,
    name: "hello",
    profile: {
        nickname: "hello"
    },
    urls: ["http://hello.com", "http://world.com"]
};
// 객체 destructuring
let {id, name, profile} = c;
// 배열 할당
let [one, two, three] = [1, "hello", true];
// 함수 리턴값, 기본값이 있는 parameter
function func(message = "hello") {
    return "hello";
}

let d; // d: any
d = 10; // d: number
d.toFixed(2);

d = "hello"; // d: string
d.toUpperCase();

// 좁은 범위의 추론 (const)
const num = 10; // num: 10
const str = "hello"; // str: "hello"