import React, { useEffect, useMemo, useRef, useCallback } from "react";


interface Item {
  value: string | number;
  label: string;
}

interface WheelPickerProps {
  hourItems: Item[];
  hourValue: string | number;
  onHourChange: (value: string | number) => void;
  ampmItems: Item[];
  ampmValue: string | number;
  onAmpmChange: (value: string | number) => void;
  containerHeight?: number;
  itemHeight?: number;
}

const WheelPickerComponent: React.FC<WheelPickerProps> = ({
  hourItems,
  hourValue,
  onHourChange: handleHourChange,
  ampmItems,
  ampmValue,
  onAmpmChange: handleAmpmChange,
  containerHeight = 150,
  itemHeight = 32
}) => {
  const hourItemsContRef = useRef<HTMLUListElement>(null);
  const ampmItemsContRef = useRef<HTMLUListElement>(null);
  const isScrolling = useRef<NodeJS.Timeout | null>(null);
  const hourRefs = useRef<(HTMLLIElement | null)[]>([]);
  const ampmRefs = useRef<(HTMLLIElement | null)[]>([]);
  const hourItemsMap = useMemo(
    () =>
      hourItems.reduce(
        (map, item, index) => map.set(item.value, index),
        new Map<string | number, number>()
      ),
    [hourItems]
  );
  const currentHourValue = useRef<number>(hourItemsMap.get(hourValue) ?? 0);
  const ampmItemsMap = useMemo(
    () =>
      ampmItems.reduce(
        (map, item, index) => map.set(item.value, index),
        new Map<string | number, number>()
      ),
    [ampmItems]
  );
  const currentAmpmValue = useRef<number>(ampmItemsMap.get(ampmValue) ?? 0);

  const visibleItemsCount = Math.floor(containerHeight / itemHeight);
  const offset = Math.round((visibleItemsCount + 1) / 2) + 1;
  const maxScrollOffset = (containerHeight - itemHeight) / 2;

  const rerenderHourElements = useCallback(
    (
      selectedElement: number,
      scrollTop: number,
      firstItemIndex = Math.max(selectedElement - offset, 0),
      lastItemIndex = Math.min(selectedElement + offset, hourItems.length)
    ) => {
      if (hourRefs.current) {
        hourRefs.current
          .slice(firstItemIndex, lastItemIndex)
          .forEach((item, index) => {
            if (item) {
              const realIndex = index + firstItemIndex;
              const scrollOffset = Math.min(
                Math.abs(scrollTop - realIndex * itemHeight - itemHeight / 2),
                maxScrollOffset
              );
              const sin = scrollOffset / maxScrollOffset;
              const cos = Math.sqrt(1 - sin ** 2);
              const [div] = item.getElementsByTagName("div");
              div.style.transform = `rotateX(${Math.asin(sin)}rad) scale(${cos})`;
              div.style.transformOrigin = "center";
            }
          });
      }
    },
    [hourItems.length, itemHeight, maxScrollOffset, offset]
  );

  const rerenderAmpmElements = useCallback(
    (
      selectedElement: number,
      scrollTop: number,
      firstItemIndex = Math.max(selectedElement - offset, 0),
      lastItemIndex = Math.min(selectedElement + offset, ampmItems.length)
    ) => {
      if (ampmRefs.current) {
        ampmRefs.current
          .slice(firstItemIndex, lastItemIndex)
          .forEach((item, index) => {
            if (item) {
              const realIndex = index + firstItemIndex;
              const scrollOffset = Math.min(
                Math.abs(scrollTop - realIndex * itemHeight - itemHeight / 2),
                maxScrollOffset
              );
              const sin = scrollOffset / maxScrollOffset;
              const cos = Math.sqrt(1 - sin ** 2);
              const [div] = item.getElementsByTagName("div");
              div.style.transform = `rotateX(${Math.asin(sin)}rad) scale(${cos})`;
              div.style.transformOrigin = "left";
            }
          });
      }
    },
    [ampmItems.length, itemHeight, maxScrollOffset, offset]
  );

  useEffect(() => {
    let isAnimating = false;

    function handleHourScroll(event: Event) {
      if (!isAnimating) {
        isAnimating = true;

        requestAnimationFrame(() => {
          const target = event.target as HTMLElement;
          const scrollTop = Math.max(target.scrollTop, 0);
          const selectedElement = Math.min(
            Math.max(Math.floor(scrollTop / itemHeight), 0),
            hourItems.length - 1
          );
          if (isScrolling.current) {
            window.clearTimeout(isScrolling.current);
          }
          rerenderHourElements(selectedElement, scrollTop);

          currentHourValue.current = selectedElement;
          isScrolling.current = setTimeout(function () {
            handleHourChange(hourItems[selectedElement].value);
          }, 20);

          isAnimating = false;
        });
      }
    }

    const hourItemsCont = hourItemsContRef.current;
    hourItemsCont?.addEventListener("scroll", handleHourScroll);
    hourRefs.current[currentHourValue.current]?.scrollIntoView({
      block: "center"
    });
    rerenderHourElements(
      currentHourValue.current,
      hourItemsCont?.scrollTop || 0,
      0,
      hourItems.length
    );
    return () => {
      hourItemsCont?.removeEventListener("scroll", handleHourScroll);
    };
  }, [handleHourChange, hourItems, itemHeight, rerenderHourElements]);

  useEffect(() => {
    let isAnimating = false;

    function handleAmpmScroll(event: Event) {
      if (!isAnimating) {
        isAnimating = true;

        requestAnimationFrame(() => {
          const target = event.target as HTMLElement;
          const scrollTop = Math.max(target.scrollTop, 0);
          const selectedElement = Math.min(
            Math.max(Math.floor(scrollTop / itemHeight), 0),
            ampmItems.length - 1
          );
          if (isScrolling.current) {
            window.clearTimeout(isScrolling.current);
          }
          rerenderAmpmElements(selectedElement, scrollTop);

          currentAmpmValue.current = selectedElement;
          isScrolling.current = setTimeout(function () {
            handleAmpmChange(ampmItems[selectedElement].value);
          }, 20);

          isAnimating = false;
        });
      }
    }

    const ampmItemsCont = ampmItemsContRef.current;
    ampmItemsCont?.addEventListener("scroll", handleAmpmScroll);
    ampmRefs.current[currentAmpmValue.current]?.scrollIntoView({
      block: "center"
    });
    rerenderAmpmElements(
      currentAmpmValue.current,
      ampmItemsCont?.scrollTop || 0,
      0,
      ampmItems.length
    );
    return () => {
      ampmItemsCont?.removeEventListener("scroll", handleAmpmScroll);
    };
  }, [handleAmpmChange, ampmItems, itemHeight, rerenderAmpmElements]);

  useEffect(() => {
    const index = hourItemsMap.get(hourValue);
    if (index !== undefined && index !== currentHourValue.current) {
      currentHourValue.current = index;
      hourRefs.current[index]?.scrollIntoView({
        block: "center",
        behavior: "smooth"
      });
      rerenderHourElements(
        currentHourValue.current,
        hourItemsContRef.current?.scrollTop || 0,
        0,
        hourItems.length
      );
    }
  }, [hourValue, hourItems.length, hourItemsMap, rerenderHourElements]);

  useEffect(() => {
    const index = ampmItemsMap.get(ampmValue);
    if (index !== undefined && index !== currentAmpmValue.current) {
      currentAmpmValue.current = index;
      ampmRefs.current[index]?.scrollIntoView({
        block: "center",
        behavior: "smooth"
      });
      rerenderAmpmElements(
        currentAmpmValue.current,
        ampmItemsContRef.current?.scrollTop || 0,
        0,
        ampmItems.length
      );
    }
  }, [ampmValue, ampmItems.length, ampmItemsMap, rerenderAmpmElements]);

  return (
    <div
      className="timeline-container relative flex w-[110px] mask-image-[linear-gradient(to_bottom,transparent_0%,black_50%,transparent_100%)]"
      style={{
        height: `${containerHeight}px`
      }}
    >
      <ul className="items h-full py-[50%] m-0 overflow-y-scroll scroll-snap-type-y-mandatory" ref={hourItemsContRef}>
        {hourItems.map((item, index) => (
          <li
            className={`item mr-[10px] list-none w-full  text-right scroll-snap-align-center ${index === currentHourValue.current ? 'text-3xl font-semibold my-2' : ''}`}
            key={item.value}
            ref={(node) => {
              hourRefs.current[index] = node;
            }}
            style={{
              height: `${itemHeight}px`,
              lineHeight: `${itemHeight}px`
            }}
          >
            <div className="inline-block w-[2ch] text-center">{item.label}</div>
          </li>
        ))}
      </ul>
      <ul className="items h-full py-[50%] m-0 overflow-y-scroll scroll-snap-type-y-mandatory absolute right-0" ref={ampmItemsContRef}>
        {ampmItems.map((item, index) => (
          <li
            className={`item mr-[10px] list-none w-full text-right scroll-snap-align-center ${index === currentAmpmValue.current ? 'text-xl font-semibold my-2' : ''}`}
            key={item.value}
            ref={(node) => {
              ampmRefs.current[index] = node;
            }}
            style={{
              height: `${itemHeight}px`,
              lineHeight: `${itemHeight}px`
            }}
          >
            <div className="inline-block">{item.label}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const WheelPicker = React.memo(WheelPickerComponent);
