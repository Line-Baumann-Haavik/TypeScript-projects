function add(n1: number, n2: number, check: boolean, phrase: string){
    
    if(check){
        console.log(phrase + (n1+n2));
    }else{
        return n1 + n2;
    }

}

const number1 = 5;
const number2 = 33.3;

const result = add(number1, number2, true, "The result is: ");
