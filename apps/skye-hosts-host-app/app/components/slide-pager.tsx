import { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet } from "react-native";
import PagerView from "react-native-pager-view";

export interface SlidePagerHandle {
  setPage: (page: number) => void;
}

interface SlidePagerProps {
  children: React.ReactNode;
  onPageChanged: (page: number) => void;
}

export const SlidePager = forwardRef<SlidePagerHandle, SlidePagerProps>(
  function SlidePager({ children, onPageChanged }, ref) {
    const pagerRef = useRef<PagerView>(null);

    useImperativeHandle(ref, () => ({
      setPage: (page: number) => pagerRef.current?.setPage(page),
    }));

    return (
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => onPageChanged(e.nativeEvent.position)}
      >
        {children}
      </PagerView>
    );
  },
);

const styles = StyleSheet.create({
  pager: {
    flex: 1,
  },
});
