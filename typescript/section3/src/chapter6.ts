// type assertion

type Person = {
    name: string;
    age: number;
}

// Initialize with type assertion
// 초기화 단계에서는 빈 array이지만 나중에 Person Type으로 캐스팅이 가능하다.
let person = {} as Person;
person.name = "twkim";
person.age = 30;

type Dog = {
    name: string;
    color: string;
};

// 원래는 다운캐스팅이라 불가능하지만 타입 단언을 통해 에러 없이 사용 가능하다.
let dog = {
    name: "doggy",
    color: "white",
    breed: "persian"
} as Dog;

/**
 * 타입 단언의 규칙
 * 값 as 타입
 * A as B
 * A는 B의 서브타입이거나, 슈퍼타입이어야 한다.
 */
let num1 = 10 as never; // never는 모든 타입의 서브타입이므로 가능
let num2 = 10 as unknown; // unknown은 any의 슈퍼타입이므로 가능
// let num3 = 10 as string; // number는 string의 서브타입이 아니므로 에러

// const assertion
// same as: const num4 = 10;
let num4 = 10 as const; // num4: 10
// make readonly object
let cat = {
    name: "cat",
    color: "white"
} as const; // cat: {readonly name: "cat", readonly color: "white"}

// Non-null assertion
type Post = {
    title: string;
    author?: string;
};

let post: Post = {
    title: "hello",
    author: "twkim",
};

const len: number = post.author!.length; // post.author가 undefined가 아님을 단언