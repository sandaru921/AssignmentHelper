import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateProfile } from '../store/authSlice';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, useTheme, TextInput, Card, Avatar, Divider, Switch, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Profile({ isDarkMode, toggleTheme }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const theme = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || user?.email?.split('@')[0] || '');
  const [email, setEmail] = useState(user?.email || '');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSave = () => {
    if (!name.trim() || !username.trim()) {
      setSnackbarMessage('Name and username are required');
      setSnackbarVisible(true);
      return;
    }

    dispatch(updateProfile({
      name: name.trim(),
      username: username.trim(),
      email: email,
    }));

    setIsEditing(false);
    setSnackbarMessage('Profile updated successfully');
    setSnackbarVisible(true);
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setUsername(user?.username || user?.email?.split('@')[0] || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };

  const getInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Profile Header */}
        <Card style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.headerContent}>
            <Avatar.Text 
              size={80} 
              label={getInitials()} 
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.headerInfo}>
              <Text style={[styles.userName, { color: theme.colors.onSurface }]}>
                {user?.name || user?.email || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>
                @{user?.username || user?.email?.split('@')[0] || 'username'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Edit Profile Section */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="account-edit" size={24} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Profile Information
                </Text>
              </View>
              {!isEditing && (
                <Button
                  mode="outlined"
                  compact
                  onPress={() => setIsEditing(true)}
                  icon="pencil"
                >
                  Edit
                </Button>
              )}
            </View>

            <Divider style={styles.divider} />

            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              disabled={!isEditing}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              disabled={!isEditing}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="at" />}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              disabled={true}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            {isEditing && (
              <View style={styles.editActions}>
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  style={styles.editButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.editButton}
                  icon="content-save"
                >
                  Save
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Preferences Section */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="cog" size={24} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Preferences
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <MaterialCommunityIcons 
                  name={isDarkMode ? 'weather-night' : 'weather-sunny'} 
                  size={24} 
                  color={theme.colors.onSurfaceVariant} 
                />
                <View style={styles.preferenceText}>
                  <Text style={[styles.preferenceTitle, { color: theme.colors.onSurface }]}>
                    Dark Mode
                  </Text>
                  <Text style={[styles.preferenceSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                    {isDarkMode ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Switch value={isDarkMode} onValueChange={toggleTheme} />
            </View>
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button 
          mode="contained" 
          onPress={() => dispatch(logout())} 
          style={styles.logoutButton}
          icon="logout"
          buttonColor={theme.colors.error}
        >
          Logout
        </Button>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerInfo: {
    marginLeft: 20,
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  divider: {
    marginVertical: 16,
  },
  input: {
    marginBottom: 12,
  },
  editActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceText: {
    marginLeft: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  preferenceSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
  },
});