// Hauteur réservée en bas des écrans à onglets : la tab bar est en position absolute
// (height 65 + marginBottom 30 dans app/(tabs)/_layout.tsx) et passe PAR-DESSUS le contenu.
// Tout ScrollView d'un onglet doit finir par ce padding pour que son dernier élément reste visible.
export const TAB_BAR_HEIGHT = 65
export const TAB_BAR_MARGIN_BOTTOM = 30
export const TAB_BAR_SPACE = TAB_BAR_HEIGHT + TAB_BAR_MARGIN_BOTTOM + 24
