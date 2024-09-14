import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';



const JobVeiw = () => {
  const route = useRoute();
  const { jobId } = route.params as { jobId: string };
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const API_BASE_URL='http://20.2.211.30:8080';

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
      await axios.post(`${API_BASE_URL}/api/employee/job/start/${jobId}`);
      setJob((prevJob: any) => ({ ...prevJob, progress: 'processing' }));
    } catch (err) {
      setError('Failed to start the job');
    }
  };

  // Handle image upload and completion of the job
  const handleCompleteJob = async () => {
    if (job.creationType === 'NEW') {
      if (!selectedImage) {
        // Show alert if no image is selected
        Alert.alert('Image Required', 'Please upload an image before completing this job.');
        return;
      }
  
      // Now that an image is selected, upload it along with the job completion request
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage.uri,
        name: selectedImage.fileName,
        type: selectedImage.type,
      });
  
      try {
        const uploadResponse = await axios.post(
          `${API_BASE_URL}/api/employee/job/done/new/${jobId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
  
       
        setJob((prevJob: any) => ({ ...prevJob, progress: 'done' }));
      } catch (err) {
        setError('Failed to complete the job with image');
      }
    } else {
      try {
        // If creationType is not NEW, use the normal endpoint
        await axios.post(`${API_BASE_URL}/api/employee/job/done/${jobId}`);
        setJob((prevJob: any) => ({ ...prevJob, progress: 'done' }));
      } catch (err) {
        setError('Failed to complete the job');
      }
    }
  };
  

  // Function to handle image selection
  const selectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });

    if (result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0]); // Store the selected image
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
    let statusColor = '#f0ad4e'; // default color for status
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {job.stockItem.door.image ? (
          <Image source={{ uri: job.stockItem.door.image }} style={styles.image} />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No Image Available</Text>
          </View>
        )}
        <Text style={styles.title}>{job.stockItem.door.name}</Text>
        <Text style={styles.subtitle}>Code: {job.stockItem.door.code}</Text>
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

        {/* Additional door details */}
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

      <View style={styles.actionContainer}>
        {/* If job is NEW and image needs to be uploaded */}
        {job.progress === 'PROCESSING' && job.creationType === 'NEW' && (
          <TouchableOpacity style={styles.actionButton} onPress={selectImage}>
            <Text style={styles.actionButtonText}>Upload Image</Text>
          </TouchableOpacity>
        )}

        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Text>Selected Image:</Text>
            <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
          </View>
        )}

        {job.progress === 'PROCESSING' && (
          <TouchableOpacity style={styles.actionButton} onPress={handleCompleteJob}>
            <Text style={styles.actionButtonText}>Complete the Job</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  noImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#cccccc',
  },
  noImageText: {
    color: '#666666',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
  },
  detailsCard: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888888',
    marginLeft: 8,
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333333',
  },
  actionContainer: {
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
    color: '#ff0000',
  },
  imagePreviewContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
});

export default JobVeiw;
