// unknown type
function unknownExam() {
    let a: unknown = 30;
    let b: unknown = "hello";
    let c: unknown = true;
    let d: unknown = null;
    let e: unknown = undefined;

    let unknownVar: unknown
    // let num: number = unknownVar; // Error - DownCasting    
}

// never type
function neverExam() {
    function neverFunc(): never {
        while (true) {
            console.log("never function");
        }
    }

    let num: number = neverFunc(); // Upcasting -> OK
}

// void type
function voidExam() {
    function voidFunc(): void {
        console.log("void function");
    }
}

// any type
