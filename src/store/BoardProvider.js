import boardContext from './board-context';
import { useReducer,useCallback } from 'react';
import {
  TOOL_ACTION_TYPES,
  TOOL_ITEMS,
  BOARD_ACTIONS,
} from '../constants.js';
import {
  createRoughElement,
  getSvgPathFromStroke,
  isPointNearElement,
} from '../utils/element.js';
import getStroke from 'perfect-freehand';

/* ──────────────── reducer ──────────────── */

const boardReducer = (state, action) => {
  switch (action.type) {
    case BOARD_ACTIONS.CHANGE_TOOL:
      return { ...state, activeToolItem: action.payload.tool };

    case BOARD_ACTIONS.CHANGE_ACTION_TYPE:
      return { ...state, toolActionType: action.payload.actionType };

    case BOARD_ACTIONS.DRAW_DOWN: {
      const { clientX, clientY, stroke, fill, size } = action.payload;
      const newEl = createRoughElement(
        state.elements.length,
        clientX,
        clientY,
        clientX,
        clientY,
        { type: state.activeToolItem, stroke, fill, size },
      );
      return {
        ...state,
        elements: [...state.elements, newEl],
        selectedElement:
          state.activeToolItem === TOOL_ITEMS.TEXT ? newEl : null,
        toolActionType:
          state.activeToolItem === TOOL_ITEMS.TEXT
            ? TOOL_ACTION_TYPES.WRITING
            : TOOL_ACTION_TYPES.DRAWING,
      };
    }

    case BOARD_ACTIONS.DRAW_MOVE: {
      const { clientX, clientY } = action.payload;
      const idx = state.elements.length - 1;
      const draft = [...state.elements];
      const { type } = draft[idx];

      if (
        type === TOOL_ITEMS.LINE ||
        type === TOOL_ITEMS.RECTANGLE ||
        type === TOOL_ITEMS.CIRCLE ||
        type === TOOL_ITEMS.ARROW
      ) {
        const { x1, y1, stroke, fill, size } = draft[idx];
        draft[idx] = createRoughElement(
          idx,
          x1,
          y1,
          clientX,
          clientY,
          { type, stroke, fill, size },
        );
        return { ...state, elements: draft };
      }

      if (type === TOOL_ITEMS.BRUSH) {
        draft[idx].points.push({ x: clientX, y: clientY });
        draft[idx].path = new Path2D(
          getSvgPathFromStroke(getStroke(draft[idx].points)),
        );
        return { ...state, elements: draft };
      }

      return state;
    }

    /* ─── finished drawing → push to history ─── */
    case BOARD_ACTIONS.DRAW_UP: {
      const snapshot = [...state.elements];
      const history = state.history.slice(0, state.index + 1).concat([snapshot]);
      return {
        ...state,
        history,
        index: history.length - 1,
        toolActionType: TOOL_ACTION_TYPES.NONE,
      };
    }

    /* ─── eraser (log only when something deleted) ─── */
    case BOARD_ACTIONS.ERASE: {
      const { clientX, clientY } = action.payload;
      const filtered = state.elements.filter(
        (el) => !isPointNearElement(el, { clientX, clientY }),
      );
      if (filtered.length === state.elements.length) return state; // nothing erased

      const history = state.history.slice(0, state.index + 1).concat([filtered]);
      return {
        ...state,
        elements: filtered,
        history,
        index: history.length - 1,
      };
    }

    /* ─── commit text & push to history ─── */
    case BOARD_ACTIONS.CHANGE_TEXT: {
      const { text, stroke, size } = action.payload;
      const idx = state.selectedElement?.id;
      if (idx == null) return state;

      const { x1, y1, id, type, fill } = state.elements[idx];
      const updated = createRoughElement(id, x1, y1, null, null, {
        type,
        text,
        stroke,
        fill,
        size,
      });

      const elementsCopy = [...state.elements];
      elementsCopy[idx] = updated;

      const history = state.history.slice(0, state.index + 1).concat([elementsCopy]);

      return {
        ...state,
        elements: elementsCopy,
        history,
        index: history.length - 1,
        selectedElement: null,
        toolActionType: TOOL_ACTION_TYPES.NONE,
      };
    }

    /* ─── undo ─── */
    case BOARD_ACTIONS.UNDO: {
      if (state.index === 0) return state;
      return {
        ...state,
        elements: state.history[state.index - 1] || [],
        index: state.index - 1,
        toolActionType: TOOL_ACTION_TYPES.NONE,
      };
    }

    /* ─── redo ─── */
    case BOARD_ACTIONS.REDO: {
      if (state.index >= state.history.length - 1) return state;
      return {
        ...state,
        elements: state.history[state.index + 1] || [],
        index: state.index + 1,
        toolActionType: TOOL_ACTION_TYPES.NONE,
      };
    }

    default:
      return state;
  }
};

/* ─────────────── initial state ─────────────── */

const initialBoardState = {
  activeToolItem: TOOL_ITEMS.LINE,
  elements: [],
  toolActionType: TOOL_ACTION_TYPES.NONE,
  selectedElement: null,
  history: [[]], // first empty snapshot
  index: 0,
};

/* ─────────────── provider ─────────────── */

function BoardProvider({ children }) {
  const [boardState, dispatch] = useReducer(boardReducer, initialBoardState);

  /* helpers */
  const changeToolHandler = (tool) =>
    dispatch({ type: BOARD_ACTIONS.CHANGE_TOOL, payload: { tool } });

  const boardMouseDownHandler = (e, toolbox) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;

    const { clientX, clientY } = e;

    if (boardState.activeToolItem === TOOL_ITEMS.ERASER) {
      dispatch({
        type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
        payload: { actionType: TOOL_ACTION_TYPES.ERASING },
      });
      return;
    }

    dispatch({
      type: BOARD_ACTIONS.DRAW_DOWN,
      payload: {
        clientX,
        clientY,
        stroke: toolbox[boardState.activeToolItem]?.stroke,
        fill: toolbox[boardState.activeToolItem]?.fill,
        size: toolbox[boardState.activeToolItem]?.size,
      },
    });
  };

  const boardMouseMoveHandler = (e) => {
    const { clientX, clientY } = e;

    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
      dispatch({ type: BOARD_ACTIONS.DRAW_MOVE, payload: { clientX, clientY } });
    } else if (boardState.toolActionType === TOOL_ACTION_TYPES.ERASING) {
      dispatch({ type: BOARD_ACTIONS.ERASE, payload: { clientX, clientY } });
    }
  };

  const boardMouseUpHandler = () => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;

    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
      dispatch({ type: BOARD_ACTIONS.DRAW_UP });
    }

    dispatch({
      type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
      payload: { actionType: TOOL_ACTION_TYPES.NONE },
    });
  };

  const textAreaBlurHandler = (e, toolbox) => {
    dispatch({
      type: BOARD_ACTIONS.CHANGE_TEXT,
      payload: {
        text: e.target.value,
        stroke: toolbox[TOOL_ITEMS.TEXT]?.stroke,
        size: toolbox[TOOL_ITEMS.TEXT]?.size,
      },
    });
  };

  const undo = useCallback(() => dispatch({ type: BOARD_ACTIONS.UNDO }), []);
  const redo = useCallback(() => dispatch({ type: BOARD_ACTIONS.REDO }), []);

  /* context */
  const ctx = {
    activeToolItem: boardState.activeToolItem,
    elements: boardState.elements,
    toolActionType: boardState.toolActionType,
    changeToolHandler,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    textAreaBlurHandler,
    undo,
    redo,
  };

  return (
    <boardContext.Provider value={ctx}>{children}</boardContext.Provider>
  );
}

export default BoardProvider;
