import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/themecontext';

type StepDotsProps = {
  current: number; // index de l'étape active, base 0
  total:   number; // nombre total d'étapes
};

export function StepDots({ current, total }: StepDotsProps) {
  const styles = useStyles();

  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current && styles.dotActive,
            i < current && styles.dotDone,
          ]}
        />
      ))}
    </View>
  );
}

function useStyles() {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.xl,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.border.inactive,
    },
    dotActive: {
      width: 24,
      backgroundColor: theme.colors.accent.default,
    },
    dotDone: {
      backgroundColor: theme.colors.accent.dark,
    },
  }), [theme]);
}