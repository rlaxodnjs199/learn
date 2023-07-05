/**
 * 서로소 유니온 타입 (tagged union type)
 * 교집합이 없는 타입들로만 만든 유니온 타입
 * 서로소 유니온 타입을 사용하면 옵셔널 타입을 사용할 때보다 타입 좁히기를 통해 보다 안전한 타입을 정의할 수 있다.
 */

type Admin = {
    tag: "ADMIN";
    name: string;
    kickCount: number;
};

type Member = {
    tag: "MEMBER";
    name: string;
    point: number;
};

type Guest = {
    tag: "GUEST";
    name: string;
    visitCount: number;
};

type User = Admin | Member | Guest;

function login(user: User) {
    // Worse
    // if ("kickCount" in user) {
    //     user; // Admin
    // } else if ("point" in user) {
    //     user; // Member
    // } else {
    //     user; // Guest
    // }

    // Much better -> Add tag property to objects
    switch (user.tag) {
        case "ADMIN": {
            user; // Admin
        }
        case "MEMBER": {
            user; // Member
        }
        case "GUEST": {
            user; // Guest
        }
    }
}

type AsyncTask = {
    state: "PENDING" | "DONE" | "ERROR";
    response?: {
        data: string;
    },
    error?: {
        message: string;
    }
}

const pendingTask: AsyncTask = {
    state: "PENDING"
};

const doneTask: AsyncTask = {
    state: "DONE",
    response: {
        data: "done"
    }
};

const errorTask: AsyncTask = {
    state: "ERROR",
    error: {
        message: "error"
    }
};

function processResult(task: AsyncTask) {
    switch (task.state) {
        case "PENDING": {
            console.log("pending");
            break;
        }
        case "DONE": {
            console.log(task.response?.data); // this is not safe
            break;
        }
        case "ERROR": {
            console.log(task.error?.message); // this is not safe
            break;
        }
    }
}


// Better
type PendingTask = {
    state: "PENDING";
}

type DoneTask = {
    state: "DONE";
    response: {
        data: string;
    }
}

type ErrorTask = {
    state: "ERROR";
    error: {
        message: string;
    }
}

type SafeAsyncTask = PendingTask | DoneTask | ErrorTask;

function processSafeResult(task: SafeAsyncTask) {
    switch (task.state) {
        case "PENDING": {
            console.log("pending");
            break;
        }
        case "DONE": {
            console.log(task.response.data); // this is safe
            break;
        }
        case "ERROR": {
            console.log(task.error.message); // this is safe
            break;
        }
    }
}