type Admin = {
    name: string,
    privileges: string[]
}

type Employee = {
    name: string,
    startDate: Date
}

type elevatedEmployee = Admin & Employee;

const test: elevatedEmployee = {name: "Erik", privileges: ["admin"],startDate: new Date()}

type Combinable = number | string;
type test2 = number | boolean;

type Combined = Combinable & test2; 