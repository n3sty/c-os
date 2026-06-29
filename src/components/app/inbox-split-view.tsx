"use client";

import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
  ReactNode,
} from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_LIST_WIDTH = 340;
const MIN_LIST_WIDTH = 280;
const MAX_LIST_WIDTH = 520;
const MIN_DETAIL_WIDTH = 480;
const KEYBOARD_STEP = 16;
const STORAGE_KEY = "coscience:inbox-list-width";
const RESIZING_CLASS = "inbox-is-resizing";

type InboxSplitViewProps = {
  list: ReactNode;
  detail: ReactNode;
  detailOpen: boolean;
};

function clampListWidth(width: number, containerWidth: number) {
  const availableWidth = Math.max(
    MIN_LIST_WIDTH,
    containerWidth - MIN_DETAIL_WIDTH,
  );

  return Math.min(
    Math.max(width, MIN_LIST_WIDTH),
    Math.min(MAX_LIST_WIDTH, availableWidth),
  );
}

export function InboxSplitView({
  list,
  detail,
  detailOpen,
}: InboxSplitViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [listWidth, setListWidth] = useState(DEFAULT_LIST_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const storedWidth = Number.parseInt(
      window.localStorage.getItem(STORAGE_KEY) ?? "",
      10,
    );

    if (Number.isFinite(storedWidth) && containerRef.current) {
      setListWidth(
        clampListWidth(storedWidth, containerRef.current.clientWidth),
      );
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setListWidth((width) => clampListWidth(width, entry.contentRect.width));
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(
    () => () => {
      document.documentElement.classList.remove(RESIZING_CLASS);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    },
    [],
  );

  function updateListWidth(nextWidth: number) {
    const container = containerRef.current;
    if (!container) return;

    const width = clampListWidth(nextWidth, container.clientWidth);
    setListWidth(width);
    window.localStorage.setItem(STORAGE_KEY, String(width));
  }

  function handlePointerDown(event: PointerEvent<HTMLHRElement>) {
    if (event.button !== 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsResizing(true);
    document.documentElement.classList.add(RESIZING_CLASS);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  function handlePointerMove(event: PointerEvent<HTMLHRElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    event.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    updateListWidth(event.clientX - container.getBoundingClientRect().left);
  }

  function stopResizing(
    event: PointerEvent<HTMLHRElement>,
    releaseCapture = true,
  ) {
    if (
      releaseCapture &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsResizing(false);
    document.documentElement.classList.remove(RESIZING_CLASS);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }

  function handleKeyDown(event: KeyboardEvent<HTMLHRElement>) {
    let nextWidth = listWidth;

    switch (event.key) {
      case "ArrowLeft":
        nextWidth -= KEYBOARD_STEP;
        break;
      case "ArrowRight":
        nextWidth += KEYBOARD_STEP;
        break;
      case "Home":
        nextWidth = MIN_LIST_WIDTH;
        break;
      case "End":
        nextWidth = MAX_LIST_WIDTH;
        break;
      default:
        return;
    }

    event.preventDefault();
    updateListWidth(nextWidth);
  }

  const splitViewStyle = {
    "--inbox-list-width": `${listWidth}px`,
  } as CSSProperties;

  return (
    <div className="@container/inbox" ref={containerRef} style={splitViewStyle}>
      <div className="relative isolate min-h-[calc(100svh-2rem)] overflow-hidden rounded-xl border border-border bg-card after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:z-[70] after:h-px after:bg-white/10 @[760px]/inbox:grid @[760px]/inbox:grid-cols-[var(--inbox-list-width)_minmax(480px,1fr)]">
        <section
          className={cn("min-w-0", detailOpen && "hidden @[760px]/inbox:block")}
        >
          {list}
        </section>

        <section
          className={cn(
            "h-full min-w-0 overflow-hidden border-border/60 @[760px]/inbox:border-l",
            !detailOpen && "hidden @[760px]/inbox:block",
          )}
        >
          {detail}
        </section>

        <hr
          aria-label="Resize inbox list"
          aria-orientation="vertical"
          aria-valuemax={MAX_LIST_WIDTH}
          aria-valuemin={MIN_LIST_WIDTH}
          aria-valuenow={Math.round(listWidth)}
          className={cn(
            "-translate-x-1/2 absolute top-0 bottom-0 left-[var(--inbox-list-width)] z-20 hidden h-auto w-3 cursor-col-resize touch-none border-0 outline-none @[760px]/inbox:block",
            "before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:bg-transparent before:transition-colors",
            "hover:before:bg-ring/70 focus-visible:before:w-0.5 focus-visible:before:bg-ring",
            isResizing && "before:w-0.5 before:bg-ring",
          )}
          onDoubleClick={() => updateListWidth(DEFAULT_LIST_WIDTH)}
          onKeyDown={handleKeyDown}
          onLostPointerCapture={(event) => stopResizing(event, false)}
          onPointerCancel={stopResizing}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopResizing}
          tabIndex={0}
        />
      </div>
    </div>
  );
}
