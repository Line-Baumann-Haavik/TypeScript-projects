//Project State Management

type Listener<T> = (items: T[]) => void;
class State<T> {
  protected listeners: Listener<T>[] = [];

  addListeners(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn); 
  }
}


class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numofPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numofPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

//Project Type

enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

//Validation Logic
interface Validatable {
  value: string | number;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableObject: Validatable): boolean {
  let isValid = true;
  if (validatableObject.required) {
    isValid = isValid && validatableObject.value.toString().trim().length !== 0;
  }
  if (
    typeof validatableObject.value === "string" &&
    validatableObject.minLength != null
  ) {
    isValid =
      isValid && validatableObject.value.length >= validatableObject.minLength;
  }
  if (
    typeof validatableObject.value === "string" &&
    validatableObject.maxLength != null
  ) {
    isValid =
      isValid && validatableObject.value.length <= validatableObject.maxLength;
  }
  if (
    typeof validatableObject.value === "number" &&
    validatableObject.min != null
  ) {
    isValid = isValid && validatableObject.value >= validatableObject.min;
  }
  if (
    typeof validatableObject.value === "number" &&
    validatableObject.max != null
  ) {
    isValid = isValid && validatableObject.value <= validatableObject.max;
  }
  return isValid;
}

//descriptor
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

//Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateElementID: string,
    hostElementID: string,
    insertNewElement: InsertPosition,
    newElementID?: string
  ) {
    this.templateElement = document.getElementById(
      templateElementID
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementID)! as T;

    const importedContent = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedContent.firstElementChild! as U;
    if (newElementID) {
      this.element.id = newElementID;
    }

    this.attach(insertNewElement);
  }

  private attach(insertElement: InsertPosition) {
    this.hostElement.insertAdjacentElement(insertElement, this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

//classes

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
  private project: Project;

  get numOfPeople(){
    if(this.project.people === 1){
      return "1 person ";
    }else{
      return `${this.project.people} persons `;
    }
  }

  constructor(hostID: string, project: Project){
    super("single-project", hostID, "beforeend", project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  configure(): void {
    
  }

  renderContent(): void {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.numOfPeople + "assigned";
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", "beforeend", `${type}-projects`);
    this.assignedProjects = [];

    this.renderContent();
    this.configure();
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const projectItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, projectItem);
    }
  }

  renderContent() {
    const listID = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listID;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  configure() {
    projectState.addListeners((projects: Project[]) => {
      const relelvantProjects = projects.filter((project) => {
        if (this.type === "active") {
          return project.status === ProjectStatus.Active;
        } else {
          return project.status === ProjectStatus.Finished;
        }
      });
      this.assignedProjects = relelvantProjects;
      this.renderProjects();
    });
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", "afterbegin", "user-input");

    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
  }

  private gatherUserInput(): [string, string, number] | void {
    const titleInput = this.titleInputElement.value;
    const descriptionInput = this.descriptionInputElement.value;
    const peopleInput = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: titleInput,
      required: true,
      minLength: 1,
    };

    const descriptionValidatable: Validatable = {
      value: descriptionInput,
      required: true,
      minLength: 5,
      maxLength: 50,
    };

    const peopleValidatable: Validatable = {
      value: peopleInput,
      required: true,
      min: 1,
      max: 150,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again");
      return;
    } else {
      return [titleInput, descriptionInput, +peopleInput];
    }
  }

  private clearInputs(): void {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }

  renderContent(): void {}

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }
}

const project1 = new ProjectInput();
const activeProjects = new ProjectList("active");
const finishedProjects = new ProjectList("finished");
