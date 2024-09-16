import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import axios from 'axios';

// Define a type that can represent either a door or a window
type DoorOrWindow = {
  id: string;
  name: string;
  code: string;
  height: string;
  width: string;
  image: string;
  colorType?: string;
  windowColor?: string;  // For windows
  boardColor?: string;   // For doors
  glassColor?: string;
  typeOfBoard?: string;
  boardThickness?: string;
  glassThickness?: string;
  status: string;
  fillingType?: string;
  price?: number | null;  // Optional if not always present
};

type StockItem = {
  id: string;
  type: string;
  offer?: string | null;
  price?: number | null;
  qty: number;
  status: string;
  door?: DoorOrWindow | null;  // door can be null
  windows?: DoorOrWindow | null; // windows can be null
};

type ListItemProps = {
  Item: {
    id: string;
    status: string;
    type: string;
    progress: string;
    qty: number;
    dueDate: string;
    createdAt: string;
    image?: string;
    stockItem: StockItem;
  };
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'done':
      return '#28a745'; // Green
    case 'active':
      return '#c586c0'; // Blue
    case 'pending':
      return '#ffc107'; // Yellow
    default:
      return '#6c757d'; // Gray
  }
};

const getProgressColor = (progress: string) => {
  switch (progress.toLowerCase()) {
    case 'done':
      return '#28a745'; // Green
    case 'pending':
      return '#007bff'; // Blue
    case 'processing':
      return '#ffc107'; // Yellow
    default:
      return '#6c757d'; // Gray
  }
};

const getJobTitle = (id: string) => id.slice(-6); // Last 6 digits of the job ID

const PendingListItem = ({ Item }: ListItemProps) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  const cardWidth = width * 0.9;
  const imageHeight = width * 0.5;
  const statusColor = getStatusColor(Item.status);
  const progressColor = getProgressColor(Item.progress);

  // Choose between door and window data
  const itemDetail = Item.stockItem.door || Item.stockItem.windows;

  if (!itemDetail) {
    return null; // If both are null, don't render anything
  }

  const dynamicStyles = StyleSheet.create({
    card: {
      backgroundColor: 'white',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 5,
      marginVertical: 10,
      marginHorizontal: 8,
      overflow: 'hidden',
      alignSelf: 'center',
      width: cardWidth,
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
      zIndex: 1,
    },
    statusText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
    progressContainer: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: progressColor,
      borderRadius: 5,
      paddingVertical: 4,
      paddingHorizontal: 8,
      zIndex: 1,
    },
    progressText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 18,
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
      backgroundColor: '#28a745',
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

  const handleViewDetails = () => {
    navigation.navigate('JobVeiw', { jobId: Item.id });
  };

  return (
    <View style={dynamicStyles.card}>
      <View style={dynamicStyles.statusContainer}>
        <Text style={dynamicStyles.statusText}>{Item.status}</Text>
      </View>
      <View style={dynamicStyles.progressContainer}>
        <Text style={dynamicStyles.progressText}>{Item.progress}</Text>
      </View>
      <Image source={{ uri: itemDetail.image }} style={dynamicStyles.image} />
      <View style={dynamicStyles.content}>
        <Text style={dynamicStyles.title}>Job ID: {getJobTitle(Item.id)}</Text>
        <Text style={dynamicStyles.subtitle}>Type: {Item.type}</Text>
        <Text style={dynamicStyles.detail}>Progress: {Item.progress}</Text>
        <Text style={dynamicStyles.detail}>Quantity: {Item.qty}</Text>
        <Text style={dynamicStyles.detail}>Due Date: {Item.dueDate}</Text>
        <Text style={dynamicStyles.date}>Created At: {new Date(Item.createdAt).toLocaleDateString()}</Text>
        <TouchableOpacity style={dynamicStyles.button} onPress={handleViewDetails}>
          <Text style={dynamicStyles.buttonText}>Full View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(
  PendingListItem,
  (prevProps, nextProps) => prevProps.Item.id === nextProps.Item.id
);
