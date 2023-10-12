class Department {
    name: string;

    constructor(n: string){
        this.name = n;
    }
}

const Accounting = new Department("Accounting");

console.log(Accounting);