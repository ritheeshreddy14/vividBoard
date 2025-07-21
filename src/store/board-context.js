import { createContext } from "react";
import { TOOL_ACTION_TYPES } from "../constants";

const boardContext=createContext({
    activeToolItem:"",
    elements:[],
    toolActionType:"",
    boardMouseDownHandler:()=>{},
    changeToolHandler: ()=>{},
    boardMouseMoveHandler: ()=>{},
    boardMouseUpHandler:()=>{},
    history: [[]],
    index: 0,
    undo: () => {},
    redo: () => {},
});

export default boardContext;