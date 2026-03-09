import { Children, forwardRef, useImperativeHandle, useState } from "react";
import { StyleSheet, View } from "react-native";

export interface SlidePagerHandle {
  setPage: (page: number) => void;
}

interface SlidePagerProps {
  children: React.ReactNode;
  onPageChanged: (page: number) => void;
}

export const SlidePager = forwardRef<SlidePagerHandle, SlidePagerProps>(
  function SlidePager({ children, onPageChanged }, ref) {
    const [activePage, setActivePage] = useState(0);
    const slides = Children.toArray(children);

    useImperativeHandle(ref, () => ({
      setPage: (page: number) => {
        setActivePage(page);
        onPageChanged(page);
      },
    }));

    return <View style={styles.pager}>{slides[activePage]}</View>;
  },
);

const styles = StyleSheet.create({
  pager: {
    flex: 1,
  },
});
