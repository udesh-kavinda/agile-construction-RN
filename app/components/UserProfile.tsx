import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext'; // Adjust the path as necessary

const UserProfile = () => {
  const { authState, onLogout } = useAuth();
  const user = authState?.user;

  if (!user) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: user.image }} style={styles.profileImage} />
        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.label}>Gender:</Text>
        <Text style={styles.value}>{user.gender}</Text>

        <Text style={styles.label}>Date of Birth:</Text>
        <Text style={styles.value}>{user.dob || 'Not Provided'}</Text>

        <Text style={styles.label}>Contact:</Text>
        <Text style={styles.value}>{user.contact || 'Not Provided'}</Text>

        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{user.address || 'Not Provided'}</Text>

        <Text style={styles.label}>NIC:</Text>
        <Text style={styles.value}>{user.nic || 'Not Provided'}</Text>

        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{user.userRole}</Text>

        <Text style={styles.label}>Designation:</Text>
        <Text style={styles.value}>{user.designation}</Text>

        <Text style={styles.label}>Registered Date:</Text>
        <Text style={styles.value}>{user.registeredDate || 'Not Provided'}</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#555',
  },
  infoSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 4,
  },
  value: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default UserProfile;
