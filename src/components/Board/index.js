import { useContext, useEffect, useRef,useLayoutEffect } from 'react';

import rough from 'roughjs/bundled/rough.esm.js';
import boardContext from '../../store/board-context';
import {TOOL_ACTION_TYPES,TOOL_ITEMS} from "../../constants.js"
import ToolboxContext from '../../store/toolbox-context';
import classes from '../Board/index.module.css'

function Board() {
const {
  elements,boardMouseDownHandler,boardMouseMoveHandler,toolActionType,boardMouseUpHandler,textAreaBlurHandler
,undo,redo}=useContext(boardContext);

const {toolboxState}= useContext(ToolboxContext);
const canvasRef=useRef();
const textAreaRef=useRef();
useEffect(()=>{
  const canvas=canvasRef.current;
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
 

},[])

  useLayoutEffect(()=>{
  const canvas=canvasRef.current;
  const roughCanvas = rough.canvas(canvas);
  const context=canvas.getContext("2d");
  context.save();
  elements.forEach(element=>{
    switch(element.type){
      case TOOL_ITEMS.LINE:
      case TOOL_ITEMS.RECTANGLE:
      case TOOL_ITEMS.CIRCLE:
      case TOOL_ITEMS.ARROW:
        roughCanvas.draw(element.roughEle);
        break;
      case TOOL_ITEMS.BRUSH:{
        context.fillStyle=element.stroke;
        context.fill(element.path);
        context.restore();
        break; 

      }
      case TOOL_ITEMS.TEXT:
        {
              context.textBaseline = "top";
              context.font = `${element.textEle.size}px Caveat`;
              context.fillStyle = element.textEle.stroke;
              context.fillText(element.textEle.text, element.x1, element.y1);
              context.restore();
      break;
        }
      default:
        throw new Error(`Unknown element type: ${element.type}`);

      }
  });
  return ()=>{
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
  },[elements]);


  useEffect(() => {
    function handleKeyDown(event){
      if(event.ctrlKey && event.key === 'z'){
        undo();
      }
      else if(event.ctrlKey && event.key === 'y'){
         redo();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  },[undo,redo]);

  useEffect(()=>{
    const textArea= textAreaRef.current;
    if(toolActionType===TOOL_ACTION_TYPES.WRITING && textArea){
     setTimeout(()=>{
      textArea.focus();
     },100); 
    }

  },[toolActionType,elements[elements.length - 1]]);


   
   const handleMouseDown= (event)=>{
    boardMouseDownHandler(event,toolboxState);
   }

   const handleMouseMove= (event)=>{
    
    boardMouseMoveHandler(event);
   };

   const handleMouseUp=()=>{
      boardMouseUpHandler();
   }

  return (
    <>
   {toolActionType===TOOL_ACTION_TYPES.WRITING && elements.length > 0 && 
    <textarea type="text"
     className={classes.textElementBox}
     ref={textAreaRef}
     style={{
       top: `${elements[elements.length-1]?.y1}px`,
       left: `${elements[elements.length-1]?.x1}px`,
       fontSize: `${elements[elements.length-1].size}px`,
       color: elements[elements.length-1]?.stroke,
      }}
       onBlur={(event)=>textAreaBlurHandler(event,toolboxState)}
      /> 
      
     }  
    <canvas id="canvas" ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}/>
    </>
   
  );
}
export default Board;