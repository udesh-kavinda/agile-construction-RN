import React from 'react';
import { View, StyleSheet } from 'react-native';
import UserProfile from '../components/UserProfile'; // Adjust the path as necessary

const Profile = () => {
  return (
    <View style={styles.container}>
      <UserProfile />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default Profile;
