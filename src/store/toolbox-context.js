import { createContext } from "react";

const ToolboxContext = createContext({
    toolboxState: {},
    changeStroke: ()=>{},
    changeFill: ()=>{},
    changeSize: ()=>{},
    
});

export default ToolboxContext;