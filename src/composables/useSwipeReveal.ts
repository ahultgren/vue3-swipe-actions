import type { SwipeState } from "./useSwipeState";
import { areEqual } from "../utils/areEqual";

type Direction = "left" | "right" | false;

interface RevealEmits {
  (e: "update:revealed", value: Direction): void;
  (e: "closed"): void;
  (e: "revealed", value: { side: "left" | "right"; close: () => void }): void;
  (e: "leftRevealed", value: { close: () => void }): void;
  (e: "rightRevealed", value: { close: () => void }): void;
}

export function useSwipeReveal(
  state: SwipeState,
  animateSlide: (to: number) => void,
  emit: RevealEmits
) {
  const reveal = (dir: Direction, recalculateWidth?: boolean) => {
    if (state.isActive.value && areEqual(state.innerRevealed.value, dir)) {
      return;
    }

    if (dir && !state[`${dir}Ref`].value) {
      dir = false;
    }

    state.innerRevealed.value = dir;
    emit("update:revealed", dir);

    if (!dir) {
      animateSlide(0);
      emit("closed");
      return;
    }

    if (dir === "left" && state.leftRef.value) {
      state.leftActionsWidth.value = recalculateWidth
        ? state.leftRef.value.clientWidth
        : state.leftActionsWidth.value;
      animateSlide(state.leftActionsWidth.value);
      emit("revealed", { side: "left", close });
      emit("leftRevealed", { close });
      return;
    }

    if (dir === "right" && state.rightRef.value) {
      state.rightActionsWidth.value = recalculateWidth
        ? state.rightRef.value.clientWidth
        : state.rightActionsWidth.value;
      animateSlide(-state.rightActionsWidth.value);
      emit("revealed", { side: "right", close });
      emit("rightRevealed", { close });
    }
  };

  const close = () => {
    if (state.isActive.value) return;
    reveal(false, true);
  };

  const revealLeft = () => {
    if (state.isActive.value || !state.leftRef.value) return;
    reveal("left", true);
  };

  const revealRight = () => {
    if (state.isActive.value || !state.rightRef.value) return;
    reveal("right", true);
  };

  return {
    reveal,
    close,
    revealLeft,
    revealRight,
  };
}
