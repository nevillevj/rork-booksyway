import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Settings,
  Bell,
  CreditCard,
  MapPin,
  Globe,
  LogOut,
  Edit3,
  Save,
  X,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const { user, logout, updateProfile, deleteAccount, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedUser, setEditedUser] = useState(user);

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Profile', headerShown: true }} />
        <View style={styles.notAuthenticatedContainer}>
          <User size={64} color={Colors.light.tabIconDefault} />
          <Text style={styles.notAuthenticatedTitle}>Sign in to view your profile</Text>
          <Text style={styles.notAuthenticatedSubtitle}>
            Access your bookings, preferences, and more
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/login')}
            testID="sign-in-button"
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => router.push('/signup')}
            testID="sign-up-button"
          >
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleSave = async (): Promise<void> => {
    if (!editedUser) return;

    try {
      await updateProfile(editedUser);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancel = (): void => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleLogout = (): void => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = (): void => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  const toggleNotification = (type: 'email' | 'push' | 'sms'): void => {
    if (!editedUser) return;
    
    const updatedUser = {
      ...editedUser,
      preferences: {
        ...editedUser.preferences,
        notifications: {
          ...editedUser.preferences.notifications,
          [type]: !editedUser.preferences.notifications[type],
        },
      },
    };
    setEditedUser(updatedUser);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Profile', 
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={isEditing ? handleSave : () => setIsEditing(true)}
              style={styles.headerButton}
              testID={isEditing ? "save-button" : "edit-button"}
            >
              {isEditing ? (
                <Save size={20} color={Colors.light.tint} />
              ) : (
                <Edit3 size={20} color={Colors.light.tint} />
              )}
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#fff" />
            </View>
          </View>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoItem}>
            <Mail size={20} color={Colors.light.tabIconDefault} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={editedUser?.email || ''}
                  onChangeText={(text) => setEditedUser(prev => prev ? {...prev, email: text} : null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.infoValue}>{user.email}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoItem}>
            <Phone size={20} color={Colors.light.tabIconDefault} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={editedUser?.phone || ''}
                  onChangeText={(text) => setEditedUser(prev => prev ? {...prev, phone: text} : null)}
                  keyboardType="phone-pad"
                  placeholder="Add phone number"
                />
              ) : (
                <Text style={styles.infoValue}>{user.phone || 'Not provided'}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoItem}>
            <Calendar size={20} color={Colors.light.tabIconDefault} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={editedUser?.dateOfBirth || ''}
                  onChangeText={(text) => setEditedUser(prev => prev ? {...prev, dateOfBirth: text} : null)}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <Text style={styles.infoValue}>{user.dateOfBirth || 'Not provided'}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.infoItem}>
            <Globe size={20} color={Colors.light.tabIconDefault} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Language</Text>
              <Text style={styles.infoValue}>{user.preferences.language.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <CreditCard size={20} color={Colors.light.tabIconDefault} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Currency</Text>
              <Text style={styles.infoValue}>{user.preferences.currency}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.notificationItem}>
            <Bell size={20} color={Colors.light.tabIconDefault} />
            <View style={styles.notificationContent}>
              <Text style={styles.notificationLabel}>Email Notifications</Text>
              <Switch
                value={editedUser?.preferences.notifications.email || false}
                onValueChange={() => toggleNotification('email')}
                trackColor={{ false: '#e1e5e9', true: Colors.light.tint }}
                thumbColor="#fff"
                disabled={!isEditing}
              />
            </View>
          </View>

          <View style={styles.notificationItem}>
            <Bell size={20} color={Colors.light.tabIconDefault} />
            <View style={styles.notificationContent}>
              <Text style={styles.notificationLabel}>Push Notifications</Text>
              <Switch
                value={editedUser?.preferences.notifications.push || false}
                onValueChange={() => toggleNotification('push')}
                trackColor={{ false: '#e1e5e9', true: Colors.light.tint }}
                thumbColor="#fff"
                disabled={!isEditing}
              />
            </View>
          </View>

          <View style={styles.notificationItem}>
            <Bell size={20} color={Colors.light.tabIconDefault} />
            <View style={styles.notificationContent}>
              <Text style={styles.notificationLabel}>SMS Notifications</Text>
              <Switch
                value={editedUser?.preferences.notifications.sms || false}
                onValueChange={() => toggleNotification('sms')}
                trackColor={{ false: '#e1e5e9', true: Colors.light.tint }}
                thumbColor="#fff"
                disabled={!isEditing}
              />
            </View>
          </View>
        </View>

        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              testID="cancel-button"
            >
              <X size={16} color={Colors.light.tabIconDefault} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} testID="logout-button" onPress={handleLogout}>
            <LogOut size={20} color={Colors.light.tint} />
            <Text style={styles.actionButtonText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            testID="delete-account-button"
            onPress={handleDeleteAccount}
          >
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  notAuthenticatedTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  notAuthenticatedSubtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    marginBottom: 32,
  },
  signInButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  signUpButton: {
    borderWidth: 1,
    borderColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  editInput: {
    fontSize: 16,
    color: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tint,
    paddingVertical: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 16,
  },
  notificationLabel: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  editActions: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.light.tabIconDefault,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  actionButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '500' as const,
  },
  dangerButton: {
    marginTop: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '500' as const,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
  },
});