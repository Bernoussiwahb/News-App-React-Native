import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/colors';
import { SignupScreen } from '../screens/SignupScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ArticleDetailsScreen } from '../screens/ArticleDetailsScreen';
import { useAuth } from '../context/AuthContext';

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.accent,
  },
};

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AppStack = createNativeStackNavigator();

const AuthStackNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.background },
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
  </AuthStack.Navigator>
);

const AppTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerStyle: { backgroundColor: colors.surface },
      headerTitleStyle: { color: colors.textPrimary, fontWeight: '600' },
      headerShadowVisible: false,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarLabelStyle: { fontSize: 12, marginBottom: 4 },
      tabBarIcon: ({ color, size, focused }) => {
        const icons = {
          Home: ['newspaper-outline', 'newspaper'],
          Search: ['search-outline', 'search'],
          Favorites: ['bookmark-outline', 'bookmark'],
          Profile: ['person-circle-outline', 'person-circle'],
        };
        const [outline, filled] = icons[route.name];
        return (
          <Ionicons name={focused ? filled : outline} size={size} color={color} />
        );
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Favorites" component={FavoritesScreen} />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
  </Tab.Navigator>
);

const AppStackNavigator = () => (
  <AppStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.surface },
      headerTitleStyle: { color: colors.textPrimary, fontWeight: '600' },
      headerTintColor: colors.textPrimary,
      headerShadowVisible: false,
      contentStyle: { backgroundColor: colors.background },
    }}
  >
    <AppStack.Screen
      name="Tabs"
      component={AppTabNavigator}
      options={{ headerShown: false }}
    />
    <AppStack.Screen
      name="ArticleDetails"
      component={ArticleDetailsScreen}
      options={{ title: 'Article' }}
    />
  </AppStack.Navigator>
);

export const AppNavigator = () => {
  const { user, initializing } = useAuth();
  const navigationKey = user ? 'app' : 'auth';

  return (
    <NavigationContainer theme={appTheme} key={navigationKey}>
      {initializing ? (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : user ? (
        <AppStackNavigator />
      ) : (
        <AuthStackNavigator />
      )}
    </NavigationContainer>
  );
};
