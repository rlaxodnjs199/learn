// enum

enum Role {
    ADMIN = 0,
    USER = 1,
    GUEST = 2
}

enum Language {
    Korean = "ko",
    English = "en",
}

const user1 = {
    name: "kim",
    role: Role.ADMIN,
    language: Language.Korean
}

const user2 = {
    name: "lee",
    role: Role.USER,
    language: Language.English
}

console.log(user1, user2)
// { name: 'kim', role: 0, language: 'ko' } 
// { name: 'lee', role: 1, language: 'en' }
