import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useRoute,useNavigation } from "@react-navigation/native";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { styles } from "../screens/JobViewStyles";
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../config';
import * as ImageManipulator from 'expo-image-manipulator';

const JobView = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { jobId } = route.params as { jobId: string };
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [selectedAsset, setselectedAsset] = useState<any>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/employee/job/${jobId}`
        );
        setJob(response.data.data);
      } catch (err) {
        setError("Failed to fetch job details");
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
      Toast.show({
        type: 'success',
        text1: 'Job Assigned',
        text2: 'The job has been successfully Assign To You.'
      });
      navigation.navigate('MainList');
    } catch (err) {
      setError('Failed to assign job');
      oast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to start the job.'
      });
      setError("Failed to start the job");
    }
  };

  const handleStartJob = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/employee/job/start/${jobId}`);
      setJob((prevJob: any) => ({ ...prevJob, progress: "PROCESSING" }));
      Toast.show({
        type: 'success',
        text1: 'Job Started',
        text2: 'The job has been successfully started.'
      });
      navigation.navigate('PendingList');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to start the job.'
      });
      setError("Failed to start the job");
    }
  };

  const handleCompleteJob = async () => {
    if (job.creationType === "NEW") {
      if (!selectedImage) {
        Alert.alert(
          "Image Required",
          "Please upload an image before completing this job."
        );
        return;
      }

      try {
        // Prepare FormData
        const formData = new FormData();

        // Add the image to FormData
        formData.append("image", {
          uri: selectedAsset.uri,
          type: 'image/jpeg',
          name: 'photo.jpg'
        });

        console.log("FormData:", formData);
        console.log("API URL:", `${API_BASE_URL}/api/employee/job/done/${jobId}`);

        const response = await axios.put(
          `${API_BASE_URL}/api/employee/job/done/${jobId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            transformRequest: (data, headers) => {
              return formData;
            },
            timeout: 30000, // 30 seconds
          }
        );

        console.log("Response:", response.data);

        // Update job status to 'done'
        setJob((prevJob) => ({ ...prevJob, progress: "done" }));
        navigation.navigate('PendingList');
        Toast.show({
          type: 'success',
          text1: 'Job Completed',
          text2: 'The job has been successfully completed with image upload.'
        });
      } catch (err) {
        console.error("Error completing job with image:", err);
        if (axios.isAxiosError(err)) {
          console.error("Axios error details:", {
            message: err.message,
            code: err.code,
            config: err.config,
            response: err.response?.data
          });
        }
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to complete the job with image.'
        });
        setError("Failed to complete the job with image");
      }
    } else {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/api/employee/job/done/${jobId}`
        );
        setJob((prevJob) => ({ ...prevJob, progress: "done" }));
        Toast.show({
          type: 'success',
          text1: 'Job Completed',
          text2: 'The job has been successfully completed.'
        });
        navigation.navigate('PendingList');
      } catch (err) {
        console.error("Error completing job:", err);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to complete the job.'
        });
        navigation.navigate('PendingList');
        setError("Failed to complete the job");
      }
    }
  };

  const selectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    handleImageResult(result);
  };

  const captureImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    handleImageResult(result);
  };

  const compressImage = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1000 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result;
  };

  const handleImageResult = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      const compressedImage = await compressImage(selectedAsset.uri);
      console.log("Compressed Image:", compressedImage);
      setselectedAsset(compressedImage);
      setSelectedImage({
        uri: compressedImage.uri,
        type: "image/jpeg",
        name: compressedImage.uri.split("/").pop() || "photo.jpg",
      });
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#6200ea" style={styles.loading} />
    );
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (!job) {
    return <Text style={styles.error}>No job details found</Text>;
  }

  const renderStatusBadge = (status: string) => {
    let statusColor = "#f0ad4e"; // default color for status
    if (status === "done") statusColor = "#28a745";
    if (status === "processing") statusColor = "#007bff";
    if (status === "pending") statusColor = "#ffc107";
    if (status === "new") statusColor = "#dc3545";

    return (
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{status.toUpperCase()}</Text>
      </View>
    );
  };

  const quotation = job.quotation?.doorQuotation || job.quotation?.windowsQuotation;
  const product = job.stockItem?.windows || job.stockItem?.door;
  const design = quotation?.design;
  const customer = job.quotation?.customer?.user;
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {(design?.image || product?.image) ? (
          <Image source={{ uri: design?.image || product?.image }} style={styles.image} />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No Image Available</Text>
          </View>
        )}
        <Text style={styles.title}>{design?.name || 'Unnamed Item'}</Text>
        <Text style={styles.subtitle}>Code: {design?.code || 'N/A'}</Text>
        {renderStatusBadge(job.progress || 'unknown')}
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.row}>
          <Icon name="info" size={20} color="#007bff" />
          <Text style={styles.detailLabel}>Job Type:</Text>
        </View>
        <Text style={styles.detail}>{job.type || 'N/A'}</Text>

        <View style={styles.row}>
          <Icon name="date-range" size={20} color="#007bff" />
          <Text style={styles.detailLabel}>Due Date:</Text>
        </View>
        <Text style={styles.detail}>{job.dueDate || 'Not specified'}</Text>

        <View style={styles.row}>
          <Icon name="inbox" size={20} color="#007bff" />
          <Text style={styles.detailLabel}>Quantity:</Text>
        </View>
        <Text style={styles.detail}>{job.qty || 'N/A'}</Text>

        {quotation?.height && (
          <>
            <View style={styles.row}>
              <Icon name="height" size={20} color="#007bff" />
              <Text style={styles.detailLabel}>Height:</Text>
            </View>
            <Text style={styles.detail}>{quotation.height} mm</Text>
          </>
        )}

        {quotation?.width && (
          <>
            <View style={styles.row}>
              <Icon name="straighten" size={20} color="#007bff" />
              <Text style={styles.detailLabel}>Width:</Text>
            </View>
            <Text style={styles.detail}>{quotation.width} mm</Text>
          </>
        )}

        {quotation?.color && (
          <>
            <View style={styles.row}>
              <Icon name="palette" size={20} color="#007bff" />
              <Text style={styles.detailLabel}>Color:</Text>
            </View>
            <Text style={styles.detail}>{quotation.color || 'Not specified'}</Text>
          </>
        )}

        {customer && (
          <>
            <View style={styles.row}>
              <Icon name="person" size={20} color="#007bff" />
              <Text style={styles.detailLabel}>Customer:</Text>
            </View>
            <Text style={styles.detail}>{`${customer.firstName} ${customer.lastName}`}</Text>
            <Text style={styles.detail}>{customer.contact}</Text>
            <Text style={styles.detail}>{customer.address}</Text>
          </>
        )}
      </View>

      <View style={styles.actionContainer}>
      {job.progress === 'NEW' && (
          <TouchableOpacity style={styles.actionButton} onPress={handleAssignToMe}>
            <Text style={styles.actionButtonText}>Assign To Me</Text>
          </TouchableOpacity>
        )}
      {job.progress === "PROCESSING" && job.creationType === "NEW" && (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={selectImage}>
              <Text style={styles.actionButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={captureImage}>
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </>
        )}

        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Text>Selected Image:</Text>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.imagePreview}
            />
          </View>
        )}
        {job.progress === "PENDING" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStartJob}
          >
            <Text style={styles.actionButtonText}>Start the Job</Text>
          </TouchableOpacity>
        )}

        {job.progress === "PROCESSING" && (selectedImage || job.creationType != "NEW") && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCompleteJob}
          >
            <Text style={styles.actionButtonText}>Complete the Job</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};
export default JobView;
