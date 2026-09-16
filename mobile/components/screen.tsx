import { View, StyleSheet } from 'react-native';
import { useThemeContext } from '@/constants/themecontext';

type ScreenProps = {
  children: React.ReactNode;
  style?: object;
};

export function Screen({ children, style }: ScreenProps) {
  const { theme } = useThemeContext();
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.bg.primary }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});