# TestAtipera

### [Go to website](https://dev.dt2o639hyvnpo.amplifyapp.com/)

## Task Description

**Prepare a view displaying a table of elements** (columns: Number, Name, Weight, Symbol). Simulate fetching data for the table on application startup. Add the ability to edit any value of a record displayed in the table (popup + input to change the value). After confirming the change, the table row should update. Editing should be done without mutating the data.

**Add a filter** that allows filtering results (one input filtering across all fields). Filtering should occur 2 seconds after the input value stops changing.

**Use the following initial data**:

```typescript
const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: "Hydrogen", weight: 1.0079, symbol: "H" },
  { position: 2, name: "Helium", weight: 4.0026, symbol: "He" },
  { position: 3, name: "Lithium", weight: 6.941, symbol: "Li" },
  { position: 4, name: "Beryllium", weight: 9.0122, symbol: "Be" },
  { position: 5, name: "Boron", weight: 10.811, symbol: "B" },
  { position: 6, name: "Carbon", weight: 12.0107, symbol: "C" },
  { position: 7, name: "Nitrogen", weight: 14.0067, symbol: "N" },
  { position: 8, name: "Oxygen", weight: 15.9994, symbol: "O" },
  { position: 9, name: "Fluorine", weight: 18.9984, symbol: "F" },
  { position: 10, name: "Neon", weight: 20.1797, symbol: "Ne" },
];
```

**Use the library** from [Angular Material](https://material.angular.io/) for components.

**The task should be written in Angular 18.2.2**.
