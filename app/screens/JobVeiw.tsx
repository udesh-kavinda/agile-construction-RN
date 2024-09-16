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

// Update the component name from JobVeiw to JobView
const JobView = () => {
  const route = useRoute();
  const { jobId } = route.params as { jobId: string };
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [selectedAsset, setselectedAsset] = useState<any>(null);
  const API_BASE_URL = "http://192.168.8.111:8080";

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
      setJob((prevJob: any) => ({ ...prevJob, progress: "pending" }));
    } catch (err) {
      setError("Failed to assign job");
    }
  };

  const handleStartJob = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/employee/job/start/${jobId}`);
      setJob((prevJob: any) => ({ ...prevJob, progress: "processing" }));

      // Navigate back to the PendingList after starting the job
      navigation.navigate('PendingList');
    } catch (err) {
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
        const formData: FormData = new FormData();

        // Fetch the image URI and convert it to a Blob
        const res = await fetch(selectedAsset.uri);
        const image = await res.blob();
        const imageName = "photo.jpg"; // Default to 'photo.jpg' if name is missing

        formData.append("image", image, imageName);

        const response = await axios.put(
          `${API_BASE_URL}/api/employee/job/done/${jobId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Update job status to 'done'
        setJob((prevJob) => ({ ...prevJob, progress: "done" }));

        // Navigate back to the PendingList after completing the job
        navigation.navigate('PendingList');
      } catch (err) {
        console.error("Error completing job with image:", err);
        setError("Failed to complete the job with image");
      }
    } else {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/api/employee/job/done/${jobId}`
        );
        setJob((prevJob) => ({ ...prevJob, progress: "done" }));

        // Navigate back to the PendingList after completing the job
        navigation.navigate('PendingList');
      } catch (err) {
        console.error("Error completing job:", err);
        setError("Failed to complete the job");
      }
    }
  };

  // Function to handle image selection from the gallery
  const selectImage = async () => {
    // Request permission to access the gallery
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];

      // Log the selected image data for debugging
      console.log("Selected Image:", selectedAsset);
      setselectedAsset(selectedAsset);

      setSelectedImage({
        uri: selectedAsset.uri,
        type: "image/jpeg",
        name: selectedAsset.uri.split("/").pop() || "photo.jpg",
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
  const itemDetail = job.stockItem.door || job.stockItem.windows;
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
        {job.progress === "PROCESSING" && job.creationType === "NEW" && (
          <TouchableOpacity style={styles.actionButton} onPress={selectImage}>
            <Text style={styles.actionButtonText}>Upload Image</Text>
          </TouchableOpacity>
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

        {job.progress === "PROCESSING" && selectedImage && (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  noImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: "#888",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginVertical: 8,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
  },
  detailsCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  detail: {
    fontSize: 16,
    color: "#333",
  },
  actionContainer: {
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  imagePreviewContainer: {
    marginVertical: 16,
    alignItems: "center",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
  },
  error: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    color: "red",
  },
});

export default JobView;
