type User = {
    id: number;
    name: string;
    nickname: string;
    birth: string;
    bio: string;
    location: string;
}

let user: User = {
    id: 1,
    name: "kim",
    nickname: "kimm",
    birth: "1990-01-01",
    bio: "hello",
    location: "seoul"
}

// index signature
// 0 or more entries with string key and string value
type CountryCodes = {
    [key: string]: string;
}

let countryCodes: CountryCodes = {
    Korea: "ko",
    UnitedStates: "en",
    UnitedKingdom: "en",
}

// let notGoodExample: CountryCodes = {
//     Korea: 410,
// }
