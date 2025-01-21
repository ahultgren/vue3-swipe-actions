import { type Ref } from "vue";
import { translateX } from "../utils/translateX";
import type { Slots } from "vue";
import type { SwipeState } from "./useSwipeState";

export function useSwipeAnimation(state: SwipeState, slots: Slots) {
  const shiftLeftActions = (newX: number) => {
    if (!slots.left) return;

    if (newX < 0) newX = 0;

    const actions = state.leftRef.value;
    if (!actions) return;

    const actionsWidth = state.leftActionsWidth.value;
    const progress = 1 - Math.min(newX / actionsWidth, 1);
    const deltaX = Math.min(newX, actionsWidth);

    const { children } = actions;
    const { length } = children;
    for (let i = 0; i < length; i++) {
      const child = children[i] as HTMLElement;
      const offsetLeft = actionsWidth - child.offsetLeft - child.offsetWidth;
      child.style.transform = translateX(deltaX + offsetLeft * progress);

      if (length > 1) child.style.zIndex = `${length - i}`;
    }
  };

  const shiftRightActions = (newX: number) => {
    if (!slots.right) return;

    if (newX > 0) newX = 0;

    const actions = state.rightRef.value;
    if (!actions) return;

    const actionsWidth = state.rightActionsWidth.value;
    const progress = 1 + Math.max(newX / actionsWidth, -1);
    const deltaX = Math.max(newX, -actionsWidth);

    const { children } = actions;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      child.style.transform = translateX(deltaX - child.offsetLeft * progress);
    }
  };

  const animateSlide = (to: number) => {
    if (state.frame.value !== undefined) {
      cancelAnimationFrame(state.frame.value);
    }

    state.frame.value = requestAnimationFrame(() => {
      if (state.contentRef.value) {
        state.contentRef.value.style.transform = translateX(to);
        shiftLeftActions(to);
        shiftRightActions(to);
      }
    });
  };

  return {
    animateSlide,
  };
}
