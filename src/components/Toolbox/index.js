// src/components/Toolbox/index.jsx
import React, { useContext } from "react";
import cx from "classnames";

import BoardContext from "../../store/board-context";
import ToolboxContext from "../../store/toolbox-context";

import {
  COLORS,
  COLOR_CONFIG_TYPES,
  FILL_TOOL_ITEMS,
  STROKE_TOOL_ITEMS,
  SIZE_TOOL_ITEMS,
  TOOL_ITEMS,
} from "../../constants";

import classes from "./index.module.css";

/* ───────────────── PickColor ───────────────── */
const PickColor = ({
  labelText,
  type,
  strokeColor,
  fillColor,
  activeToolItem,
  onColorClick,
}) => {
  const handleSwatchClick = (newColor) => onColorClick(activeToolItem, newColor);
  const handlePickerChange = (e) =>
    onColorClick(activeToolItem, e.target.value);

  return (
    <div className={classes.selectOptionContainer}>
      <label className={classes.toolBoxLabel}>{labelText}</label>
      <div className={classes.colorsContainer}>
        {/* “No-fill” box (for shapes) */}
        {type === COLOR_CONFIG_TYPES.FILL &&
          FILL_TOOL_ITEMS.includes(activeToolItem) && (
            <div
              className={cx(classes.colorBox, classes.noFillColorBox, {
                [classes.activeColorBox]: fillColor === null,
              })}
              onClick={() => handleSwatchClick(null)}
            />
          )}

        {/* Native <input type="color"> picker */}
        <input
          className={classes.colorPicker}
          type="color"
          value={type === COLOR_CONFIG_TYPES.STROKE ? strokeColor : fillColor}
          onChange={handlePickerChange}
        />

        {/* preset swatches */}
        {[
          COLORS.BLACK,
          COLORS.RED,
          COLORS.GREEN,
          COLORS.BLUE,
          COLORS.ORANGE,
          COLORS.YELLOW,
        ].map((c) => (
          <div
            key={c}
            className={cx(classes.colorBox, {
              [classes.activeColorBox]:
                type === COLOR_CONFIG_TYPES.STROKE
                  ? strokeColor === c
                  : fillColor === c,
            })}
            style={{ backgroundColor: c }}
            onClick={() => handleSwatchClick(c)}
          />
        ))}
      </div>
    </div>
  );
};

/* ───────────────── Toolbox ───────────────── */
const Toolbox = () => {
  const { activeToolItem } = useContext(BoardContext);
  const { toolboxState, changeStroke, changeFill, changeSize } =
    useContext(ToolboxContext);

  const { stroke, fill, size } = toolboxState[activeToolItem] || {};

  const onSizeChange = (e) => changeSize(activeToolItem, e.target.value);

  return (
    <div className={classes.container}>
      {/* stroke colour selector */}
      {STROKE_TOOL_ITEMS.includes(activeToolItem) && (
        <PickColor
          labelText="Stroke Color"
          type={COLOR_CONFIG_TYPES.STROKE}
          strokeColor={stroke}
          fillColor={fill}
          activeToolItem={activeToolItem}
          onColorClick={changeStroke}
        />
      )}

      {/* fill colour selector */}
      {FILL_TOOL_ITEMS.includes(activeToolItem) && (
        <PickColor
          labelText="Fill Color"
          type={COLOR_CONFIG_TYPES.FILL}
          strokeColor={stroke}
          fillColor={fill}
          activeToolItem={activeToolItem}
          onColorClick={changeFill}
        />
      )}

      {/* size / thickness slider */}
      {SIZE_TOOL_ITEMS.includes(activeToolItem) && (
        <div className={classes.selectOptionContainer}>
          <label className={classes.toolBoxLabel}>
            {activeToolItem === TOOL_ITEMS.TEXT ? "Font Size" : "Brush Size"}
          </label>
          <input
            type="range"
            min={activeToolItem === TOOL_ITEMS.TEXT ? 12 : 1}
            max={activeToolItem === TOOL_ITEMS.TEXT ? 64 : 10}
            step="1"
            value={size}
            onChange={onSizeChange}
          />
        </div>
      )}
    </div>
  );
};

export default Toolbox;
