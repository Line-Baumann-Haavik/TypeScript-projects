//Project State Management

class ProjectState {
    private listeners: any[] = [];
    private projects: any[] = [];
    private static instance: ProjectState;

    private constructor(){

    }

    static getInstance(){
        if(this.instance){
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addListeners(listenerFn: Function){
        this.listeners.push(listenerFn);
    }

    addProject(title: string, description: string, numofPeople: number){
        const newProject = {
            id: Math.random().toString(),
            title: title,
            description: description,
            people: numofPeople
        }
        this.projects.push(newProject);
        for(const listenerFn of this.listeners){
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();

//Project Type

enum ProjectStatus {Active, Finished};

class Project {
    constructor(public id: string, public title: string, public description: string, public people: number, public status: ProjectStatus){
        
    }
}

//Validation Logic
interface Validatable {
    value: string | number,
    required: boolean,
    minLength?: number,
    maxLength?: number,
    min?: number,
    max?: number
}

function validate(validatableObject: Validatable): boolean{
    let isValid = true;
    if(validatableObject.required){
        isValid = isValid && validatableObject.value.toString().trim().length !== 0;
    }
    if(typeof validatableObject.value === "string" && validatableObject.minLength != null){
        isValid = isValid && validatableObject.value.length >= validatableObject.minLength;
    }
    if(typeof validatableObject.value === "string" && validatableObject.maxLength != null){
        isValid = isValid && validatableObject.value.length <= validatableObject.maxLength;
    }
    if(typeof validatableObject.value === "number" && validatableObject.min != null){
        isValid = isValid && validatableObject.value >= validatableObject.min;
    }
    if(typeof validatableObject.value === "number" && validatableObject.max != null){
        isValid = isValid && validatableObject.value <= validatableObject.max;
    }
    return isValid;
}



//descriptor
function autobind(_: any, _2: string, descriptor: PropertyDescriptor){
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true, 
        get(){
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    } 
    return adjDescriptor;
}


//classes


class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: any[];

    constructor(private type: "active" | "finished"){
        this.templateElement = document.getElementById("project-list")! as HTMLTemplateElement;
        this.hostElement = document.getElementById("app")! as HTMLDivElement;
        this.assignedProjects = [];

        const importedContent = document.importNode(this.templateElement.content, true);
        this.element = importedContent.firstElementChild! as HTMLElement;
        this.element.id = `${this.type}-projects`;

        projectState.addListeners((projects: any[]) => {
            this.assignedProjects = projects;
            this.renderProjects();
        });

        this.attach();
        this.renderContent();
    }

    private attach(){
        this.hostElement.insertAdjacentElement("beforeend", this.element);
    }

    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        for(const projectItem of this.assignedProjects){
            const listItem = document.createElement("li");
            listItem.textContent = projectItem.title;
            listEl.appendChild(listItem);
        }
    }

    private renderContent(){
        const listID = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listID;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
    }

}

class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor(){
        this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
        this.hostElement = document.getElementById("app")! as HTMLDivElement;

        const importedContent = document.importNode(this.templateElement.content, true);
        this.element = importedContent.firstElementChild! as HTMLFormElement;
        this.element.id = "user-input";
        this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

        this.configure();
        this.attach();
    }

    private gatherUserInput():[string, string, number] | void{
        const titleInput = this.titleInputElement.value;
        const descriptionInput = this.descriptionInputElement.value;
        const peopleInput = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: titleInput,
            required: true,
            minLength: 1
        }

        const descriptionValidatable: Validatable = {
            value: descriptionInput,
            required: true,
            minLength: 5,
            maxLength: 50
        }

        const peopleValidatable: Validatable = {
            value: peopleInput,
            required: true,
            min: 1,
            max: 150
        }

        if( !validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)){
            alert("Invalid input, please try again");
            return;
        }else{
            return [titleInput, descriptionInput, +peopleInput];
        }
    }

    private attach(){
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }

    private clearInputs(): void {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }

    @autobind
    private submitHandler(event: Event){
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if(Array.isArray(userInput)){
            const [title, desc, people] = userInput;
            projectState.addProject(title,desc,people);
            this.clearInputs();
        }

    }

    private configure(){
        this.element.addEventListener("submit", this.submitHandler);
    }
}

const project1 = new ProjectInput();
const activeProjects = new ProjectList("active");
const finishedProjects = new ProjectList("finished");