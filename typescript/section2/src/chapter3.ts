import { userInfo } from "os"

// object
let user: {
    id: number,
    name: string
} = {
    id: 1,
    name: "kim"
}

let dog: {
    name: string,
    color: string
} = {
    name: "doggy",
    color: "brown",
}

// object with optional property
let userFlexible: {
    id?: number,
    name: string
} = {
    name: "kim"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
}

// prevent reassigning
let config: {
    readonly apiKey: string
} = {
    apiKey: "123123123"
}