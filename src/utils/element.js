import { ARROW_LENGTH, TOOL_ITEMS } from "../constants";
import rough from "roughjs/bin/rough";
import { getArrowHeadCoordinates, isPointCloseToLine } from "../utils/math.js";
import { getStroke } from "perfect-freehand";

const gen = rough.generator();

export const createRoughElement = (id, x1, y1, x2, y2, { type, text, stroke, fill, size }) => {
    const element = {
        id,
        x1,
        y1,
        x2,
        y2,
        type,
        fill,
        text,
        stroke,
        size,
    };

    let options = {
        seed: id + 1,
        fillStyle: "solid",
        strokeWidth: size,
    };

    if (stroke) {
        options.stroke = stroke;
    }
    if (fill) {
        options.fill = fill;
    }

    switch (type) {
        case TOOL_ITEMS.BRUSH: {
            const brush_element = {
                id,
                points: [{ x: x1, y: y1 }],
                path: new Path2D(getSvgPathFromStroke(getStroke([{ x: x1, y: y1 }]))),
                type,
                stroke,
            };
            return brush_element;
        }

        case TOOL_ITEMS.LINE:
            element.roughEle = gen.line(x1, y1, x2, y2, options);
            return element;

        case TOOL_ITEMS.RECTANGLE:
            element.roughEle = gen.rectangle(x1, y1, x2 - x1, y2 - y1, options);
            return element;

        case TOOL_ITEMS.CIRCLE:
            element.roughEle = gen.ellipse((x1 + x2) / 2, (y1 + y2) / 2, x2 - x1, y2 - y1, options);
            return element;

        case TOOL_ITEMS.ARROW: {
            const { x3, y3, x4, y4 } = getArrowHeadCoordinates(x1, y1, x2, y2, ARROW_LENGTH);
            const points = [
                [x1, y1],
                [x2, y2],
                [x3, y3],
                [x2, y2],
                [x4, y4],
            ];
            element.roughEle = gen.linearPath(points, options);
            return element;
        }

        case TOOL_ITEMS.TEXT: {
            if (!text) text = "";
            return {
                id,
                type,
                x1,
                y1,
                x2,
                y2,
                textEle: {
                    text,
                    stroke,
                    size,
                },
            };
        }

        default:
            throw new Error("Unknown tool type");
    }
};

export const isPointNearElement = (element, point) => {
    const pointX = point.x || point.clientX;
    const pointY = point.y || point.clientY;
    const { x1, y1, x2, y2, type } = element;

    switch (type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.ARROW:
            return isPointCloseToLine(x1, y1, x2, y2, pointX, pointY);

        case TOOL_ITEMS.RECTANGLE: {
            return (
                isPointCloseToLine(x1, y1, x2, y1, pointX, pointY) ||
                isPointCloseToLine(x2, y1, x2, y2, pointX, pointY) ||
                isPointCloseToLine(x2, y2, x1, y2, pointX, pointY) ||
                isPointCloseToLine(x1, y2, x1, y1, pointX, pointY)
            );
        }

        case TOOL_ITEMS.CIRCLE: {

            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;
            const width = Math.abs(x2 - x1);
            const height = Math.abs(y2 - y1);
            const rectx1 = centerX - width / 2;
            const recty1 = centerY - height / 2;
            const rectx2 = centerX + width / 2;
            const recty2 = centerY - height / 2;
            const rectx3 = centerX + width / 2;
            const recty3 = centerY + height / 2;
            const rectx4 = centerX - width / 2;
            const recty4 = centerY + height / 2;

            return (
                isPointCloseToLine(rectx1, recty1, rectx2, recty2, pointX, pointY) ||
                isPointCloseToLine(rectx2, recty2, rectx3, recty3, pointX, pointY) ||
                isPointCloseToLine(rectx3, recty3, rectx4, recty4, pointX, pointY) ||
                isPointCloseToLine(rectx4, recty4, rectx1, recty1, pointX, pointY)
            );
        }

        case TOOL_ITEMS.BRUSH: {
            const context = document.getElementById("canvas").getContext("2d");
            return context.isPointInPath(element.path, pointX, pointY);
        }
        case TOOL_ITEMS.TEXT: {
            const context = document.getElementById("canvas").getContext("2d");
            const textWidth = context.measureText(element.textEle.text).width;
            const textHeight = element.textEle.size; 
            return (
                pointX >= element.x1 &&
                pointX <= element.x1 + textWidth &&
                pointY >= element.y1 &&
                pointY <= element.y1 + textHeight
            );
        }

        default:
            throw new Error(`Type not recognized ${type}`);
    }
};

export const getSvgPathFromStroke = (stroke) => {
    if (!stroke.length) return "";
    
    const d = stroke.reduce((acc, point, i, arr) => {
        const [x0, y0] = point;
        const [x1, y1] = arr[(i + 1) % arr.length];
        acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        return acc;
    }, ["M", ...stroke[0], "Q"]);

    d.push("Z");
    return d.join(" ");
};