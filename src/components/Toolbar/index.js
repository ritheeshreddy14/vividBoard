import classes from "./index.module.css"
import { useContext } from 'react';
import classNames from 'classnames';
import { LuRectangleHorizontal } from "react-icons/lu";
import { FaSlash, FaRegCircle ,FaArrowRight,FaPaintBrush, FaEraser, FaFont, FaUndoAlt, FaRedoAlt, FaDownload} from "react-icons/fa";
import boardContext from "../../store/board-context";
import { TOOL_ITEMS } from "../../constants";

function Toolbar() {
  
  const handleDownloadClick = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'whiteboard.png';
      link.href = canvas.toDataURL("img/png");
      link.click();
    }
  };



  const {activeToolItem,changeToolHandler,undo,redo}=useContext(boardContext);
  return (
    <div className={classes.container}>
      <div className={
        classNames(classes.toolItem, { [classes.active]: activeToolItem === TOOL_ITEMS.BRUSH })
        } onClick={() => {changeToolHandler(TOOL_ITEMS.BRUSH) }}>
      <FaPaintBrush/>
      </div>
      <div className={
        classNames(classes.toolItem, { [classes.active]: activeToolItem === TOOL_ITEMS.LINE })
        } onClick={() => {changeToolHandler(TOOL_ITEMS.LINE) }}>
      <FaSlash/>
      </div>
      <div className={
        classNames(classes.toolItem, { [classes.active]: activeToolItem === TOOL_ITEMS.RECTANGLE })
        }
        onClick={() => { changeToolHandler(TOOL_ITEMS.RECTANGLE) }}>
      <LuRectangleHorizontal  />
      </div>
      <div className={
        classNames(classes.toolItem, { [classes.active]: activeToolItem === TOOL_ITEMS.CIRCLE })
        }
        onClick={() => { changeToolHandler(TOOL_ITEMS.CIRCLE) }}>
      <FaRegCircle/>
      </div>
      <div className={
        classNames(classes.toolItem, { [classes.active]: activeToolItem === TOOL_ITEMS.ARROW })
        }
        onClick={() => { changeToolHandler(TOOL_ITEMS.ARROW) }}>
      <FaArrowRight/>
      </div>
      <div className={
        classNames(classes.toolItem, { [classes.active]: activeToolItem === TOOL_ITEMS.TEXT })
        }
        onClick={() => { changeToolHandler(TOOL_ITEMS.TEXT) }}>
      <FaFont/>
      </div>
      <div className={
        classNames(classes.toolItem, { [classes.active]: activeToolItem === TOOL_ITEMS.ERASER })
        }
        onClick={() => { changeToolHandler(TOOL_ITEMS.ERASER) }}>
      <FaEraser/>
      </div>
      <div className={classes.toolItem}
        onClick={undo}>
      <FaUndoAlt/>
      </div>
      <div className={classes.toolItem}
      onClick={redo}>
      <FaRedoAlt/>
      </div>
      <div className={classes.toolItem}
       onClick={handleDownloadClick}
       >
      <FaDownload/>
      </div>

    </div>
  );
}

export default Toolbar;