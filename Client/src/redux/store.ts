import { createStore } from "redux";
import { reduce } from "./reducer";
import { AppState } from "./app-state";

export const storeVacation = createStore<any, any, any, any>(reduce, new AppState());
export const storeUser = createStore<any, any, any, any>(reduce, new AppState());