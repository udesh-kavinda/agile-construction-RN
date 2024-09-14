import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import axios from 'axios'; // Import axios for making HTTP requests

type ListItemProps = {
  Item: {
    id: string;
    status: string;
    type: string;
    progress: string;
    qty: number;
    dueDate: string;
    createdAt: string;
    image: string;
    stockItem: {
      id: string;
      type: string;
      offer: string | null;
      price: number;
      qty: number;
      status: string;
      door: {
        id: string;
        name: string;
        code: string;
        height: string;
        width: string;
        image: string;
        type: string;
        doorColor: string;
        glassColor: string;
        boardColor: string;
        typeOfBoard: string | null;
        boardThickness: string;
        glassThickness: string;
        status: string;
        fillingType: string;
      };
    };
  };
};

// Function to get the color based on status
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return '#c586c0'; // Green for DONE
    case 'new':
      return '#007bff'; // Blue for NEW
    case 'pending':
      return '#f39c12'; // Yellow for PENDING
    default:
      return '#888'; // Gray for unknown status
  }
};

// Function to get the color based on progress
const getProgressColor = (progress: string) => {
  switch (progress.toLowerCase()) {
    case 'done':
      return '#28a745'; // Darker green for DONE
    case 'new':
      return '#007bff'; // Darker blue for NEW
    case 'processing':
      return '#f39c12'; // Darker yellow for PENDING
    default:
      return '#666'; // Gray for unknown progress
  }
};

// Function to get the last 6 digits of the ID
const getJobTitle = (id: string) => {
  return id.slice(-6);
};

const ListItem = ({ Item }: ListItemProps) => {
  console.log('Re-rendering: ', Item.id);

  // Get the current screen dimensions
  const { width } = useWindowDimensions();
  
  // Access navigation object
  const navigation = useNavigation();

  // Compute dynamic styles based on screen width and item properties
  const cardWidth = width * 0.9; // 90% of the screen width
  const imageHeight = width * 0.5; // 50% of the screen width
  const statusColor = getStatusColor(Item.status);
  const progressColor = getProgressColor(Item.progress);

  // Define styles
  const dynamicStyles = StyleSheet.create({
    card: {
      backgroundColor: 'white',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 5,
      width: cardWidth,
      marginVertical: 10,
      marginHorizontal: 8,
      overflow: 'hidden',
      alignSelf: 'center',
    },
    image: {
      width: '100%',
      height: imageHeight,
      resizeMode: 'cover',
    },
    statusContainer: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: statusColor,
      borderRadius: 5,
      paddingVertical: 4,
      paddingHorizontal: 8,
      zIndex: 1, // Ensures the status is on top of the image
    },
    statusText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
    progressContainer: {
      position: 'absolute',
      top: 40,
      right: 10,
      backgroundColor: progressColor,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
      alignItems: 'center',
      zIndex: 1, // Ensures the progress is on top of the image
    },
    progressText: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#666',
      marginBottom: 4,
    },
    detail: {
      fontSize: 14,
      color: '#888',
      marginBottom: 4,
    },
    date: {
      fontSize: 12,
      color: '#aaa',
      marginTop: 8,
    },
    button: {
      marginTop: 12,
      backgroundColor: '#007bff',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    assignButton: {
      marginTop: 12,
      backgroundColor: '#28a745', // Green background for the assign button
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
    assignButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  // Function to handle viewing details
  const handleViewDetails = () => {
    navigation.navigate('JobDetail', { jobId: Item.id });
  };

  // Function to handle assigning the job
  const handleAssignJob = async () => {
    try {
      const response = await axios.post(`http://20.2.211.30:8080/api/employee/job/assign/${Item.id}`);
      if (response.status === 200) {
        Alert.alert('Success', 'Job has been assigned successfully.');
      } else {
        Alert.alert('Error', 'Failed to assign the job.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while assigning the job.');
      console.error(error);
    }
  };

  return (
    <View style={dynamicStyles.card}>
      {/* Status at the top right */}
      <View style={dynamicStyles.statusContainer}>
        <Text style={dynamicStyles.statusText}>{Item.status}</Text>
      </View>
      
      {/* Progress indicator in the top right, below the status */}
      <View style={dynamicStyles.progressContainer}>
        <Text style={dynamicStyles.progressText}>{Item.progress}</Text>
      </View>

      <Image source={{ uri: Item.stockItem.door.image }} style={dynamicStyles.image} />
      <View style={dynamicStyles.content}>
        <Text style={dynamicStyles.title}>Job ID: {getJobTitle(Item.id)}</Text>
        <Text style={dynamicStyles.subtitle}>Type: {Item.type}</Text>
        <Text style={dynamicStyles.detail}>Progress: {Item.progress}</Text>
        <Text style={dynamicStyles.detail}>Quantity: {Item.qty}</Text>
        <Text style={dynamicStyles.detail}>Due Date: {Item.dueDate}</Text>
        <Text style={dynamicStyles.date}>Created At: {new Date(Item.createdAt).toLocaleDateString()}</Text>
        
        {/* Buttons to view details and assign job */}
        <TouchableOpacity style={dynamicStyles.button} onPress={handleViewDetails}>
          <Text style={dynamicStyles.buttonText}>Full View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={dynamicStyles.assignButton} onPress={handleAssignJob}>
          <Text style={dynamicStyles.assignButtonText}>Assign</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(
  ListItem,
  (prevProps, nextProps) => prevProps.Item.id === nextProps.Item.id
);
