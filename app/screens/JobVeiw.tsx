import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { ActionSheetCustom as ActionSheet } from '@expo/react-native-action-sheet';

const JobView = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { jobId } = route.params as { jobId: string };
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const actionSheetRef = useRef(null);
  const cameraRef = useRef(null);
  const API_BASE_URL = 'http://192.168.8.111:8080';

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/employee/job/${jobId}`);
        setJob(response.data.data);
      } catch (err) {
        setError('Failed to fetch job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera permissions to make this work!');
    }
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need media library permissions to make this work!');
    }
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setSelectedImage(photo);
      setCameraVisible(false);
    }
  };

  const selectImageFromLibrary = async () => {
    await requestMediaLibraryPermission();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleActionSheet = (index) => {
    if (index === 0) {
      requestCameraPermission();
      setCameraVisible(true);
    } else if (index === 1) {
      selectImageFromLibrary();
    }
  };

  const handleAssignToMe = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/employee/job/assign/${jobId}`);
      setJob((prevJob: any) => ({ ...prevJob, progress: 'pending' }));
    } catch (err) {
      setError('Failed to assign job');
    }
  };

  const handleStartJob = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/employee/job/start/${jobId}`);
      setJob((prevJob: any) => ({ ...prevJob, progress: 'processing' }));
      navigation.navigate('PendingList');
    } catch (err) {
      setError('Failed to start the job');
    }
  };

  const handleCompleteJob = async () => {
    if (job.creationType === 'NEW') {
      if (!selectedImage) {
        Alert.alert('Image Required', 'Please upload an image before completing this job.');
        return;
      }

      try {
        const formData: FormData = new FormData();
        const res = await fetch(selectedImage.uri);
        const image = await res.blob();
        const imageName = 'photo.jpg';
        formData.append('image', image, imageName);

        await axios.put(`${API_BASE_URL}/api/employee/job/done/${jobId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setJob((prevJob) => ({ ...prevJob, progress: 'done' }));
        navigation.navigate('PendingList');
      } catch (err) {
        console.error('Error completing job with image:', err);
        setError('Failed to complete the job with image');
      }
    } else {
      try {
        await axios.put(`${API_BASE_URL}/api/employee/job/done/${jobId}`);
        setJob((prevJob) => ({ ...prevJob, progress: 'done' }));
        navigation.navigate('PendingList');
      } catch (err) {
        console.error('Error completing job:', err);
        setError('Failed to complete the job');
      }
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ea" style={styles.loading} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (!job) {
    return <Text style={styles.error}>No job details found</Text>;
  }

  const renderStatusBadge = (status: string) => {
    let statusColor = '#f0ad4e';
    if (status === 'done') statusColor = '#28a745';
    if (status === 'processing') statusColor = '#007bff';
    if (status === 'pending') statusColor = '#ffc107';
    if (status === 'new') statusColor = '#dc3545';

    return (
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{status.toUpperCase()}</Text>
      </View>
    );
  };

  const itemDetail = job.stockItem.door || job.stockItem.windows;
  if (!itemDetail) {
    return <Text style={styles.error}>No item details found</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {itemDetail.image ? (
          <Image source={{ uri: itemDetail.image }} style={styles.image} />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No Image Available</Text>
          </View>
        )}
        <Text style={styles.title}>{itemDetail.name}</Text>
        <Text style={styles.subtitle}>Code: {itemDetail.code}</Text>
        {renderStatusBadge(job.progress)}
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.row}>
          <Icon name="info" size={20} color="#007bff" />
          <Text style={styles.detailLabel}>Job Type:</Text>
        </View>
        <Text style={styles.detail}>{job.type}</Text>

        <View style={styles.row}>
          <Icon name="date-range" size={20} color="#007bff" />
          <Text style={styles.detailLabel}>Due Date:</Text>
        </View>
        <Text style={styles.detail}>{job.dueDate}</Text>

        <View style={styles.row}>
          <Icon name="inbox" size={20} color="#007bff" />
          <Text style={styles.detailLabel}>Quantity:</Text>
        </View>
        <Text style={styles.detail}>{job.qty}</Text>

        {job.stockItem.door.price !== null && (
          <>
            <View style={styles.row}>
              <Icon name="attach-money" size={20} color="#007bff" />
              <Text style={styles.detailLabel}>Price:</Text>
            </View>
            <Text style={styles.detail}>${job.stockItem.door.price}</Text>
          </>
        )}

        {job.stockItem.door.doorColor && (
          <>
            <View style={styles.row}>
              <Icon name="palette" size={20} color="#007bff" />
              <Text style={styles.detailLabel}>Door Color:</Text>
            </View>
            <Text style={styles.detail}>{job.stockItem.door.doorColor}</Text>
          </>
        )}

        {job.stockItem.door.boardColor && (
          <>
            <View style={styles.row}>
              <Icon name="palette" size={20} color="#007bff" />
              <Text style={styles.detailLabel}>Board Color:</Text>
            </View>
            <Text style={styles.detail}>{job.stockItem.door.boardColor}</Text>
          </>
        )}

        {job.stockItem.door.fillingType && (
          <>
            <View style={styles.row}>
              <Icon name="build" size={20} color="#007bff" />
              <Text style={styles.detailLabel}>Filling Type:</Text>
            </View>
            <Text style={styles.detail}>{job.stockItem.door.fillingType}</Text>
          </>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {job.progress === 'new' && (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={handleAssignToMe}
            >
              <Text style={styles.buttonText}>Assign to Me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => actionSheetRef.current.show()}
            >
              <Text style={styles.buttonText}>Select Image</Text>
            </TouchableOpacity>
          </>
        )}

        {job.progress === 'pending' && (
          <TouchableOpacity
            style={styles.button}
            onPress={handleStartJob}
          >
            <Text style={styles.buttonText}>Start Job</Text>
          </TouchableOpacity>
        )}

        {job.progress === 'processing' && (
          <TouchableOpacity
            style={styles.button}
            onPress={handleCompleteJob}
          >
            <Text style={styles.buttonText}>Complete Job</Text>
          </TouchableOpacity>
        )}
      </View>

      <ActionSheet
        ref={actionSheetRef}
        title="Choose an option"
        options={['Take a Photo', 'Choose from Gallery', 'Cancel']}
        cancelButtonIndex={2}
        onPress={handleActionSheet}
      />

      {cameraVisible && (
        <View style={styles.cameraContainer}>
          <Camera style={styles.camera} ref={cameraRef} />
          <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
            <Text style={styles.cameraButtonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => setCameraVisible(false)}
          >
            <Text style={styles.cameraButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedImage && (
        <View style={styles.selectedImageContainer}>
          <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  noImageContainer: {
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#9e9e9e',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
  },
  statusBadge: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  detailsCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 10,
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginLeft: 10,
  },
  detail: {
    marginLeft: 10,
    fontSize: 16,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  camera: {
    width: '100%',
    height: '80%',
  },
  cameraButton: {
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedImageContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    textAlign: 'center',
    color: 'red',
  },
});

export default JobView;
