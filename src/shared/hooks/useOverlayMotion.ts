import { useCallback, useRef, type ForwardedRef } from 'react';

/** Visual-only motion: Radix still owns presence, focus and dismissal. */
export function useOverlayMotion<T extends HTMLElement>(
  forwardedRef: ForwardedRef<T>,
  kind: 'menu' | 'overlay' | 'backdrop',
) {
  const active = useRef<{ node: T; cleanup: () => void }>();
  return useCallback(
    (node: T | null) => {
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
      if (!node) {
        const previous = active.current;
        // Radix can detach/reattach refs on the same connected node in one commit.
        // Retain its current frame; dispose only after an actual DOM removal.
        queueMicrotask(() => {
          if (previous && active.current === previous && !previous.node.isConnected) {
            previous.cleanup();
            active.current = undefined;
          }
        });
        return;
      }
      if (active.current?.node === node) return;
      active.current?.cleanup();
      if (typeof node.animate !== 'function') return;

      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      let animation: Animation | undefined;
      let previousState: string | undefined;
      const update = (force = false) => {
        const state = node.dataset.state;
        if (state !== 'open' && state !== 'closed') return;
        if (!force && previousState === state) return;
        previousState = state;
        const entering = state === 'open';
        const keyboard = !!document.activeElement?.matches(':focus-visible');
        node.dataset.motionInstant = String(keyboard);
        const fadeOnly = preference.matches || keyboard || kind === 'backdrop';
        const style = getComputedStyle(node);
        // Sample before cancelling so a rapid reversal continues from this frame.
        const opacity = animation ? style.opacity : entering ? '0' : '1';
        const scale = fadeOnly
          ? '1'
          : animation
            ? style.scale
            : entering
              ? style.getPropertyValue('--motion-scale-start').trim()
              : '1';
        const token = keyboard
          ? '--motion-instant'
          : preference.matches
            ? '--motion-reduced'
            : `--motion-${kind === 'backdrop' ? 'overlay' : kind}-${entering ? 'enter' : 'exit'}`;
        const duration = parseFloat(style.getPropertyValue(token));
        animation?.cancel();
        animation = node.animate(
          [
            { opacity, scale: scale === 'none' ? '1' : scale },
            {
              opacity: entering ? '1' : '0',
              scale:
                fadeOnly || entering ? '1' : style.getPropertyValue('--motion-scale-start').trim(),
            },
          ],
          { duration, easing: style.getPropertyValue('--motion-ease').trim(), fill: 'both' },
        );
      };
      const observer = new MutationObserver(() => update());
      observer.observe(node, { attributes: true, attributeFilter: ['data-state'] });
      const changePreference = () => update(true);
      preference.addEventListener('change', changePreference);
      update();
      active.current = {
        node,
        cleanup: () => {
          observer.disconnect();
          preference.removeEventListener('change', changePreference);
          animation?.cancel();
        },
      };
    },
    [forwardedRef, kind],
  );
}
