import { StyleSheet, View } from "react-native";
import { BottomNavigation } from "react-native-paper";
import { useRouter, usePathname } from "expo-router";
import { useState, useEffect, useCallback, memo } from "react";
import { colors } from "@/styles/colors";
import { 
  IconHome, 
  IconWallet, 
  IconTrophy, 
  IconSearch, 
  IconSettings
} from '@tabler/icons-react-native';

export interface NavigationRoute {
  title: string;
  href: string;
  iconName: any;
}

const navigationRoutes: NavigationRoute[] = [
  { 
    title: "Início", 
    href: "/home", 
    iconName: IconHome
  },
  { 
    title: "Carteira", 
    href: "/wallet", 
    iconName: IconWallet
  },
  { 
    title: "Rank", 
    href: "/leaderboard", 
    iconName: IconTrophy
  },
  { 
    title: "Pesquisa", 
    href: "/search", 
    iconName: IconSearch
  },
  { 
    title: "Config.", 
    href: "/settings", 
    iconName: IconSettings
  },
];

const routes = navigationRoutes.map((route) => ({
  key: route.href,
  title: route.title,
  focusedIcon: ({ color, size }: { color: string; size: number }) => {
    const IconComponent = route.iconName;
    return <IconComponent size={size} color={color} />;
  },
  unfocusedIcon: ({ color, size }: { color: string; size: number }) => {
    const IconComponent = route.iconName;
    return <IconComponent size={size} color={color} />;
  },
}));

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 1000,
  },
  bar: {
    backgroundColor: "#fff",
    height: 70,
    paddingHorizontal: 10
  },
});

let lastNavigationTime = 0;

export const BottomNavigationBar = memo(() => {
  const router = useRouter();
  const pathname = usePathname();
  const [index, setIndex] = useState(() => {
    const initialIndex = navigationRoutes.findIndex(
      (route) => route.href === pathname
    );
    return initialIndex !== -1 ? initialIndex : 0;
  });

  useEffect(() => {
    const currentRouteIndex = navigationRoutes.findIndex(
      (route) => route.href === pathname
    );
    if (currentRouteIndex !== -1 && currentRouteIndex !== index) {
      setIndex(currentRouteIndex);
    }
  }, [pathname]);

  const handleIndexChange = useCallback((newIndex: number) => {
    if (newIndex === index) return;
    
    const now = Date.now();
    if (now - lastNavigationTime < 300) {
      return;
    }
    lastNavigationTime = now;
    
    const route = navigationRoutes[newIndex].href;
    setIndex(newIndex);
    
    setTimeout(() => {
      router.push(route as any);
    }, 10);
  }, [index, router]);

  const renderScene = useCallback(() => null, []);

  return (
    <View style={styles.container}>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={handleIndexChange}
        renderScene={renderScene}
        barStyle={styles.bar}
        activeColor={colors.green.base}
        inactiveColor={colors.whiteShades[400]}
        shifting={false}
        compact={true}
        safeAreaInsets={{ bottom: 10 }}
        activeIndicatorStyle={{ backgroundColor: colors.green.dark }}
        theme={{ colors: { secondaryContainer: colors.green.dark } }}
      />
    </View>
  );
});