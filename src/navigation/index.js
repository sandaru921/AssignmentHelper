import React from 'react';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Home from '../screens/Home';
import Details from '../screens/Details';
import BookDetails from '../screens/BookDetails';
import AddAssignment from '../screens/AddAssignment';
import Favorites from '../screens/Favorites';
import Profile from '../screens/Profile';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { Platform } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ isDarkMode, toggleTheme }) {
  const paperTheme = usePaperTheme();
  return (
    <Tab.Navigator 
      screenOptions={{ 
        tabBarActiveTintColor: paperTheme.colors.primary, 
        tabBarStyle: { backgroundColor: paperTheme.colors.background },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        options={{ tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} /> }}
      >
        {(props) => <Home {...props} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Favorites" 
        options={{ tabBarIcon: ({ color }) => <Feather name="heart" size={24} color={color} /> }}
      >
        {(props) => <Favorites {...props} isDarkMode={isDarkMode} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Profile" 
        options={{ tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} /> }}
      >
        {(props) => <Profile {...props} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function Navigation({ isDarkMode, toggleTheme }) {
  const { token, user } = useSelector(state => state.auth);
  const paperTheme = usePaperTheme();

  // Merge Navigation default theme with Paper theme colors
  const navigationTheme = {
    ...NavigationDefaultTheme,
    dark: isDarkMode,
    colors: {
      ...NavigationDefaultTheme.colors,
      primary: paperTheme.colors.primary,
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.text,
      border: paperTheme.colors.placeholder,
      notification: paperTheme.colors.notification,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {token ? (
        <Stack.Navigator
          screenOptions={{
            headerTintColor: paperTheme.colors.onSurface,
            headerStyle: { 
              backgroundColor: paperTheme.colors.surface,
            },
            headerTitleStyle: {
              fontWeight: Platform.OS === 'web' ? '600' : 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Main" 
            options={{ 
              headerTitle: `Welcome, ${user?.name || user?.username || user?.email || 'User'}`,
            }}
          >
            {(props) => <MainTabs {...props} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
          </Stack.Screen>
          <Stack.Screen 
            name="Details" 
            component={Details} 
            options={{ title: 'Assignment Details' }}
          />
          <Stack.Screen 
            name="BookDetails" 
            component={BookDetails} 
            options={{ title: 'Book Details' }}
          />
          <Stack.Screen 
            name="AddAssignment" 
            component={AddAssignment} 
            options={{ title: 'New Assignment' }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerTintColor: paperTheme.colors.onSurface,
            headerStyle: { 
              backgroundColor: paperTheme.colors.surface,
            },
            headerTitleStyle: {
              fontWeight: Platform.OS === 'web' ? '600' : 'bold',
            },
          }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}